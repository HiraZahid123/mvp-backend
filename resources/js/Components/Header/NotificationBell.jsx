import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from '@/Hooks/useTranslation';

export default function NotificationBell() {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const unreadCount = auth.unread_notifications_count || 0;

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            markAllAsRead();
        }
    }, [isOpen]);

    const markAllAsRead = async () => {
        try {
            await fetch(route('notifications.mark-all-read'), {
                method: 'POST',
                headers: { 
                    'X-Requested-With': 'XMLHttpRequest', 
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });
            // Update the live count in the UI
            router.reload({ only: ['auth'] });
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // We'll just use the Inertia page for the full list, 
            // but for the preview we could fetch via a small API if needed.
            // For now, let's assume we redirect to the notifications page if they click "See all"
            // and maybe fetch the last 5 here.
            const response = await fetch(route('notifications.index'), {
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
            });
            const data = await response.json();
            setNotifications(data.notifications.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-muted hover:text-oflem-charcoal transition-colors focus:outline-none"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-oflem-terracotta text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-oflem-cream">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-border overflow-hidden z-50 origin-top-right"
                        >
                            <div className="p-4 border-b border-gray-border/50 flex items-center justify-between">
                                <h3 className="font-black text-sm text-oflem-charcoal">{t('Notifications')}</h3>
                                <Link 
                                    href={route('notifications.index')} 
                                    className="text-[10px] font-black uppercase text-oflem-terracotta hover:underline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('See all')}
                                </Link>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin inline-block w-6 h-6 border-2 border-oflem-terracotta border-t-transparent rounded-full mb-2"></div>
                                        <p className="text-xs font-bold text-gray-muted">{t('Loading...')}</p>
                                    </div>
                                ) : notifications.length > 0 ? (
                                    notifications.map((n) => {
                                        // Determine destination
                                        let href = route('notifications.index');
                                        if (n.data.mission_id) href = route('missions.show', n.data.mission_id);
                                        if (n.data.chat_id) href = route('dashboard'); // Or chat route if exists

                                        return (
                                            <Link 
                                                key={n.id} 
                                                href={href}
                                                onClick={() => setIsOpen(false)}
                                                className={`block p-4 border-b border-gray-border/30 hover:bg-oflem-cream/30 transition-colors ${!n.read_at ? 'bg-oflem-cream/10' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="text-lg">
                                                        {n.data.type === 'nearby_mission' ? '📍' : 
                                                         n.data.type === 'offer_rejected' ? '❌' : 
                                                         n.data.type === 'new_question' ? '❓' :
                                                         n.data.type === 'new_message' ? '✉️' : 
                                                         n.data.type === 'mission_assigned' ? '🎊' : '🔔'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-oflem-charcoal mb-1">
                                                            {n.data.message || n.data.preview || t('You have a new notification')}
                                                        </p>
                                                        <p className="text-[10px] text-gray-muted font-medium">
                                                            {new Date(n.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-xs font-bold text-gray-muted">{t('No notifications yet')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
