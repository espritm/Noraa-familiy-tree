<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use JsonException;
use RuntimeException;

class FamilyTreeController extends Controller
{
    public function show(): Response
    {
        $configuredPath = config('family-data.path');

        if (! is_string($configuredPath) || $configuredPath === '' || ! is_file($configuredPath)) {
            return $this->treeResponse([
                'familyData' => null,
                'isPrivateData' => false,
            ]);
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

        if (! is_array($decoded) || ! is_array($decoded['people'] ?? null) || ! is_array($decoded['parentage'] ?? null)) {
            throw new RuntimeException('The private family dataset does not contain the required collections.');
        }

        $people = collect($decoded['people'])
            ->filter(fn (mixed $person): bool => is_array($person) && is_string($person['id'] ?? null) && $person['id'] !== '')
            ->map(fn (array $person): array => Arr::only($person, [
                'id',
                'given_names',
                'birth_name',
                'customary_name',
                'birth_date',
                'death_date',
                'living_status',
            ]))
            ->values();

        $personIds = $people->pluck('id')->all();
        $parentage = collect($decoded['parentage'])
            ->filter(fn (mixed $relationship): bool => is_array($relationship)
                && in_array($relationship['parent_id'] ?? null, $personIds, true)
                && in_array($relationship['child_id'] ?? null, $personIds, true)
                && ($relationship['parent_id'] ?? null) !== ($relationship['child_id'] ?? null))
            ->map(fn (array $relationship): array => Arr::only($relationship, [
                'parent_id',
                'child_id',
                'type',
                'confidence',
            ]))
            ->values();

        return $this->treeResponse([
            'familyData' => [
                'people' => $people,
                'parentage' => $parentage,
            ],
            'isPrivateData' => true,
        ]);
    }

    private function treeResponse(array $data): Response
    {
        return response()
            ->view('family-tree', $data)
            ->header('Cache-Control', 'private, no-store, max-age=0')
            ->header('Pragma', 'no-cache');
    }
}
