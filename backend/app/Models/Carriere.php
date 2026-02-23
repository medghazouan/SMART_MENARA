<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carriere extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'region',
        'heures_par_jour',
        'superviseur_id',
    ];

    public function superviseur()
    {
        return $this->belongsTo(Superviseur::class, 'superviseur_id', 'matricule');
    }

    public function pointeurs()
    {
        return $this->hasMany(Pointeur::class, 'carriere_id');
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class, 'carriere_id');
    }

    public function pannes()
    {
        return $this->hasMany(Panne::class, 'carriere_id');
    }
}