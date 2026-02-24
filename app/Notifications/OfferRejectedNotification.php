<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OfferRejectedNotification extends Notification implements ShouldQueue
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
        
        if ($prefs->in_app_enabled && $prefs->isNotificationEnabled('offer_rejected')) {
            $channels[] = 'database';
            $channels[] = 'broadcast';
        }
        
        if ($prefs->email_enabled && $prefs->isNotificationEnabled('offer_rejected')) {
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
                    ->subject('Offer Not Selected')
                    ->line('Thank you for your interest in the mission.')
                    ->line('Mission: ' . $this->mission->title)
                    ->line('Unfortunately, another provider was selected for this mission.')
                    ->line('Don\'t be discouraged! Keep browsing for more opportunities.')
                    ->action('Browse Missions', url('/missions/active'))
                    ->line('Thank you for using Oflem!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'offer_rejected',
            'mission_id' => $this->mission->id,
            'title' => $this->mission->title,
            'message' => "Another provider was chosen for the mission: " . $this->mission->title,
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
