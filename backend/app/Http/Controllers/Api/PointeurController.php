<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pointeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PointeurController extends Controller
{
    private function superviseurCarriereIds(Request $request): array
    {
        return $request->user()->carrieres()->pluck('id')->toArray();
    }

    public function index(Request $request)
    {
        $carriereIds = $this->superviseurCarriereIds($request);
        $pointeurs = Pointeur::with('carriere')
            ->whereIn('carriere_id', $carriereIds)
            ->get();

        return response()->json($pointeurs);
    }

    public function store(Request $request)
    {
        $carriereIds = $this->superviseurCarriereIds($request);

        $validated = $request->validate([
            'matricule' => 'required|integer|unique:pointeurs,matricule',
            'nom' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:pointeurs,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'carriere_id' => 'required|exists:carrieres,id',
        ]);

        if (!in_array((int) $validated['carriere_id'], $carriereIds)) {
            return response()->json([
                'message' => 'Cette carrière ne vous appartient pas.'
            ], 403);
        }

        $validated['password'] = Hash::make($validated['password']);
        $pointeur = Pointeur::create($validated);

        return response()->json([
            'message' => 'Pointeur créé avec succès',
            'pointeur' => $pointeur->load('carriere')
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $carriereIds = $this->superviseurCarriereIds($request);
        $pointeur = Pointeur::with(['carriere', 'pannes'])->findOrFail($id);

        if (!in_array($pointeur->carriere_id, $carriereIds)) {
            return response()->json([
                'message' => 'Ce pointeur ne fait pas partie de vos carrières.'
            ], 403);
        }

        return response()->json($pointeur);
    }

    public function update(Request $request, string $id)
    {
        $carriereIds = $this->superviseurCarriereIds($request);
        $pointeur = Pointeur::findOrFail($id);

        if (!in_array($pointeur->carriere_id, $carriereIds)) {
            return response()->json([
                'message' => 'Ce pointeur ne fait pas partie de vos carrières.'
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|max:150|unique:pointeurs,email,' . $id . ',matricule',
            'phone' => 'nullable|string|max:20',
            'password' => 'sometimes|string|min:6',
            'carriere_id' => 'sometimes|exists:carrieres,id',
        ]);

        if (isset($validated['carriere_id']) && !in_array((int) $validated['carriere_id'], $carriereIds)) {
            return response()->json([
                'message' => 'Cette carrière ne vous appartient pas.'
            ], 403);
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $pointeur->update($validated);

        return response()->json([
            'message' => 'Pointeur mis à jour avec succès',
            'pointeur' => $pointeur->load('carriere')
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $carriereIds = $this->superviseurCarriereIds($request);
        $pointeur = Pointeur::findOrFail($id);

        if (!in_array($pointeur->carriere_id, $carriereIds)) {
            return response()->json([
                'message' => 'Ce pointeur ne fait pas partie de vos carrières.'
            ], 403);
        }

        $pointeur->delete();

        return response()->json([
            'message' => 'Pointeur supprimé avec succès'
        ]);
    }
}
