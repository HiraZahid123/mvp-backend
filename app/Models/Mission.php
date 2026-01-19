<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'lat',
        'lng',
        'date_time',
        'budget',
        'price_type',
        'category',
        'additional_details',
        'status',
        'assigned_user_id',
        'exact_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function offers()
    {
        return $this->hasMany(MissionOffer::class);
    }

    public function questions()
    {
        return $this->hasMany(MissionQuestion::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
