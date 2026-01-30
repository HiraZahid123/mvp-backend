<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionReadyForValidationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $mission;

    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    public function via($notifiable)
    {
        $preferences = $notifiable->notificationPreference;
        $channels = [];

        if ($preferences && $preferences->shouldReceive('mission_completed')) {
            if ($preferences->email_enabled) {
                $channels[] = 'mail';
            }
            if ($preferences->in_app_enabled) {
                $channels[] = 'database';
            }
        } else {
            // Default channels if no preferences set
            $channels = ['mail', 'database'];
        }

        return $channels;
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Mission Ready for Validation - ' . $this->mission->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your mission "' . $this->mission->title . '" has been completed and is ready for validation.')
            ->line('The performer has submitted proof of completion. Please review and validate within 72 hours.')
            ->action('Review Mission', route('missions.show', $this->mission->id))
            ->line('If you don\'t take action within 72 hours, the mission will be automatically validated and payment will be released.');
    }

    public function toDatabase($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'performer_id' => $this->mission->assigned_user_id,
            'performer_name' => $this->mission->assignedUser->name ?? 'Unknown',
            'message' => 'Mission "' . $this->mission->title . '" is ready for validation. Review within 72 hours.',
            'action_url' => route('missions.show', $this->mission->id),
        ];
    }

    public function toArray($notifiable)
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
        ];
    }
}
