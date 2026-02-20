<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Superviseur;
use App\Models\Carriere;
use App\Models\Pointeur;
use App\Models\Materiel;
use App\Models\Panne;
use App\Models\Action;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Superviseurs ──────────────────────────────────────
        $sup1 = Superviseur::create([
            'matricule' => 1009,
            'nom' => 'Ahmed Benali',
            'email' => 'ahmed.benali@menara.ma',
            'phone' => '+212600000001',
            'password' => Hash::make('password123'),
            'region' => 'Marrakech',
        ]);

        $sup2 = Superviseur::create([
            'matricule' => 1002,
            'nom' => 'Fatima Zahra El Idrissi',
            'email' => 'fatima.idrissi@menara.ma',
            'phone' => '+212600000010',
            'password' => Hash::make('password123'),
            'region' => 'Casablanca',
        ]);

        // ── Carrières ─────────────────────────────────────────
        $carriereJbilat = Carriere::create([
            'nom' => 'JBILAT',
            'region' => 'Marrakech',
            'heures_par_jour' => 10.0,
            'superviseur_id' => $sup1->matricule,
        ]);

        $carriereBenAhmed = Carriere::create([
            'nom' => 'BEN AHMED',
            'region' => 'Casablanca',
            'heures_par_jour' => 10.0,
            'superviseur_id' => $sup2->matricule,
        ]);

        // ── Pointeurs ─────────────────────────────────────────
        $pointeur1 = Pointeur::create([
            'matricule' => 2009,
            'nom' => 'Mohamed El Amrani',
            'email' => 'mohamed.amrani@menara.ma',
            'phone' => '+212600000002',
            'password' => Hash::make('password123'),
            'carriere_id' => $carriereJbilat->id,
        ]);

        $pointeur2 = Pointeur::create([
            'matricule' => 2002,
            'nom' => 'Youssef Bakkali',
            'email' => 'youssef.bakkali@menara.ma',
            'phone' => '+212600000003',
            'password' => Hash::make('password123'),
            'carriere_id' => $carriereBenAhmed->id,
        ]);

        // ── Matériels ─────────────────────────────────────────
        $mat1 = Materiel::create([
            'matricule' => 3009,
            'nom' => 'Bande TR200',
            'categorie' => 'Convoyeur',
            'compteur_init' => 203,
            'carriere_id' => $carriereJbilat->id,
        ]);

        $mat2 = Materiel::create([
            'matricule' => 3002,
            'nom' => 'VOLVO 220',
            'categorie' => 'Camion',
            'compteur_init' => 20500,
            'carriere_id' => $carriereJbilat->id,
        ]);

        $mat3 = Materiel::create([
            'matricule' => 3003,
            'nom' => 'CAT 349DL',
            'categorie' => 'Pelle',
            'compteur_init' => 36000,
            'carriere_id' => $carriereJbilat->id,
        ]);

        $mat4 = Materiel::create([
            'matricule' => 3004,
            'nom' => 'Broyeur BK-500',
            'categorie' => 'Broyeur',
            'compteur_init' => 1500,
            'carriere_id' => $carriereJbilat->id,
        ]);

        $mat5 = Materiel::create([
            'matricule' => 3005,
            'nom' => 'Concasseur CR-800',
            'categorie' => 'Concasseur',
            'compteur_init' => 1300,
            'carriere_id' => $carriereBenAhmed->id,
        ]);

        $mat6 = Materiel::create([
            'matricule' => 3006,
            'nom' => 'Chargeuse Komatsu WA380',
            'categorie' => 'Chargeuse',
            'compteur_init' => 18900,
            'carriere_id' => $carriereBenAhmed->id,
        ]);

        // ── Pannes (mix of resolved and ongoing) ──────────────
        $panne0a = Panne::create([
            'zone' => 'Zone A',
            'type' => 'Mécanique',
            'date_panne' => Carbon::now()->subDays(30),
            'date_fin' => Carbon::now()->subDays(28),
            'status' => 'resolue',
            'plan_action' => 'Réalignement courroie',
            'pointeur_id' => $pointeur1->matricule,
            'carriere_id' => $carriereJbilat->id,
            'materiel_id' => $mat1->matricule,
        ]);

        $panne1 = Panne::create([
            'zone' => 'Zone A',
            'type' => 'Mécanique',
            'date_panne' => Carbon::now()->subDays(10),
            'date_fin' => Carbon::now()->subDays(8),
            'status' => 'resolue',
            'plan_action' => 'Remplacement courroie',
            'pointeur_id' => $pointeur1->matricule,
            'carriere_id' => $carriereJbilat->id,
            'materiel_id' => $mat1->matricule,
        ]);

        $panne2 = Panne::create([
            'zone' => 'Zone B',
            'type' => 'Électrique',
            'date_panne' => Carbon::now()->subDays(5),
            'date_fin' => null,
            'status' => 'en_cours',
            'plan_action' => 'Diagnostic moteur en cours',
            'pointeur_id' => $pointeur1->matricule,
            'carriere_id' => $carriereJbilat->id,
            'materiel_id' => $mat2->matricule,
        ]);

        $panne0b = Panne::create([
            'zone' => 'Zone A',
            'type' => 'Hydraulique',
            'date_panne' => Carbon::now()->subDays(35),
            'date_fin' => Carbon::now()->subDays(33),
            'status' => 'resolue',
            'plan_action' => 'Remplacement joint vérin',
            'pointeur_id' => $pointeur1->matricule,
            'carriere_id' => $carriereJbilat->id,
            'materiel_id' => $mat3->matricule,
        ]);

        $panne3 = Panne::create([
            'zone' => 'Zone A',
            'type' => 'Hydraulique',
            'date_panne' => Carbon::now()->subDays(15),
            'date_fin' => Carbon::now()->subDays(12),
            'status' => 'resolue',
            'plan_action' => 'Réparation vérin hydraulique',
            'pointeur_id' => $pointeur1->matricule,
            'carriere_id' => $carriereJbilat->id,
            'materiel_id' => $mat3->matricule,
        ]);

        $panne4 = Panne::create([
            'zone' => 'Zone C',
            'type' => 'Mécanique',
            'date_panne' => Carbon::now()->subDays(3),
            'date_fin' => null,
            'status' => 'en_cours',
            'plan_action' => 'Attente pièces de rechange',
            'pointeur_id' => $pointeur2->matricule,
            'carriere_id' => $carriereBenAhmed->id,
            'materiel_id' => $mat5->matricule,
        ]);

        $panne5 = Panne::create([
            'zone' => 'Zone B',
            'type' => 'Électrique',
            'date_panne' => Carbon::now()->subDays(20),
            'date_fin' => Carbon::now()->subDays(18),
            'status' => 'resolue',
            'plan_action' => 'Remplacement câblage',
            'pointeur_id' => $pointeur2->matricule,
            'carriere_id' => $carriereBenAhmed->id,
            'materiel_id' => $mat6->matricule,
        ]);

        // ── Actions ───────────────────────────────────────────
        Action::create([
            'date' => Carbon::now()->subDays(9),
            'intervention' => 'Inspection visuelle de la courroie usée',
            'panne_id' => $panne1->id,
        ]);

        Action::create([
            'date' => Carbon::now()->subDays(8),
            'intervention' => 'Remplacement de la courroie et test de fonctionnement',
            'panne_id' => $panne1->id,
        ]);

        Action::create([
            'date' => Carbon::now()->subDays(4),
            'intervention' => 'Diagnostic du circuit électrique moteur',
            'panne_id' => $panne2->id,
        ]);

        Action::create([
            'date' => Carbon::now()->subDays(14),
            'intervention' => 'Démontage du vérin pour inspection',
            'panne_id' => $panne3->id,
        ]);

        Action::create([
            'date' => Carbon::now()->subDays(12),
            'intervention' => 'Remplacement joints et remontage vérin',
            'panne_id' => $panne3->id,
        ]);

        Action::create([
            'date' => Carbon::now()->subDays(19),
            'intervention' => 'Identification câbles endommagés',
            'panne_id' => $panne5->id,
        ]);

        // ── Notifications ─────────────────────────────────────
        Notification::create([
            'superviseur_id' => $sup1->matricule,
            'panne_id' => $panne2->id,
            'message' => "Nouvelle panne: Électrique sur VOLVO 220",
            'is_read' => false,
        ]);

        Notification::create([
            'superviseur_id' => $sup1->matricule,
            'panne_id' => $panne1->id,
            'message' => "Nouvelle panne: Mécanique sur Bande TR200",
            'is_read' => true,
        ]);

        Notification::create([
            'superviseur_id' => $sup2->matricule,
            'panne_id' => $panne4->id,
            'message' => "Nouvelle panne: Mécanique sur Concasseur CR-800",
            'is_read' => false,
        ]);

        Notification::create([
            'superviseur_id' => $sup2->matricule,
            'panne_id' => $panne5->id,
            'message' => "Nouvelle panne: Électrique sur Chargeuse Komatsu WA380",
            'is_read' => true,
        ]);
    }
}
