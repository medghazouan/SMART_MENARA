<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Superviseur;
use App\Models\Pointeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function loginSuperviseur(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $superviseur = Superviseur::where('email', $request->email)->first();

        if (!$superviseur || !Hash::check($request->password, $superviseur->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        $token = $superviseur->createToken('superviseur-token')->plainTextToken;

        return response()->json([
            'user' => $superviseur,
            'token' => $token,
            'type' => 'superviseur'
        ]);
    }

    public function loginPointeur(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $pointeur = Pointeur::where('email', $request->email)->first();

        if (!$pointeur || !Hash::check($request->password, $pointeur->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        $token = $pointeur->createToken('pointeur-token')->plainTextToken;

        return response()->json([
            'user' => $pointeur,
            'token' => $token,
            'type' => 'pointeur'
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
        return response()->json($request->user());
    }
}