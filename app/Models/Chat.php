<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = ['mission_id', 'participant_ids', 'last_message_at', 'status'];
    protected $casts = [
        'participant_ids' => 'array',
        'last_message_at' => 'datetime',
    ];
    
    public function mission() {
        return $this->belongsTo(Mission::class);
    }
    
    public function messages() {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }
    
    public static function createSystemMessage(Mission $mission, array $content)
    {
        // Ensure both participants exist
        if (!$mission->assigned_user_id) {
            \Log::warning("Cannot create system message for mission #{$mission->id}: No assigned user");
            return;
        }

        $chat = self::firstOrCreate([
            'mission_id' => $mission->id,
        ], [
            'participant_ids' => array_filter([$mission->user_id, $mission->assigned_user_id]),
        ]);
        
        // Ensure participants are up to date and no nulls exist
        if (empty($chat->participant_ids) || in_array(null, $chat->participant_ids, true)) {
             $chat->update(['participant_ids' => array_filter([$mission->user_id, $mission->assigned_user_id])]);
        }
        
        $chat->messages()->create([
            'content' => json_encode($content),
            'is_system_message' => true,
        ]);
        
        $chat->touch('last_message_at');
    }
}
