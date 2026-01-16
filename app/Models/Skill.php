<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['name', 'category'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'provider_skills')
                    ->withPivot('proficiency_level', 'verified');
    }
}
