<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MissionOffer extends Model
{
    protected $fillable = [
        'mission_id',
        'user_id',
        'amount',
        'message',
        'status',
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
