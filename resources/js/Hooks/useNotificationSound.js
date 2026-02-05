import { useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Custom hook to manage notification sound playback
 * Respects user preferences and handles browser autoplay policies
 */
export default function useNotificationSound() {
    const audioRef = useRef(null);
    const { auth } = usePage().props;
    
    // Check if sound is enabled in user preferences
    const soundEnabled = auth?.notification_preferences?.sound_enabled ?? true;

    useEffect(() => {
        // Initialize audio element
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/notification.mp3');
            audioRef.current.volume = 0.5; // Set to 50% volume
            
            // Preload the audio
            audioRef.current.load();
        }

        return () => {
            // Cleanup
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    /**
     * Play the notification sound
     * Handles errors gracefully (e.g., autoplay policy restrictions)
     */
    const playSound = () => {
        // Don't play if sound is disabled in preferences
        if (!soundEnabled) {
            return;
        }

        if (audioRef.current) {
            // Reset to start if already playing
            audioRef.current.currentTime = 0;
            
            // Play the sound
            audioRef.current.play().catch(error => {
                // Silently handle autoplay policy errors
                // This can happen if user hasn't interacted with the page yet
                console.debug('Notification sound blocked by browser:', error.message);
            });
        }
    };

    return { playSound, soundEnabled };
}
