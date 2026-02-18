<?php

namespace App\Http\Middleware;

use App\Models\Pointeur;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePointeur
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() instanceof Pointeur) {
            return response()->json([
                'message' => 'Accès réservé aux pointeurs.'
            ], 403);
        }

        return $next($request);
    }
}
