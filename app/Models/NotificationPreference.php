<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quiet_hours_enabled',
        'quiet_hours_start',
        'quiet_hours_end',
        'new_mission_nearby',
        'new_offer_received',
        'offer_accepted',
        'offer_rejected',
        'mission_updated',
        'mission_cancelled',
        'new_question',
        'question_answered',
        'chat_message',
        'email_enabled',
        'push_enabled',
        'in_app_enabled',
        'digest_enabled',
        'digest_frequency',
    ];

    protected $casts = [
        'quiet_hours_enabled' => 'boolean',
        'new_mission_nearby' => 'boolean',
        'new_offer_received' => 'boolean',
        'offer_accepted' => 'boolean',
        'offer_rejected' => 'boolean',
        'mission_updated' => 'boolean',
        'mission_cancelled' => 'boolean',
        'new_question' => 'boolean',
        'question_answered' => 'boolean',
        'chat_message' => 'boolean',
        'email_enabled' => 'boolean',
        'push_enabled' => 'boolean',
        'in_app_enabled' => 'boolean',
        'digest_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if we're currently in quiet hours (Swiss Time).
     */
    public function isInQuietHours(): bool
    {
        if (!$this->quiet_hours_enabled) {
            return false;
        }

        $now = now()->setTimezone('Europe/Zurich');
        $currentTime = $now->format('H:i:s');
        
        $start = $this->quiet_hours_start;
        $end = $this->quiet_hours_end;

        // Handle overnight quiet hours (e.g., 22:00 to 07:00)
        if ($start > $end) {
            return $currentTime >= $start || $currentTime < $end;
        }

        return $currentTime >= $start && $currentTime < $end;
    }

    /**
     * Check if a specific notification type is enabled.
     */
    public function isNotificationEnabled(string $type): bool
    {
        return $this->{$type} ?? false;
    }
}
