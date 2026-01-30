<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'chat_id', 'user_id', 'content', 'is_system_message', 
        'attachments', 'read_at', 'is_blocked', 'blocked_reason'
    ];
    
    protected $casts = [
        'attachments' => 'array', 
        'is_system_message' => 'boolean',
        'is_blocked' => 'boolean',
        'read_at' => 'datetime'
    ];
    
    public function chat() {
        return $this->belongsTo(Chat::class);
    }
    
    public function user() {
        return $this->belongsTo(User::class);
    }
}
