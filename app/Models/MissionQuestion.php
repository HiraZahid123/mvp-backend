<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MissionQuestion extends Model
{
    protected $fillable = [
        'mission_id',
        'user_id',
        'question',
        'answer',
    ];

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
