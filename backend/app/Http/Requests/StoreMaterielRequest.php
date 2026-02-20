<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterielRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matricule' => 'required|integer|unique:materiels,matricule',
            'nom' => 'required|string|max:150',
            'categorie' => 'required|string|max:100',
            'compteur_init' => 'required|integer|min:1',
            'carriere_id' => 'required|exists:carrieres,id',
        ];
    }
}
