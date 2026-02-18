<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materiel extends Model
{
    use HasFactory;

    protected $table = 'materiels';
    protected $primaryKey = 'matricule';

    protected $fillable = [
        'matricule',
        'nom',
        'categorie',
        'carriere_id',
    ];

    public function carriere()
    {
        return $this->belongsTo(Carriere::class, 'carriere_id');
    }

    public function pannes()
    {
        return $this->hasMany(Panne::class, 'materiel_id', 'matricule');
    }
}