<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carriere;
use Illuminate\Http\Request;

class CarriereController extends Controller
{
    public function index(Request $request)
    {
        $query = Carriere::with(['superviseur', 'pointeurs', 'materiels']);

        if ($request->filled('superviseur_id')) {
            $query->where('superviseur_id', $request->superviseur_id);
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        $carrieres = $query->get();

        return response()->json($carrieres);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'region' => 'nullable|string|max:100',
        ]);

        $validated['superviseur_id'] = $request->user()->matricule;

        $carriere = Carriere::create($validated);

        return response()->json([
            'message' => 'Carrière créée avec succès',
            'carriere' => $carriere->load('superviseur')
        ], 201);
    }

    public function show($id)
    {
        $carriere = Carriere::with([
            'superviseur',
            'pointeurs',
            'materiels',
            'pannes' => function ($query) {
                $query->latest()->limit(10);
            }
        ])->findOrFail($id);

        return response()->json($carriere);
    }

    public function update(Request $request, $id)
    {
        $carriere = Carriere::findOrFail($id);

        if ($carriere->superviseur_id !== $request->user()->matricule) {
            return response()->json([
                'message' => 'Cette carrière ne vous appartient pas.'
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'region' => 'nullable|string|max:100',
        ]);

        $carriere->update($validated);

        return response()->json([
            'message' => 'Carrière mise à jour avec succès',
            'carriere' => $carriere->load('superviseur')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $carriere = Carriere::findOrFail($id);

        if ($carriere->superviseur_id !== $request->user()->matricule) {
            return response()->json([
                'message' => 'Cette carrière ne vous appartient pas.'
            ], 403);
        }

        $carriere->delete();

        return response()->json([
            'message' => 'Carrière supprimée avec succès'
        ]);
    }
}
