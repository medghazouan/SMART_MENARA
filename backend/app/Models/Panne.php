<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Panne extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone',
        'type',
        'date_panne',
        'date_fin',
        'status',
        'plan_action',
        'pointeur_id',
        'carriere_id',
        'materiel_id',
    ];

    protected $casts = [
        'date_panne' => 'date',
        'date_fin' => 'date',
    ];

    public function pointeur()
    {
        return $this->belongsTo(Pointeur::class, 'pointeur_id', 'matricule');
    }

    public function carriere()
    {
        return $this->belongsTo(Carriere::class, 'carriere_id');
    }

    public function materiel()
    {
        return $this->belongsTo(Materiel::class, 'materiel_id', 'matricule');
    }

    public function actions()
    {
        return $this->hasMany(Action::class, 'panne_id');
    }
}