import { useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Custom hook to manage notification sound playback
 * Respects user preferences and handles browser autoplay policies
 */
export default function useNotificationSound() {
    const { auth } = usePage().props;
    
    // Check if sound is enabled in user preferences
    const soundEnabled = auth?.user?.notification_preferences?.sound_enabled ?? true;

    const playSound = () => {
        // Don't play if sound is disabled in preferences
        if (!soundEnabled) {
            return;
        }

        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Audio playback failed:', error);
                });
            }
        } catch (error) {
            console.error('Error creating audio:', error);
        }
    };

    return { playSound };
}
