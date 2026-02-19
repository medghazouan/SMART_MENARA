<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\Superviseur;
use App\Models\Pointeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Try Superviseur first
        $superviseur = Superviseur::where('email', $request->email)->first();
        
        if ($superviseur && Hash::check($request->password, $superviseur->password)) {
            $token = $superviseur->createToken('auth-token')->plainTextToken;
            
            return response()->json([
                'user' => $superviseur,
                'token' => $token,
                'type' => 'superviseur'
            ]);
        }

        // Try Pointeur
        $pointeur = Pointeur::where('email', $request->email)->first();
        
        if ($pointeur && Hash::check($request->password, $pointeur->password)) {
            $token = $pointeur->createToken('auth-token')->plainTextToken;
            
            return response()->json([
                'user' => $pointeur,
                'token' => $token,
                'type' => 'pointeur'
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['Les informations d\'identification fournies sont incorrectes.'],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $type = $user instanceof Superviseur ? 'superviseur' : 'pointeur';

        return response()->json([
            'user' => $user,
            'type' => $type,
        ]);
    }
}
