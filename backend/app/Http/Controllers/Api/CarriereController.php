<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carriere;
use Illuminate\Http\Request;

class CarriereController extends Controller
{
    /**
     * Display a listing of carrieres
     */
    public function index(Request $request)
    {
        $query = Carriere::with(['superviseur', 'pointeurs', 'materiels']);

        // Filter by superviseur if provided
        if ($request->has('superviseur_id')) {
            $query->where('superviseur_id', $request->superviseur_id);
        }

        // Filter by region
        if ($request->has('region')) {
            $query->where('region', $request->region);
        }

        $carrieres = $query->get();

        return response()->json($carrieres);
    }

    /**
     * Store a newly created carriere
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'region' => 'nullable|string|max:100',
            'superviseur_id' => 'required|exists:superviseurs,matricule',
        ]);

        $carriere = Carriere::create($validated);

        return response()->json([
            'message' => 'Carrière créée avec succès',
            'carriere' => $carriere->load('superviseur')
        ], 201);
    }

    /**
     * Display the specified carriere
     */
    public function show($id)
    {
        $carriere = Carriere::with([
            'superviseur',
            'pointeurs',
            'materiels',
            'pannes' => function($query) {
                $query->latest()->limit(10);
            }
        ])->findOrFail($id);

        return response()->json($carriere);
    }

    /**
     * Update the specified carriere
     */
    public function update(Request $request, $id)
    {
        $carriere = Carriere::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'region' => 'nullable|string|max:100',
            'superviseur_id' => 'sometimes|exists:superviseurs,matricule',
        ]);

        $carriere->update($validated);

        return response()->json([
            'message' => 'Carrière mise à jour avec succès',
            'carriere' => $carriere->load('superviseur')
        ]);
    }

    /**
     * Remove the specified carriere
     */
    public function destroy($id)
    {
        $carriere = Carriere::findOrFail($id);
        $carriere->delete();

        return response()->json([
            'message' => 'Carrière supprimée avec succès'
        ]);
    }
}
