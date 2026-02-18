<?php

namespace App\Http\Middleware;

use App\Models\Superviseur;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperviseur
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() instanceof Superviseur) {
            return response()->json([
                'message' => 'Accès réservé aux superviseurs.'
            ], 403);
        }

        return $next($request);
    }
}
