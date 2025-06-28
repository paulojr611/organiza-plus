<?php

namespace App\Models;

use App\Models\Task;
use App\Models\Reminder;
use Illuminate\Contracts\Auth\MustVerifyEmail;               
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait; 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail // implemente a interface
{
    use HasApiTokens, HasFactory, Notifiable, MustVerifyEmailTrait; // use também o trait de verificação

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Relações
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }
}
