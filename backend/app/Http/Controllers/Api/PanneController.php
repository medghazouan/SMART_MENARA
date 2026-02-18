<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panne;
use Illuminate\Http\Request;

class PanneController extends Controller
{
    public function index(Request $request)
    {
        $query = Panne::with(['pointeur', 'carriere', 'materiel', 'actions']);

        // Filter by carriere if provided
        if ($request->has('carriere_id')) {
            $query->where('carriere_id', $request->carriere_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('date_panne', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date_panne', '<=', $request->date_to);
        }

        $pannes = $query->orderBy('date_panne', 'desc')->paginate(20);

        return response()->json($pannes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'zone' => 'required|string|max:100',
            'type' => 'required|string|max:100',
            'date_panne' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_panne',
            'status' => 'required|in:En cours,Résolue,En attente',
            'plan_action' => 'nullable|string',
            'pointeur_id' => 'required|exists:pointeurs,matricule',
            'carriere_id' => 'required|exists:carrieres,id',
            'materiel_id' => 'required|exists:materiels,matricule',
        ]);

        $panne = Panne::create($validated);

        return response()->json([
            'message' => 'Panne enregistrée avec succès',
            'panne' => $panne->load(['pointeur', 'carriere', 'materiel'])
        ], 201);
    }

    public function show($id)
    {
        $panne = Panne::with(['pointeur', 'carriere', 'materiel', 'actions'])->findOrFail($id);
        return response()->json($panne);
    }

    public function update(Request $request, $id)
    {
        $panne = Panne::findOrFail($id);

        $validated = $request->validate([
            'zone' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|max:100',
            'date_panne' => 'sometimes|date',
            'date_fin' => 'nullable|date|after_or_equal:date_panne',
            'status' => 'sometimes|in:En cours,Résolue,En attente',
            'plan_action' => 'nullable|string',
            'materiel_id' => 'sometimes|exists:materiels,matricule',
        ]);

        $panne->update($validated);

        return response()->json([
            'message' => 'Panne mise à jour avec succès',
            'panne' => $panne->load(['pointeur', 'carriere', 'materiel', 'actions'])
        ]);
    }

    public function destroy($id)
    {
        $panne = Panne::findOrFail($id);
        $panne->delete();

        return response()->json([
            'message' => 'Panne supprimée avec succès'
        ]);
    }

    // Get statistics for dashboard
    public function statistics(Request $request)
    {
        $carriereId = $request->query('carriere_id');
        
        $query = Panne::query();
        
        if ($carriereId) {
            $query->where('carriere_id', $carriereId);
        }

        $totalPannes = $query->count();
        $pannesEnCours = $query->where('status', 'En cours')->count();
        $pannesResolues = $query->where('status', 'Résolue')->count();
        
        // MTTR calculation (Mean Time To Repair) - in hours
        $mttr = Panne::whereNotNull('date_fin')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, date_panne, date_fin)) as avg_time')
            ->when($carriereId, function($q) use ($carriereId) {
                return $q->where('carriere_id', $carriereId);
            })
            ->first()
            ->avg_time ?? 0;

        return response()->json([
            'total_pannes' => $totalPannes,
            'pannes_en_cours' => $pannesEnCours,
            'pannes_resolues' => $pannesResolues,
            'mttr_hours' => round($mttr, 2),
        ]);
    }
}