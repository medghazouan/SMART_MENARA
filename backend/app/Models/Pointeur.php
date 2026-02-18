<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pointeur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'pointeurs';
    protected $primaryKey = 'matricule';

    protected $fillable = [
        'matricule',
        'nom',
        'email',
        'phone',
        'password',
        'carriere_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function carriere()
    {
        return $this->belongsTo(Carriere::class, 'carriere_id');
    }

    public function pannes()
    {
        return $this->hasMany(Panne::class, 'pointeur_id', 'matricule');
    }
}