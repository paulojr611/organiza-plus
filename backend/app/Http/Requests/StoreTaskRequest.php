<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'title'     => 'required|string|max:255',
            'due_date'  => 'nullable|date',
            'completed' => 'boolean',
        ];
    }
}
