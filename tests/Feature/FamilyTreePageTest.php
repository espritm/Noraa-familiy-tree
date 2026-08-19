<?php

namespace Tests\Feature;

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
        $this->get('/familiy-tree')
            ->assertRedirect('/familiy-tree/login')
            ->assertDontSee('Notre arbre familial');
    }

    public function test_login_page_has_security_headers_and_password_form(): void
    {
        $this->get('/familiy-tree/login')
            ->assertOk()
            ->assertSee('Accès à l’arbre familial')
            ->assertSee('autocomplete="current-password"', false)
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertHeaderMissing('X-Powered-By');
    }

    public function test_correct_password_authenticates_and_reveals_fictional_tree(): void
    {
        $this->post('/familiy-tree/login', [
            'password' => 'correct horse battery staple',
        ])->assertRedirect('/familiy-tree');

        $this->assertTrue(session('family_access_authenticated'));

        $this->get('/familiy-tree')
            ->assertOk()
            ->assertSee('Notre arbre familial')
            ->assertSee('Données fictives')
            ->assertSee('Rechercher une personne')
            ->assertSee('Se déconnecter');
    }

    public function test_wrong_password_is_rejected_without_entering_it_in_session(): void
    {
        $this->from('/familiy-tree/login')->post('/familiy-tree/login', [
            'password' => 'incorrect',
        ])->assertRedirect('/familiy-tree/login')
            ->assertSessionHasErrors('password')
            ->assertSessionMissing('_old_input.password');

        $this->assertFalse(session('family_access_authenticated', false));
    }

    public function test_repeated_failures_are_rate_limited(): void
    {
        foreach (range(1, 5) as $attempt) {
            $this->post('/familiy-tree/login', ['password' => "wrong-{$attempt}"])
                ->assertRedirect();
        }

        $this->post('/familiy-tree/login', ['password' => 'wrong-again'])
            ->assertStatus(429)
            ->assertSessionHasErrors('password');
    }

    public function test_logout_invalidates_family_access(): void
    {
        $this->withSession(['family_access_authenticated' => true])
            ->post('/familiy-tree/logout')
            ->assertRedirect('/familiy-tree/login')
            ->assertSessionMissing('family_access_authenticated');
    }
}
