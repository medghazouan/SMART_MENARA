<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Superviseur;
use App\Models\Carriere;
use App\Models\Pointeur;
use App\Models\Materiel;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Superviseur
        $superviseur = Superviseur::create([
            'matricule' => 1001,
            'nom' => 'Ahmed Benali',
            'email' => 'ahmed.benali@menara.ma',
            'phone' => '+212600000001',
            'password' => Hash::make('password123'),
            'region' => 'Marrakech',
        ]);

        // Create Carriere JBILAT
        $carriere = Carriere::create([
            'nom' => 'JBILAT',
            'region' => 'Marrakech',
            'superviseur_id' => $superviseur->matricule,
        ]);

        // Create Pointeur
        $pointeur = Pointeur::create([
            'matricule' => 2001,
            'nom' => 'Mohamed El Amrani',
            'email' => 'mohamed.amrani@menara.ma',
            'phone' => '+212600000002',
            'password' => Hash::make('password123'),
            'carriere_id' => $carriere->id,
        ]);

        // Create Materiels
        Materiel::create([
            'matricule' => 3001,
            'nom' => 'Bande TR200',
            'categorie' => 'Convoyeur',
            'carriere_id' => $carriere->id,
        ]);

        Materiel::create([
            'matricule' => 3002,
            'nom' => 'VOLVO 220',
            'categorie' => 'Camion',
            'carriere_id' => $carriere->id,
        ]);

        Materiel::create([
            'matricule' => 3003,
            'nom' => 'CAT 349DL',
            'categorie' => 'Pelle',
            'carriere_id' => $carriere->id,
        ]);

        Materiel::create([
            'matricule' => 3004,
            'nom' => 'Broyeur Principal',
            'categorie' => 'Broyeur',
            'carriere_id' => $carriere->id,
        ]);
    }
}