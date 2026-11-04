<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class FamilyTreePageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('family-access.password_hash', password_hash('correct horse battery staple', PASSWORD_DEFAULT));
        config()->set('family-access.max_attempts', 5);
        config()->set('family-access.decay_seconds', 900);
        RateLimiter::clear('family-access:'.hash('sha256', '127.0.0.1'));
    }

    public function test_public_home_is_available_without_authentication(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Accéder à l’arbre familial');
    }

    public function test_family_tree_redirects_guests_without_rendering_tree_content(): void
    {
        $this->get('/family-tree')
            ->assertRedirect('/family-tree/login')
            ->assertDontSee('Notre arbre familial');
    }

    public function test_research_map_redirects_guests(): void
    {
        $this->get('/family-tree/research')
            ->assertRedirect('/family-tree/login')
            ->assertDontSee('Carte de recherche');
    }

    public function test_misspelled_legacy_paths_are_not_available(): void
    {
        $this->get('/familiy-tree')->assertNotFound();
        $this->get('/familiy-tree/login')->assertNotFound();
        $this->post('/familiy-tree/login', ['password' => 'irrelevant'])->assertNotFound();
    }

    public function test_login_page_has_security_headers_and_password_form(): void
    {
        $this->get('/family-tree/login')
            ->assertOk()
            ->assertSee('Accès à l’arbre familial')
            ->assertSee('autocomplete="current-password"', false)
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertHeaderMissing('X-Powered-By');
    }

    public function test_correct_password_authenticates_and_reveals_fictional_tree(): void
    {
        $this->post('/family-tree/login', [
            'password' => 'correct horse battery staple',
        ])->assertRedirect('/family-tree');

        $this->assertTrue(session('family_access_authenticated'));

        $this->get('/family-tree')
            ->assertOk()
            ->assertSee('Notre arbre familial')
            ->assertSee('Données fictives')
            ->assertSee('Rechercher une personne')
            ->assertSee('Se déconnecter');
    }

    public function test_authenticated_tree_loads_only_whitelisted_private_data_without_caching(): void
    {
        $privateDirectory = storage_path('framework/testing/family-tree');
        $privatePath = $privateDirectory.'/family.json';
        File::ensureDirectoryExists($privateDirectory);
        File::put($privatePath, json_encode([
            'people' => [[
                'id' => 'fictional-private-person',
                'given_names' => ['Éloïse'],
                'birth_name' => 'Testeur',
                'birth_date' => '2001-02-03',
                'internal_note' => 'must-never-reach-the-browser',
            ]],
            'parentage' => [],
            'statistics' => ['research_people_count' => 3],
            'review_notes' => ['private-review-marker'],
        ], JSON_THROW_ON_ERROR));
        config()->set('family-data.path', $privatePath);

        try {
            $this->withSession(['family_access_authenticated' => true])
                ->get('/family-tree')
                ->assertOk()
                ->assertSee('Données familiales')
                ->assertSee('Éloïse')
                ->assertSee('1</strong> personnes affichées sur <strong>3', false)
                ->assertDontSee('must-never-reach-the-browser')
                ->assertDontSee('private-review-marker')
                ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
                ->assertHeader('Pragma', 'no-cache');
        } finally {
            File::deleteDirectory($privateDirectory);
        }
    }

    public function test_authenticated_research_map_loads_sanitized_private_research_data(): void
    {
        $privateDirectory = storage_path('framework/testing/research-map');
        $privatePath = $privateDirectory.'/family.json';
        File::ensureDirectoryExists($privateDirectory);
        File::put($privatePath, json_encode([
            'people' => [['id' => 'tree-person']],
            'parentage' => [],
            'research' => [
                'people' => [[
                    'id' => 'research-person',
                    'display_name' => 'Émile Exemple',
                    'confidence' => 'probable',
                    'zone' => 'open-branch',
                    'displayed_in_tree' => false,
                    'source_refs' => ['carnet:22'],
                    'internal_note' => 'must-never-reach-the-browser',
                ]],
                'parentage' => [],
                'couples' => [],
                'zones' => [[
                    'id' => 'open-branch',
                    'title' => 'Branche ouverte',
                    'description' => 'À raccorder',
                    'tone' => 'unconnected',
                    'people_count' => 1,
                ]],
                'discoveries' => [],
                'missing_links' => [[
                    'id' => 'missing-parent',
                    'title' => 'Parent inconnu',
                    'status' => 'open',
                    'priority' => 1,
                    'summary' => 'Une preuve est nécessaire.',
                    'impact_people_count' => 1,
                    'focus_person_ids' => ['research-person'],
                    'private_reasoning' => 'must-also-stay-private',
                ]],
            ],
        ], JSON_THROW_ON_ERROR));
        config()->set('family-data.path', $privatePath);

        try {
            $this->withSession(['family_access_authenticated' => true])
                ->get('/family-tree/research')
                ->assertOk()
                ->assertSee('Carte de recherche')
                ->assertSee('Émile Exemple')
                ->assertSee('Parent inconnu')
                ->assertSee('Arbre familial')
                ->assertDontSee('must-never-reach-the-browser')
                ->assertDontSee('must-also-stay-private')
                ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
                ->assertHeader('Pragma', 'no-cache');
        } finally {
            File::deleteDirectory($privateDirectory);
        }
    }

    public function test_wrong_password_is_rejected_without_entering_it_in_session(): void
    {
        $this->from('/family-tree/login')->post('/family-tree/login', [
            'password' => 'incorrect',
        ])->assertRedirect('/family-tree/login')
            ->assertSessionHasErrors('password')
            ->assertSessionMissing('_old_input.password');

        $this->assertFalse(session('family_access_authenticated', false));
    }

    public function test_repeated_failures_are_rate_limited(): void
    {
        foreach (range(1, 5) as $attempt) {
            $this->post('/family-tree/login', ['password' => "wrong-{$attempt}"])
                ->assertRedirect();
        }

        $this->post('/family-tree/login', ['password' => 'wrong-again'])
            ->assertStatus(429)
            ->assertSessionHasErrors('password');
    }

    public function test_logout_invalidates_family_access(): void
    {
        $this->withSession(['family_access_authenticated' => true])
            ->post('/family-tree/logout')
            ->assertRedirect('/family-tree/login')
            ->assertSessionMissing('family_access_authenticated');
    }
}
