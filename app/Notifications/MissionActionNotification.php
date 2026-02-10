<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MissionActionNotification extends Notification
{
    use Queueable;

    public $mission;
    public $action; // 'assigned', 'offer_received', 'question_asked'
    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Mission $mission, string $action, string $message = '')
    {
        $this->mission = $mission;
        $this->action = $action;
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'mission_action',
            'action' => $this->action,
            'mission_id' => $this->mission->id,
            'param_message' => $this->message,
            'title' => $this->mission->title,
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
