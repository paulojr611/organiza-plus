<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'due_date',
        'completed',
        'user_id',
        'recurrence',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed' => 'boolean',
        'recurrence' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function completions()
    {
        return $this->hasMany(TaskCompletion::class);
    }

    public function isCompletedForToday(): bool
    {
        return $this->completions()->whereDate('date', today())->exists();
    }

    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }


}
