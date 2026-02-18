<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Superviseur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'superviseurs';
    protected $primaryKey = 'matricule';

    protected $fillable = [
        'matricule',
        'nom',
        'email',
        'phone',
        'password',
        'region',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function carrieres()
    {
        return $this->hasMany(Carriere::class, 'superviseur_id', 'matricule');
    }
}