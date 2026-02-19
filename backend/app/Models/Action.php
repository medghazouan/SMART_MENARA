<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'type',
        'intervention',
        'temps_estime',
        'panne_id',
    ];

    protected $casts = [
        'date' => 'date',
        'temps_estime' => 'float',
    ];

    public function panne()
    {
        return $this->belongsTo(Panne::class, 'panne_id');
    }
}