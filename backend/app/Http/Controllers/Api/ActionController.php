<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActionRequest;
use App\Models\Action;
use Illuminate\Http\Request;

class ActionController extends Controller
{
    public function index(Request $request)
    {
        $query = Action::with('panne');

        if ($request->has('panne_id')) {
            $query->where('panne_id', $request->panne_id);
        }

        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $actions = $query->orderBy('date', 'desc')->get();

        return response()->json($actions);
    }

    public function store(StoreActionRequest $request)
    {
        $validated = $request->validated();
        $validated['panne_id'] = $request->input('panne_id');

        $action = Action::create($validated);

        return response()->json([
            'message' => 'Action enregistrée avec succès',
            'action' => $action->load('panne')
        ], 201);
    }

    public function show($id)
    {
        $action = Action::with('panne')->findOrFail($id);
        return response()->json($action);
    }

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

    public function destroy($id)
    {
        $action = Action::findOrFail($id);
        $action->delete();

        return response()->json([
            'message' => 'Action supprimée avec succès'
        ]);
    }
}
