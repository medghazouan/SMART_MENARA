<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Superviseur;
use App\Models\Pointeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $superviseur = Superviseur::create($validated);
        $token = $superviseur->createToken('superviseur-token')->plainTextToken;

        return response()->json([
            'user' => $superviseur,
            'token' => $token,
            'type' => 'superviseur',
        ], 201);
    }

    public function login(LoginRequest $request)
    {

        $superviseur = Superviseur::where('email', $request->email)->first();
        if ($superviseur && Hash::check($request->password, $superviseur->password)) {
            $token = $superviseur->createToken('superviseur-token')->plainTextToken;

            return response()->json([
                'user' => $superviseur,
                'token' => $token,
                'type' => 'superviseur',
            ]);
        }

        $pointeur = Pointeur::where('email', $request->email)->first();
        if ($pointeur && Hash::check($request->password, $pointeur->password)) {
            $token = $pointeur->createToken('pointeur-token')->plainTextToken;

            return response()->json([
                'user' => $pointeur,
                'token' => $token,
                'type' => 'pointeur',
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

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $isSuperviseur = $user instanceof Superviseur;
        $table = $isSuperviseur ? 'superviseurs' : 'pointeurs';

        $rules = [
            'nom' => 'sometimes|string|max:100',
            'email' => "sometimes|email|max:150|unique:{$table},email,{$user->matricule},matricule",
            'phone' => 'nullable|string|max:20',
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|string|min:6|confirmed',
        ];

        if ($isSuperviseur) {
            $rules['region'] = 'nullable|string|max:100';
        }

        $validated = $request->validate($rules);

        if (isset($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Le mot de passe actuel est incorrect.'],
                ]);
            }
            $validated['password'] = Hash::make($validated['password']);
        }

        unset($validated['current_password'], $validated['password_confirmation']);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user->fresh(),
        ]);
    }
}
