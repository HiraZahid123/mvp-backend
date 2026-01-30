<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCancellationNotification extends Notification
{
    use Queueable;

    protected $mission;
    protected $cancelledBy;
    protected $reason;

    public function __construct(Mission $mission, $cancelledBy = null, $reason = null)
    {
        $this->mission = $mission;
        $this->cancelledBy = $cancelledBy;
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        $channels = [];
        
        // Check user preferences
        $prefs = $notifiable->notificationPreference;
        
        if (!$prefs || $prefs->isInQuietHours()) {
            return ['database']; // Only in-app during quiet hours
        }
        
        if ($prefs->in_app_enabled && $prefs->isNotificationEnabled('mission_cancelled')) {
            $channels[] = 'database';
        }
        
        if ($prefs->email_enabled && $prefs->isNotificationEnabled('mission_cancelled')) {
            $channels[] = 'mail';
        }
        
        return $channels ?: ['database'];
    }

    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
                    ->subject('Mission Cancelled: ' . $this->mission->title)
                    ->line('A mission has been cancelled.')
                    ->line('Mission: ' . $this->mission->title);
        
        if ($this->cancelledBy) {
            $mail->line('Cancelled by: ' . $this->cancelledBy);
        }
        
        if ($this->reason) {
            $mail->line('Reason: ' . $this->reason);
        }
        
        return $mail->action('View Mission', url('/missions/' . $this->mission->id))
                    ->line('We apologize for any inconvenience.');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'cancelled_by' => $this->cancelledBy,
            'reason' => $this->reason,
            'type' => 'mission_cancelled',
            'message' => 'Mission "' . $this->mission->title . '" has been cancelled.',
        ];
    }
}
