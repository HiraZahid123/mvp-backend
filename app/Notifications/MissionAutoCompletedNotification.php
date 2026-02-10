<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MissionAutoCompletedNotification extends Notification
{
    use Queueable;

    protected $mission;

    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Mission Auto-Completed - ' . $this->mission->title)
            ->line('Your mission "' . $this->mission->title . '" has been automatically completed.')
            ->line('Since no validation action was taken within 72 hours, the mission has been marked as complete and payment has been released to the performer.')
            ->action('View Mission', route('missions.show', $this->mission->id))
            ->line('You can still leave a review for the performer.');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'type' => 'mission_auto_completed',
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => $this->toArray($notifiable),
        ]);
    }
}
