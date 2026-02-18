<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\Panne;
use Illuminate\Http\Request;

class ActionController extends Controller
{
    /**
     * Display a listing of actions
     */
    public function index(Request $request)
    {
        $query = Action::with('panne');

        // Filter by panne if provided
        if ($request->has('panne_id')) {
            $query->where('panne_id', $request->panne_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $actions = $query->orderBy('date', 'desc')->get();

        return response()->json($actions);
    }

    /**
     * Store a newly created action
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'intervention' => 'required|string',
            'panne_id' => 'required|exists:pannes,id',
        ]);

        $action = Action::create($validated);

        // If action is created, we might want to update panne status
        // Optionally auto-update panne status based on action keywords
        $panne = Panne::find($validated['panne_id']);
        if ($panne && str_contains(strtolower($validated['intervention']), 'résolu')) {
            $panne->update([
                'status' => 'Résolue',
                'date_fin' => $validated['date']
            ]);
        }

        return response()->json([
            'message' => 'Action enregistrée avec succès',
            'action' => $action->load('panne')
        ], 201);
    }

    /**
     * Display the specified action
     */
    public function show($id)
    {
        $action = Action::with('panne')->findOrFail($id);
        return response()->json($action);
    }

    /**
     * Update the specified action
     */
    public function update(Request $request, $id)
    {
        $action = Action::findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'intervention' => 'sometimes|string',
        ]);

        $action->update($validated);

        return response()->json([
            'message' => 'Action mise à jour avec succès',
            'action' => $action->load('panne')
        ]);
    }

    /**
     * Remove the specified action
     */
    public function destroy($id)
    {
        $action = Action::findOrFail($id);
        $action->delete();

        return response()->json([
            'message' => 'Action supprimée avec succès'
        ]);
    }
}
