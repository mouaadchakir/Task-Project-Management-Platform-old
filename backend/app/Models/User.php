<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_picture_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The projects that the user owns.
     */
    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'user_id');
    }

    /**
     * The projects that the user is a member of.
     */
    public function memberOfProjects()
    {
        return $this->belongsToMany(Project::class, 'project_user', 'user_id', 'project_id');
    }

    /**
     * The tasks assigned to the user.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get all of the tasks for the user across all of their owned projects.
     */
    public function allTasksInOwnedProjects()
    {
        return $this->hasManyThrough(Task::class, Project::class, 'user_id', 'project_id', 'id', 'id');
    }
}
