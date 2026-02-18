<?php

namespace App\Http\Requests;

use App\Models\Panne;
use Illuminate\Foundation\Http\FormRequest;

class ResolvePanneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $panne = Panne::find($this->route('id'));
        $afterDate = $panne?->date_panne?->toDateTimeString() ?? 'today';

        return [
            'date_fin' => "required|date|after:{$afterDate}",
        ];
    }
}
