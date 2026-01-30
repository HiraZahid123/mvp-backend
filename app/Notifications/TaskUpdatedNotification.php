<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskUpdatedNotification extends Notification
{
    use Queueable;

    protected $mission;
    protected $changes;

    public function __construct(Mission $mission, array $changes = [])
    {
        $this->mission = $mission;
        $this->changes = $changes;
    }

    public function via($notifiable)
    {
        $channels = [];
        
        // Check user preferences
        $prefs = $notifiable->notificationPreference;
        
        if (!$prefs || $prefs->isInQuietHours()) {
            return ['database']; // Only in-app during quiet hours
        }
        
        if ($prefs->in_app_enabled && $prefs->isNotificationEnabled('mission_updated')) {
            $channels[] = 'database';
        }
        
        if ($prefs->email_enabled && $prefs->isNotificationEnabled('mission_updated')) {
            $channels[] = 'mail';
        }
        
        return $channels ?: ['database'];
    }

    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
                    ->subject('Mission Updated: ' . $this->mission->title)
                    ->line('A mission you are involved with has been updated.')
                    ->line('Mission: ' . $this->mission->title);
        
        if (!empty($this->changes)) {
            $mail->line('Changes:');
            foreach ($this->changes as $field => $value) {
                $mail->line('- ' . ucfirst($field) . ': ' . $value);
            }
        }
        
        return $mail->action('View Mission', url('/missions/' . $this->mission->id))
                    ->line('Stay updated with your missions on Oflem!');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'changes' => $this->changes,
            'type' => 'mission_updated',
            'message' => 'Mission "' . $this->mission->title . '" has been updated.',
        ];
    }
}
