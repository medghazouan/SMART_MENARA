<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pointeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PointeurController extends Controller
{
    public function index()
    {
        $pointeurs = Pointeur::with('carriere')->get();
        return response()->json($pointeurs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => 'required|integer|unique:pointeurs,matricule',
            'nom' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:pointeurs,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'carriere_id' => 'required|exists:carrieres,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $pointeur = Pointeur::create($validated);

        return response()->json([
            'message' => 'Pointeur créé avec succès',
            'pointeur' => $pointeur->load('carriere')
        ], 201);
    }

    public function show(string $id)
    {
        $pointeur = Pointeur::with(['carriere', 'pannes'])->findOrFail($id);
        return response()->json($pointeur);
    }

    public function update(Request $request, string $id)
    {
        $pointeur = Pointeur::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|max:150|unique:pointeurs,email,' . $id . ',matricule',
            'phone' => 'nullable|string|max:20',
            'password' => 'sometimes|string|min:6',
            'carriere_id' => 'sometimes|exists:carrieres,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $pointeur->update($validated);

        return response()->json([
            'message' => 'Pointeur mis à jour avec succès',
            'pointeur' => $pointeur->load('carriere')
        ]);
    }

    public function destroy(string $id)
    {
        $pointeur = Pointeur::findOrFail($id);
        $pointeur->delete();

        return response()->json([
            'message' => 'Pointeur supprimé avec succès'
        ]);
    }
}
