import { useRef, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Custom hook to manage notification sound playback
 * Handles browser autoplay policies by unlocking audio on first interaction
 */
export default function useNotificationSound() {
    const { auth } = usePage().props;
    const audioRef = useRef(null);
    const audioUnlocked = useRef(false);
    
    // Check if sound is enabled in user preferences
    const soundEnabled = auth?.user?.notification_preferences?.sound_enabled ?? true;

    useEffect(() => {
        // Pre-initialize audio object
        if (!audioRef.current) {
            const audioPath = `${window.location.origin}/sounds/notification.mp3`;
            audioRef.current = new Audio(audioPath);
            audioRef.current.volume = 0.5;
            console.log('Notification audio initialized:', audioPath);
        }

        // Logic to "unlock" audio for browsers with strict autoplay policies
        const unlockAudio = () => {
            if (audioUnlocked.current || !audioRef.current) return;
            
            // Play and immediately pause to "unlock"
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioUnlocked.current = true;
                console.log('Notification audio unlocked');
                window.removeEventListener('click', unlockAudio);
                window.removeEventListener('keydown', unlockAudio);
            }).catch(e => {
                // Silently fail if still blocked
            });
        };

        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);

        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    const playSound = useCallback(() => {
        // Don't play if sound is disabled in preferences
        if (!soundEnabled || !audioRef.current) {
            return;
        }

        try {
            audioRef.current.currentTime = 0;
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Notification audio playback failed:', error);
                });
            }
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }, [soundEnabled]);

    return { playSound };
}

