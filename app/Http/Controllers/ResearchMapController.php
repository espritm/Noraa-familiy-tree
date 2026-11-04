<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use JsonException;
use RuntimeException;

class ResearchMapController extends Controller
{
    public function show(): Response
    {
        $configuredPath = config('family-data.path');

        if (! is_string($configuredPath) || $configuredPath === '' || ! is_file($configuredPath)) {
            return $this->researchResponse(['researchData' => null, 'researchStats' => null]);
        }

        $realPath = realpath($configuredPath);
        $publicPath = realpath(public_path());

        if ($realPath === false || ($publicPath !== false && str_starts_with($realPath, $publicPath.DIRECTORY_SEPARATOR))) {
            throw new RuntimeException('The private family dataset must be stored outside the public directory.');
        }

        try {
            $decoded = json_decode(file_get_contents($realPath), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('The private family dataset is not valid JSON.', previous: $exception);
        }

        $research = $decoded['research'] ?? null;
        if (! is_array($research) || ! is_array($research['people'] ?? null)) {
            return $this->researchResponse(['researchData' => null, 'researchStats' => null]);
        }

        $people = collect($research['people'])
            ->filter(fn (mixed $person): bool => is_array($person)
                && is_string($person['id'] ?? null)
                && $person['id'] !== ''
                && is_string($person['display_name'] ?? null))
            ->map(fn (array $person): array => Arr::only($person, [
                'id', 'display_name', 'variants', 'birth', 'death', 'confidence',
                'zone', 'displayed_in_tree', 'source_refs',
            ]))
            ->values();

        $personIds = $people->pluck('id')->all();
        $parentage = collect($research['parentage'] ?? [])
            ->filter(fn (mixed $relation): bool => is_array($relation)
                && in_array($relation['parent_id'] ?? null, $personIds, true)
                && in_array($relation['child_id'] ?? null, $personIds, true)
                && $relation['parent_id'] !== $relation['child_id'])
            ->map(fn (array $relation): array => Arr::only($relation, [
                'parent_id', 'child_id', 'confidence', 'source_refs',
            ]))
            ->values();

        $couples = collect($research['couples'] ?? [])
            ->filter(fn (mixed $relation): bool => is_array($relation)
                && is_array($relation['people'] ?? null)
                && count($relation['people']) === 2
                && count(array_unique($relation['people'])) === 2
                && collect($relation['people'])->every(fn (mixed $id): bool => in_array($id, $personIds, true)))
            ->map(fn (array $relation): array => Arr::only($relation, ['people', 'confidence', 'source_refs']))
            ->values();

        $zones = collect($research['zones'] ?? [])
            ->filter(fn (mixed $zone): bool => is_array($zone) && is_string($zone['id'] ?? null))
            ->map(fn (array $zone): array => Arr::only($zone, [
                'id', 'title', 'description', 'tone', 'people_count',
            ]))
            ->values();

        $cards = fn (string $key) => collect($research[$key] ?? [])
            ->filter(fn (mixed $card): bool => is_array($card) && is_string($card['id'] ?? null))
            ->map(fn (array $card): array => Arr::only($card, [
                'id', 'title', 'status', 'priority', 'summary', 'impact',
                'impact_people_count', 'needed_evidence', 'source_refs', 'focus_person_ids',
            ]))
            ->values();

        return $this->researchResponse([
            'researchData' => [
                'people' => $people,
                'parentage' => $parentage,
                'couples' => $couples,
                'zones' => $zones,
                'discoveries' => $cards('discoveries'),
                'missing_links' => $cards('missing_links'),
            ],
            'researchStats' => [
                'displayed' => count($decoded['people'] ?? []),
                'total' => $people->count(),
                'openLinks' => count($research['missing_links'] ?? []),
            ],
        ]);
    }

    private function researchResponse(array $data): Response
    {
        return response()
            ->view('research-map', $data)
            ->header('Cache-Control', 'private, no-store, max-age=0')
            ->header('Pragma', 'no-cache');
    }
}
