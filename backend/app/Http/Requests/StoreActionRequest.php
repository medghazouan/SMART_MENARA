<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $panneIdRule = $this->route('panne')
            ? 'sometimes|exists:pannes,id'
            : 'required|exists:pannes,id';

        return [
            'date' => 'required|date',
            'type' => 'sometimes|string|in:Corrective,Preventive,Maintenance',
            'intervention' => 'required|string',
            'temps_estime' => 'sometimes|nullable|numeric|min:0',
            'panne_id' => $panneIdRule,
        ];
    }
}
