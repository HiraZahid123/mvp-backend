<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatStrike extends Model
{
    protected $fillable = [
        'user_id', 'message_id', 'violation_type', 'violation_content', 'expires_at'
    ];
    
    protected $casts = [
        'expires_at' => 'datetime'
    ];
    
    public function user() {
        return $this->belongsTo(User::class);
    }
    
    public function message() {
        return $this->belongsTo(Message::class);
    }
}
