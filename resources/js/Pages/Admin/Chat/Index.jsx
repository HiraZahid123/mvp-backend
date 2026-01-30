import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MessageSquare, AlertTriangle, Ban, CheckCircle, User, Clock } from 'lucide-react';

export default function ChatIndex({ flaggedMessages, userStrikes }) {
    const { t } = useTranslation();

    const handleClearStrikes = (userId) => {
        if (confirm(t('Clear all strikes for this user?'))) {
            router.post(route('admin.chat.clearStrikes', userId), {}, {
                preserveScroll: true,
                onSuccess: () => alert(t('Strikes cleared successfully'))
            });
        }
    };

    const handleSuspendUser = (userId) => {
        const days = prompt(t('Suspend for how many days?'), '7');
        if (days) {
            router.post(route('admin.chat.suspend', userId), {
                days: parseInt(days)
            }, {
                preserveScroll: true,
                onSuccess: () => alert(t('User suspended successfully'))
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Chat Moderation')} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                        {t('Chat Moderation')}
                    </h1>
                    <p className="text-gray-muted font-bold">
                        {t('Monitor flagged messages and manage user strikes')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Flagged Messages */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-black text-oflem-charcoal">
                                {t('Flagged Messages')}
                            </h2>
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black">
                                {flaggedMessages?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {flaggedMessages && flaggedMessages.length > 0 ? (
                                flaggedMessages.map((message) => (
                                    <div key={message.id} className="bg-white rounded-3xl p-6 shadow-sm border border-red-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-oflem-charcoal">{message.user?.name}</p>
                                                    <p className="text-xs text-gray-muted font-medium">{message.user?.email}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black">
                                                {message.blocked_reason || 'Flagged'}
                                            </span>
                                        </div>
                                        <div className="bg-red-50 rounded-2xl p-4 mb-4">
                                            <p className="text-sm font-medium text-gray-700">
                                                {message.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-muted">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(message.created_at).toLocaleString()}
                                            </span>
                                            <span>Mission #{message.chat?.mission_id}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="font-bold text-gray-muted">{t('No flagged messages')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Strikes */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Ban className="w-6 h-6 text-orange-500" />
                            <h2 className="text-2xl font-black text-oflem-charcoal">
                                {t('User Strikes')}
                            </h2>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black">
                                {userStrikes?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {userStrikes && userStrikes.length > 0 ? (
                                userStrikes.map((strike) => (
                                    <div key={strike.id} className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-oflem-charcoal">{strike.user?.name}</p>
                                                    <p className="text-xs text-gray-muted font-medium">
                                                        {strike.user?.strikes_count || 0} active strikes
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black">
                                                {strike.violation_type}
                                            </span>
                                        </div>
                                        <div className="bg-orange-50 rounded-2xl p-4 mb-4">
                                            <p className="text-sm font-medium text-gray-700">
                                                {strike.violation_content}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-muted flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(strike.created_at).toLocaleString()}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleClearStrikes(strike.user_id)}
                                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-black hover:bg-green-200 transition-colors"
                                                >
                                                    Clear Strikes
                                                </button>
                                                <button
                                                    onClick={() => handleSuspendUser(strike.user_id)}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-black hover:bg-red-200 transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="font-bold text-gray-muted">{t('No active strikes')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
