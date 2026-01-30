<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionCompletedNotification extends Notification
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
                    ->subject('Mission Validated - Payment Released!')
                    ->line('Great news! The customer has validated your work.')
                    ->line('Mission: ' . $this->mission->title)
                    ->line('Payment of CHF ' . number_format($this->mission->budget, 2) . ' has been released to your account.')
                    ->action('View Mission', url('/missions/' . $this->mission->id))
                    ->line('Thank you for using Oflem!');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'amount' => $this->mission->budget,
            'type' => 'mission_completed',
            'message' => 'Your work has been validated. Payment released!',
        ];
    }
}
