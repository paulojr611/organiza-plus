<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }


    public function rules(): array
    {
        return [
            'title'     => 'sometimes|required|string|max:255',
            'due_date'  => 'sometimes|nullable|date',
            'completed' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'    => 'O título é obrigatório quando for enviado.',
            'title.max'         => 'O título não pode ter mais de 255 caracteres.',
            'due_date.date'     => 'A data de vencimento deve ser uma data válida.',
            'completed.boolean' => 'O campo concluído deve ser verdadeiro ou falso.',
        ];
    }
}
