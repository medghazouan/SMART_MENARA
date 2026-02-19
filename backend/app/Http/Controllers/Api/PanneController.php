<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePanneRequest;
use App\Http\Requests\ResolvePanneRequest;
use App\Http\Requests\StoreActionRequest;
use App\Models\Panne;
use App\Models\Action;
use Illuminate\Http\Request;

class PanneController extends Controller
{
    public function index(Request $request)
    {
        $carriereIds = $request->user()->carrieres()->pluck('id');

        $query = Panne::with(['pointeur', 'carriere', 'materiel', 'actions'])
            ->whereIn('carriere_id', $carriereIds);

        if ($request->has('carriere_id')) {
            $query->where('carriere_id', $request->carriere_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->where('date_panne', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date_panne', '<=', $request->date_to);
        }

        $pannes = $query->orderBy('date_panne', 'desc')->paginate(20);

        return response()->json($pannes);
    }

    public function myPannes(Request $request)
    {
        $query = Panne::with(['carriere', 'materiel', 'actions'])
            ->where('pointeur_id', $request->user()->matricule);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->where('date_panne', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date_panne', '<=', $request->date_to);
        }

        $pannes = $query->orderBy('date_panne', 'desc')->paginate(20);

        return response()->json($pannes);
    }

    public function store(StorePanneRequest $request)
    {
        $validated = $request->validated();
        $validated['status'] = 'en_cours';

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
            'status' => 'sometimes|in:en_cours,resolue',
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

    public function resolve(ResolvePanneRequest $request, $id)
    {
        $panne = Panne::findOrFail($id);

        $user = $request->user();
        if ($panne->pointeur_id !== $user->matricule) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à résoudre cette panne.'
            ], 403);
        }

        $validated = $request->validated();

        $panne->update([
            'status' => 'resolue',
            'date_fin' => $validated['date_fin'],
        ]);

        return response()->json([
            'message' => 'Panne résolue avec succès',
            'panne' => $panne->load(['pointeur', 'carriere', 'materiel', 'actions'])
        ]);
    }

    public function panneActions($panneId)
    {
        $panne = Panne::findOrFail($panneId);
        $actions = $panne->actions()->orderBy('date', 'desc')->get();
        return response()->json($actions);
    }

    public function storePanneAction(StoreActionRequest $request, $panneId)
    {
        $panne = Panne::findOrFail($panneId);

        $validated = $request->validated();

        $validated['panne_id'] = $panne->id;
        $action = Action::create($validated);

        return response()->json([
            'message' => 'Action enregistrée avec succès',
            'action' => $action->load('panne')
        ], 201);
    }
}
