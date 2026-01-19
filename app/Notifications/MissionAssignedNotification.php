<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionAssignedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $mission;

    public function __construct($mission)
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('You have been assigned to an OFLEM Mission!')
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Congratulations! You have been assigned to the mission: ' . $this->mission->title)
                    ->line('You can now see the exact address and contact details.')
                    ->action('View Mission Details', url('/missions/' . $this->mission->id))
                    ->line('Good luck with the mission!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'message' => 'You have been assigned to a mission',
        ];
    }
}
