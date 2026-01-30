<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NearbyMissionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $mission;

    /**
     * Create a new notification instance.
     */
    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [];
        
        // Check user preferences
        $prefs = $notifiable->notificationPreference;
        
        if (!$prefs || $prefs->isInQuietHours()) {
            return ['database']; // Only in-app during quiet hours
        }
        
        if ($prefs->in_app_enabled && $prefs->isNotificationEnabled('new_mission_nearby')) {
            $channels[] = 'database';
            $channels[] = 'broadcast';
        }
        
        if ($prefs->email_enabled && $prefs->isNotificationEnabled('new_mission_nearby')) {
            $channels[] = 'mail';
        }
        
        return $channels ?: ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('New Mission Nearby!')
                    ->line('A new mission has been posted in your area.')
                    ->line('Mission: ' . $this->mission->title)
                    ->line('Category: ' . $this->mission->category)
                    ->line('Budget: CHF ' . number_format($this->mission->budget, 2))
                    ->action('View Mission', url('/missions/' . $this->mission->id))
                    ->line('Don\'t miss out on this opportunity!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'nearby_mission',
            'mission_id' => $this->mission->id,
            'title' => $this->mission->title,
            'category' => $this->mission->category,
            'budget' => $this->mission->budget,
            'message' => "New mission found in your area: " . $this->mission->title,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => $this->toArray($notifiable),
        ]);
    }
}
