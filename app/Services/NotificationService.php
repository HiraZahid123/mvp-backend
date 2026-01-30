<?php

namespace App\Services;

use App\Models\User;
use App\Models\NotificationPreference;
use Illuminate\Notifications\Notification;

class NotificationService
{
    /**
     * Check if a notification should be sent based on user preferences.
     */
    public function shouldSendNotification(User $user, string $notificationType): bool
    {
        $preferences = $user->notificationPreference;

        // If no preferences exist, create default ones
        if (!$preferences) {
            $preferences = NotificationPreference::create(['user_id' => $user->id]);
        }

        // Check if notification type is enabled
        if (!$preferences->isNotificationEnabled($notificationType)) {
            return false;
        }

        // Check quiet hours
        if ($preferences->isInQuietHours()) {
            // Queue for later or skip non-critical notifications
            return false;
        }

        return true;
    }

    /**
     * Send notification respecting user preferences.
     */
    public function sendNotification(User $user, Notification $notification, string $notificationType)
    {
        if (!$this->shouldSendNotification($user, $notificationType)) {
            \Log::info("Notification blocked by preferences", [
                'user_id' => $user->id,
                'type' => $notificationType,
            ]);
            return;
        }

        $preferences = $user->notificationPreference;

        // Determine channels based on preferences
        $channels = [];
        if ($preferences->in_app_enabled) {
            $channels[] = 'database';
        }
        if ($preferences->email_enabled) {
            $channels[] = 'mail';
        }
        if ($preferences->push_enabled) {
            $channels[] = 'broadcast';
        }

        if (empty($channels)) {
            return;
        }

        $user->notify($notification);
    }

    /**
     * Create default notification preferences for a user.
     */
    public function createDefaultPreferences(User $user): NotificationPreference
    {
        return NotificationPreference::create([
            'user_id' => $user->id,
        ]);
    }
}
