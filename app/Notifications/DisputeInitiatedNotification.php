<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DisputeInitiatedNotification extends Notification
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
                    ->subject('[ADMIN] New Dispute Initiated')
                    ->line('A new dispute has been initiated and requires your attention.')
                    ->line('Mission: ' . $this->mission->title)
                    ->line('Customer: ' . $this->mission->user->name)
                    ->line('Performer: ' . $this->mission->assignedUser->name)
                    ->line('Reason: ' . $this->mission->dispute_reason)
                    ->action('Review Dispute', url('/admin/missions/' . $this->mission->id))
                    ->line('Please review and resolve this dispute as soon as possible.');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'customer_id' => $this->mission->user_id,
            'performer_id' => $this->mission->assigned_user_id,
            'dispute_reason' => $this->mission->dispute_reason,
            'type' => 'dispute_initiated',
            'message' => 'New dispute requires admin review.',
        ];
    }
}
