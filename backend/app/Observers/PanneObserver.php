<?php

namespace App\Observers;

use App\Models\Panne;
use App\Models\Notification;

class PanneObserver
{
    public function created(Panne $panne): void
    {
        $panne->loadMissing('materiel', 'carriere.superviseur');

        $superviseur = $panne->carriere?->superviseur;
        if (!$superviseur) {
            return;
        }

        $materielNom = $panne->materiel?->nom ?? 'N/A';

        Notification::create([
            'superviseur_id' => $superviseur->matricule,
            'panne_id' => $panne->id,
            'message' => "Nouvelle panne: {$panne->type} sur {$materielNom}",
            'is_read' => false,
        ]);
    }
}
