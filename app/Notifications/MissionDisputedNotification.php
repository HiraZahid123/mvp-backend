<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionDisputedNotification extends Notification
{
    use Queueable;

    protected $mission;

    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Mission Disputed')
                    ->line('The customer has initiated a dispute for the mission.')
                    ->line('Mission: ' . $this->mission->title)
                    ->line('Reason: ' . $this->mission->dispute_reason)
                    ->line('An admin will review the case and contact you shortly.')
                    ->action('View Mission', url('/missions/' . $this->mission->id))
                    ->line('Please be patient while we resolve this matter.');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'dispute_reason' => $this->mission->dispute_reason,
            'type' => 'mission_disputed',
            'message' => 'A dispute has been initiated for your mission.',
        ];
    }
}
