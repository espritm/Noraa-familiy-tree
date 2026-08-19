<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\View\View;

class FamilyAccessController extends Controller
{
    public function show(Request $request): View|RedirectResponse
    {
        if ($request->session()->get('family_access_authenticated', false)) {
            return redirect()->route('family-tree');
        }

        return view('family-access.login');
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'max:1024'],
        ], [
            'password.required' => 'Veuillez saisir le mot de passe familial.',
        ]);

        $key = $this->rateLimitKey($request);
        $maxAttempts = config('family-access.max_attempts');

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return back()
                ->withErrors(['password' => $this->rateLimitMessage($key)])
                ->setStatusCode(429);
        }

        $hash = config('family-access.password_hash');

        if (! is_string($hash) || $hash === '') {
            abort(503, 'Family access is not configured.');
        }

        if (! password_verify($validated['password'], $hash)) {
            RateLimiter::hit($key, config('family-access.decay_seconds'));

            return back()
                ->withErrors(['password' => 'Le mot de passe est incorrect.']);
        }

        RateLimiter::clear($key);
        $request->session()->regenerate();
        $request->session()->put('family_access_authenticated', true);

        return redirect()->intended(route('family-tree'));
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('family-access.login');
    }

    private function rateLimitKey(Request $request): string
    {
        return 'family-access:'.hash('sha256', (string) $request->ip());
    }

    private function rateLimitMessage(string $key): string
    {
        $minutes = max(1, (int) ceil(RateLimiter::availableIn($key) / 60));

        return "Trop de tentatives. Réessayez dans {$minutes} minute(s).";
    }
}
