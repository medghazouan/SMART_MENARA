<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'superviseur_id',
        'panne_id',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function superviseur()
    {
        return $this->belongsTo(Superviseur::class, 'superviseur_id', 'matricule');
    }

    public function panne()
    {
        return $this->belongsTo(Panne::class, 'panne_id');
    }
}
