<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Superviseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SuperviseurController extends Controller
{
    public function index()
    {
        $superviseurs = Superviseur::with('carrieres')->get();
        return response()->json($superviseurs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => 'required|integer|unique:superviseurs,matricule',
            'nom' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:superviseurs,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'region' => 'nullable|string|max:100',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $superviseur = Superviseur::create($validated);

        return response()->json([
            'message' => 'Superviseur créé avec succès',
            'superviseur' => $superviseur->load('carrieres')
        ], 201);
    }

    public function show(string $id)
    {
        $superviseur = Superviseur::with('carrieres')->findOrFail($id);
        return response()->json($superviseur);
    }

    public function update(Request $request, string $id)
    {
        $superviseur = Superviseur::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|max:150|unique:superviseurs,email,' . $id . ',matricule',
            'phone' => 'nullable|string|max:20',
            'password' => 'sometimes|string|min:6',
            'region' => 'nullable|string|max:100',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $superviseur->update($validated);

        return response()->json([
            'message' => 'Superviseur mis à jour avec succès',
            'superviseur' => $superviseur->load('carrieres')
        ]);
    }

    public function destroy(string $id)
    {
        $superviseur = Superviseur::findOrFail($id);
        $superviseur->delete();

        return response()->json([
            'message' => 'Superviseur supprimé avec succès'
        ]);
    }
}
