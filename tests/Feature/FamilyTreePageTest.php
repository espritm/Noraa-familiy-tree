<?php

namespace Tests\Feature;

use Tests\TestCase;

class FamilyTreePageTest extends TestCase
{
    public function test_root_redirects_to_the_family_tree(): void
    {
        $this->get('/')->assertRedirect('/familiy-tree');
    }

    public function test_family_tree_page_renders_french_fictional_content(): void
    {
        $this->get('/familiy-tree')
            ->assertOk()
            ->assertSee('Notre arbre familial')
            ->assertSee('Données fictives')
            ->assertSee('Rechercher une personne')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertHeaderMissing('X-Powered-By');
    }
}
