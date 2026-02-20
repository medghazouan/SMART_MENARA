<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePanneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zone' => 'required|string|max:100',
            'type' => 'required|string|max:100',
            'date_panne' => 'required|date',
            'plan_action' => 'nullable|string',
            'heures_compteur' => 'nullable|integer|min:0',
            'pointeur_id' => 'required|exists:pointeurs,matricule',
            'carriere_id' => 'required|exists:carrieres,id',
            'materiel_id' => 'required|exists:materiels,matricule',
        ];
    }
}
