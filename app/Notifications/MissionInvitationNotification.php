<?php

namespace App\Notifications;

use App\Models\Mission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MissionInvitationNotification extends Notification
{
    use Queueable;

    public $mission;
    public $inviter;

    public function __construct(Mission $mission, User $inviter)
    {
        $this->mission = $mission;
        $this->inviter = $inviter;
    }

    public function via($notifiable)
    {
        return ['database', 'mail', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('You\'ve been invited to a mission!')
            ->line($this->inviter->name . ' has invited you to their mission: ' . $this->mission->title)
            ->line('Budget: CHF ' . $this->mission->budget)
            ->action('View Mission', route('missions.show', $this->mission->id))
            ->line('Thank you for using Oflem!');
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'inviter_id' => $this->inviter->id,
            'inviter_name' => $this->inviter->name,
            'message' => $this->inviter->name . ' has invited you to their mission: ' . $this->mission->title,
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
