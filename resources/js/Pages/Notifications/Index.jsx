import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { motion } from 'framer-motion';

export default function Index({ notifications }) {
    const { t } = useTranslation();

    const markAsRead = (id) => {
        router.post(route('notifications.mark-read', id), {}, {
            preserveScroll: true
        });
    };

    const markAllRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={t('Notifications')}
            maxWidth="max-w-4xl"
            showFooter={true}
        >
            <Head title={t('Notifications')} />

            <div className="py-16">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-oflem-charcoal mb-2">{t('Notifications')}</h2>
                        <p className="text-gray-muted font-bold">{t('Stay updated on your missions and offers.')}</p>
                    </div>
                    
                    {notifications.data.some(n => !n.read_at) && (
                        <button 
                            onClick={markAllRead}
                            className="text-sm font-black text-oflem-terracotta hover:underline"
                        >
                            {t('Mark all as read')}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.data.length > 0 ? (
                        notifications.data.map((n, index) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-[24px] p-6 shadow-sm border border-gray-border flex items-start gap-6 transition-all ${!n.read_at ? 'ring-2 ring-oflem-terracotta/10 border-oflem-terracotta/30' : 'opacity-80'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                                    n.data.type === 'nearby_mission' ? 'bg-blue-50' : 
                                    n.data.type === 'offer_rejected' ? 'bg-red-50' : 'bg-gray-50'
                                }`}>
                                    {n.data.type === 'nearby_mission' ? '📍' : 
                                     n.data.type === 'offer_rejected' ? '❌' : '✉️'}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <p className="text-lg font-bold text-oflem-charcoal leading-tight">
                                            {n.data.message}
                                        </p>
                                        <span className="text-xs font-bold text-gray-muted whitespace-nowrap">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {n.data.mission_id && (
                                            <Link 
                                                href={route('missions.show', n.data.mission_id)}
                                                className="text-xs font-black text-oflem-terracotta hover:underline uppercase tracking-wider"
                                            >
                                                {t('View Mission')}
                                            </Link>
                                        )}
                                        {n.data.chat_id && (
                                            <Link 
                                                href={route('messages', { chat_id: n.data.chat_id })}
                                                className="text-xs font-black text-oflem-terracotta hover:underline uppercase tracking-wider"
                                            >
                                                {t('Go to Chat')}
                                            </Link>
                                        )}
                                        {!n.read_at && (
                                            <button 
                                                onClick={() => markAsRead(n.id)}
                                                className="text-[10px] font-black text-gray-muted hover:text-oflem-charcoal uppercase tracking-widest border border-gray-border px-3 py-1 rounded-full transition-colors"
                                            >
                                                {t('Dismiss')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-white rounded-[32px] p-24 text-center border-2 border-dashed border-gray-border">
                            <div className="text-6xl mb-6">📭</div>
                            <h2 className="text-2xl font-black text-oflem-charcoal mb-2">{t('No notifications yet')}</h2>
                            <p className="text-gray-muted font-bold max-w-sm mx-auto">
                                {t('We will notify you here when there is news about your tasks or location.')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Simple Pagination */}
                {notifications.links && notifications.links.length > 3 && (
                    <div className="mt-12 flex justify-center gap-2">
                        {notifications.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    link.active 
                                    ? 'bg-oflem-charcoal text-white' 
                                    : 'bg-white text-oflem-charcoal border border-gray-border hover:bg-oflem-cream'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
