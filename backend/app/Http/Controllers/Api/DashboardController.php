<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carriere;
use App\Models\Panne;
use App\Models\Materiel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $carriereIds = $request->user()->carrieres()->pluck('id');

        if ($request->filled('carriere_id')) {
            $carriereIds = $carriereIds->intersect([$request->query('carriere_id')]);
        }

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

        $pannesToday = (clone $baseQuery)
            ->whereDate('date_panne', Carbon::today())
            ->count();

        $mttrHours = (clone $baseQuery)
            ->where('status', 'resolue')
            ->whereNotNull('date_fin')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, date_panne, date_fin) / 60.0) as avg_repair')
            ->value('avg_repair') ?? 0;

        $mtbfHours = $this->calculateMtbf($carriereIds, $materielId, $zone);

        $indisponibilitePercent = $this->calculateIndisponibilite($carriereIds);

        return response()->json([
            'pannes_en_cours' => $pannesEnCours,
            'pannes_resolues' => $pannesResolues,
            'total_pannes' => $totalPannes,
            'pannes_today' => $pannesToday,
            'mttr_hours' => round((float) $mttrHours, 2),
            'mtbf_hours' => round((float) $mtbfHours, 2),
            'indisponibilite_percent' => round((float) $indisponibilitePercent, 1),
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

        // Option B: hour-meter intervals
        $intervals = [];

        foreach ($materiels as $mat) {
            $readings = Panne::where('materiel_id', $mat->matricule)
                ->whereIn('carriere_id', $carriereIds)
                ->whereNotNull('heures_compteur')
                ->orderBy('heures_compteur', 'asc')
                ->pluck('heures_compteur')
                ->values();

            if ($mat->compteur_init !== null) {
                $readings->prepend($mat->compteur_init);
            }

            if ($readings->count() >= 2) {
                for ($i = 1; $i < $readings->count(); $i++) {
                    $interval = $readings[$i] - $readings[$i - 1];
                    if ($interval > 0) {
                        $intervals[] = $interval;
                    }
                }
            }
        }

        if (count($intervals) > 0) {
            return array_sum($intervals) / count($intervals);
        }

        // Option A fallback: shift-hours estimate using heures_par_jour
        $totalFailures = $materiels->sum('pannes_count');
        if ($totalFailures === 0) {
            return 0;
        }

        $carrieres = Carriere::whereIn('id', $carriereIds)->get()->keyBy('id');

        $totalOperatingHours = $materiels->sum(function ($mat) use ($carrieres) {
            $carriere = $carrieres->get($mat->carriere_id);
            $heuresParJour = $carriere ? (float) $carriere->heures_par_jour : 10.0;
            $daysSinceCreation = Carbon::parse($mat->created_at ?? now()->subYear())->diffInDays(now());

            return $daysSinceCreation * $heuresParJour;
        });

        if ($totalOperatingHours <= 0) {
            return 0;
        }

        return $totalOperatingHours / $totalFailures;
    }

    private function calculateIndisponibilite($carriereIds): float
    {
        $weekStart = Carbon::now()->startOfWeek();
        $now = Carbon::now();
        $hoursInWeekSoFar = $weekStart->diffInMinutes($now) / 60.0;

        if ($hoursInWeekSoFar <= 0) {
            return 0;
        }

        $equipmentCount = Materiel::whereIn('carriere_id', $carriereIds)->count();
        if ($equipmentCount === 0) {
            return 0;
        }

        $totalAvailableHours = $equipmentCount * $hoursInWeekSoFar;

        $resolvedThisWeek = Panne::whereIn('carriere_id', $carriereIds)
            ->where('status', 'resolue')
            ->whereNotNull('date_fin')
            ->where('date_fin', '>=', $weekStart)
            ->get();

        $activeThisWeek = Panne::whereIn('carriere_id', $carriereIds)
            ->where('status', 'en_cours')
            ->where('date_panne', '<=', $now)
            ->get();

        $totalDowntimeMinutes = 0;

        foreach ($resolvedThisWeek as $panne) {
            $start = Carbon::parse($panne->date_panne)->max($weekStart);
            $end = Carbon::parse($panne->date_fin);
            $totalDowntimeMinutes += $start->diffInMinutes($end);
        }

        foreach ($activeThisWeek as $panne) {
            $start = Carbon::parse($panne->date_panne)->max($weekStart);
            $totalDowntimeMinutes += $start->diffInMinutes($now);
        }

        $totalDowntimeHours = $totalDowntimeMinutes / 60.0;

        return ($totalDowntimeHours / $totalAvailableHours) * 100;
    }
}
