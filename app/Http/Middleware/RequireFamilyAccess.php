<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireFamilyAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('family_access_authenticated', false)) {
            return redirect()->guest(route('family-access.login'));
        }

        return $next($request);
    }
}
