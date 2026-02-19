<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panne;
use App\Models\Materiel;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $carriereIds = $request->user()->carrieres()->pluck('id');

        $materielId = $request->query('materiel_id');
        $zone = $request->query('zone');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $baseQuery = Panne::query()
            ->whereIn('carriere_id', $carriereIds)
            ->when($materielId, fn ($q) => $q->where('materiel_id', $materielId))
            ->when($zone, fn ($q) => $q->where('zone', $zone))
            ->when($dateFrom, fn ($q) => $q->where('date_panne', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->where('date_panne', '<=', $dateTo));

        $pannesEnCours = (clone $baseQuery)->where('status', 'en_cours')->count();
        $pannesResolues = (clone $baseQuery)->where('status', 'resolue')->count();
        $totalPannes = (clone $baseQuery)->count();

        $mttrHours = (clone $baseQuery)
            ->where('status', 'resolue')
            ->whereNotNull('date_fin')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, date_panne, date_fin)) as avg_repair')
            ->value('avg_repair') ?? 0;

        $mtbfHours = $this->calculateMtbf($carriereIds, $materielId, $zone);

        return response()->json([
            'pannes_en_cours' => $pannesEnCours,
            'pannes_resolues' => $pannesResolues,
            'total_pannes' => $totalPannes,
            'mttr_hours' => round((float) $mttrHours, 2),
            'mtbf_hours' => round((float) $mtbfHours, 2),
        ]);
    }

    private function calculateMtbf($carriereIds, ?string $materielId, ?string $zone): float
    {
        $query = Materiel::query()
            ->whereIn('carriere_id', $carriereIds)
            ->when($materielId, fn ($q) => $q->where('matricule', $materielId));

        if ($zone) {
            $panneMateriels = Panne::where('zone', $zone)
                ->whereIn('carriere_id', $carriereIds)
                ->pluck('materiel_id')
                ->unique();
            $query->whereIn('matricule', $panneMateriels);
        }

        $materiels = $query->withCount('pannes')->get();

        if ($materiels->isEmpty()) {
            return 0;
        }

        $totalFailures = $materiels->sum('pannes_count');
        if ($totalFailures === 0) {
            return 0;
        }

        $totalOperatingHours = $materiels->sum(function ($mat) {
            $createdAt = $mat->created_at ?? now()->subYear();
            return $createdAt->diffInHours(now());
        });

        return $totalOperatingHours / $totalFailures;
    }
}
