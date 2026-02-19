<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matricule' => 'required|integer|unique:superviseurs,matricule',
            'nom' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:superviseurs,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
            'region' => 'nullable|string|max:100',
        ];
    }
}
