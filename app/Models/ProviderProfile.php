<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'years_experience',
        'main_category',
        'raw_ai_analysis',
    ];

    protected $casts = [
        'raw_ai_analysis' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
