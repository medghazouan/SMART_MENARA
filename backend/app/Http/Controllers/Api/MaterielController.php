<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterielRequest;
use App\Models\Materiel;
use Illuminate\Http\Request;

class MaterielController extends Controller
{
    /**
     * Display a listing of materiels
     */
    public function index(Request $request)
    {
        $query = Materiel::with('carriere');

        // Filter by carriere if provided
        if ($request->has('carriere_id')) {
            $query->where('carriere_id', $request->carriere_id);
        }

        // Filter by category
        if ($request->has('categorie')) {
            $query->where('categorie', $request->categorie);
        }

        $materiels = $query->get();

        return response()->json($materiels);
    }

    /**
     * Store a newly created materiel
     */
    public function store(StoreMaterielRequest $request)
    {
        $validated = $request->validated();
        $materiel = Materiel::create($validated);

        return response()->json([
            'message' => 'Matériel créé avec succès',
            'materiel' => $materiel->load('carriere')
        ], 201);
    }

    /**
     * Display the specified materiel
     */
    public function show($id)
    {
        $materiel = Materiel::with([
            'carriere',
            'pannes' => function($query) {
                $query->latest()->limit(10);
            }
        ])->findOrFail($id);

        return response()->json($materiel);
    }

    /**
     * Update the specified materiel
     */
    public function update(Request $request, $id)
    {
        $carriereIds = $request->user()->carrieres()->pluck('id')->toArray();
        $materiel = Materiel::findOrFail($id);

        if (!in_array($materiel->carriere_id, $carriereIds)) {
            return response()->json([
                'message' => 'Ce matériel ne fait pas partie de vos carrières.'
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:150',
            'categorie' => 'sometimes|string|max:100',
            'carriere_id' => 'sometimes|exists:carrieres,id',
        ]);

        if (isset($validated['carriere_id']) && !in_array((int) $validated['carriere_id'], $carriereIds)) {
            return response()->json([
                'message' => 'Cette carrière ne vous appartient pas.'
            ], 403);
        }

        $materiel->update($validated);

        return response()->json([
            'message' => 'Matériel mis à jour avec succès',
            'materiel' => $materiel->load('carriere')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $carriereIds = $request->user()->carrieres()->pluck('id')->toArray();
        $materiel = Materiel::findOrFail($id);

        if (!in_array($materiel->carriere_id, $carriereIds)) {
            return response()->json([
                'message' => 'Ce matériel ne fait pas partie de vos carrières.'
            ], 403);
        }

        $materiel->delete();

        return response()->json([
            'message' => 'Matériel supprimé avec succès'
        ]);
    }

    /**
     * Get materiel statistics
     */
    public function statistics($id)
    {
        $materiel = Materiel::findOrFail($id);
        
        $totalPannes = $materiel->pannes()->count();
        $pannesEnCours = $materiel->pannes()->where('status', 'en_cours')->count();
        $pannesResolues = $materiel->pannes()->where('status', 'resolue')->count();
        
        // MTBF calculation (Mean Time Between Failures) - in days
        $mtbf = $materiel->pannes()
            ->whereNotNull('date_fin')
            ->orderBy('date_panne')
            ->get()
            ->sliding(2)
            ->map(function ($pair) {
                if ($pair->count() < 2) return null;
                return $pair[1]->date_panne->diffInDays($pair[0]->date_fin);
            })
            ->filter()
            ->average() ?? 0;

        return response()->json([
            'materiel' => $materiel,
            'total_pannes' => $totalPannes,
            'pannes_en_cours' => $pannesEnCours,
            'pannes_resolues' => $pannesResolues,
            'mtbf_days' => round($mtbf, 2),
        ]);
    }
}
