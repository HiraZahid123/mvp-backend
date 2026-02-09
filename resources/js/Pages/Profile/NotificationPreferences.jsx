import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { Bell, Clock, Mail, Smartphone, Monitor, Save, Volume2 } from 'lucide-react';

export default function NotificationPreferences({ preferences }) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        quiet_hours_enabled: preferences?.quiet_hours_enabled ?? true,
        quiet_hours_start: preferences?.quiet_hours_start ?? '22:00',
        quiet_hours_end: preferences?.quiet_hours_end ?? '07:00',
        new_mission_nearby: preferences?.new_mission_nearby ?? true,
        new_offer_received: preferences?.new_offer_received ?? true,
        offer_accepted: preferences?.offer_accepted ?? true,
        offer_rejected: preferences?.offer_rejected ?? true,
        mission_updated: preferences?.mission_updated ?? true,
        mission_cancelled: preferences?.mission_cancelled ?? true,
        new_question: preferences?.new_question ?? true,
        question_answered: preferences?.question_answered ?? true,
        chat_message: preferences?.chat_message ?? true,
        email_enabled: preferences?.email_enabled ?? true,
        push_enabled: preferences?.push_enabled ?? true,
        in_app_enabled: preferences?.in_app_enabled ?? true,
        sound_enabled: preferences?.sound_enabled ?? true,
        digest_enabled: preferences?.digest_enabled ?? false,
        digest_frequency: preferences?.digest_frequency ?? 'daily',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('profile.notifications.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Show success message
            },
        });
    };

    const ToggleSwitch = ({ name, label, description }) => (
        <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="flex-1 pr-4">
                <label className="font-bold text-oflem-charcoal cursor-pointer" htmlFor={name}>
                    {label}
                </label>
                {description && (
                    <p className="text-sm text-gray-muted mt-1">{description}</p>
                )}
            </div>
            <button
                type="button"
                id={name}
                onClick={() => setData(name, !data[name])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    data[name] ? 'bg-oflem-terracotta' : 'bg-gray-300'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        data[name] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={t('Notification Preferences')}
            maxWidth="max-w-4xl"
            showFooter={true}
        >
            <Head title={t('Notification Preferences')} />

            <div className="py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                        {t('Notification Preferences')}
                    </h1>
                    <p className="text-lg font-bold text-gray-muted">
                        {t('Control how and when you receive notifications')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quiet Hours Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="w-6 h-6 text-oflem-terracotta" />
                            <h2 className="text-2xl font-black text-oflem-charcoal">
                                {t('Quiet Hours')}
                            </h2>
                        </div>
                        <p className="text-sm text-gray-muted mb-6">
                            {t('Pause non-urgent notifications during your quiet hours (Swiss Time)')}
                        </p>

                        <ToggleSwitch
                            name="quiet_hours_enabled"
                            label={t('Enable Quiet Hours')}
                            description={t('Block notifications between specified times')}
                        />

                        {data.quiet_hours_enabled && (
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-muted mb-2">
                                        {t('Start Time')}
                                    </label>
                                    <input
                                        type="time"
                                        value={data.quiet_hours_start}
                                        onChange={(e) => setData('quiet_hours_start', e.target.value)}
                                        className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-muted mb-2">
                                        {t('End Time')}
                                    </label>
                                    <input
                                        type="time"
                                        value={data.quiet_hours_end}
                                        onChange={(e) => setData('quiet_hours_end', e.target.value)}
                                        className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notification Types */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-6 h-6 text-oflem-terracotta" />
                            <h2 className="text-2xl font-black text-oflem-charcoal">
                                {t('Notification Types')}
                            </h2>
                        </div>

                        <div className="space-y-0">
                            <ToggleSwitch
                                name="new_mission_nearby"
                                label={t('New Missions Nearby')}
                                description={t('Get notified when new missions are posted in your area')}
                            />
                            <ToggleSwitch
                                name="new_offer_received"
                                label={t('New Offers')}
                                description={t('When someone submits an offer on your mission')}
                            />
                            <ToggleSwitch
                                name="offer_accepted"
                                label={t('Offer Accepted')}
                                description={t('When your offer is accepted')}
                            />
                            <ToggleSwitch
                                name="offer_rejected"
                                label={t('Offer Rejected')}
                                description={t('When your offer is not selected')}
                            />
                            <ToggleSwitch
                                name="mission_updated"
                                label={t('Mission Updates')}
                                description={t('Status changes and important updates')}
                            />
                            <ToggleSwitch
                                name="mission_cancelled"
                                label={t('Mission Cancelled')}
                                description={t('When a mission you\'re involved in is cancelled')}
                            />
                            <ToggleSwitch
                                name="new_question"
                                label={t('New Questions')}
                                description={t('When someone asks a question on your mission')}
                            />
                            <ToggleSwitch
                                name="question_answered"
                                label={t('Question Answered')}
                                description={t('When your question receives an answer')}
                            />
                            <ToggleSwitch
                                name="chat_message"
                                label={t('Chat Messages')}
                                description={t('New messages in mission chats')}
                            />
                        </div>
                    </div>

                    {/* Delivery Channels */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Smartphone className="w-6 h-6 text-oflem-terracotta" />
                            <h2 className="text-2xl font-black text-oflem-charcoal">
                                {t('Delivery Channels')}
                            </h2>
                        </div>

                        <div className="space-y-0">
                            <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <ToggleSwitch
                                    name="email_enabled"
                                    label={t('Email Notifications')}
                                />
                            </div>
                            <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <ToggleSwitch
                                    name="push_enabled"
                                    label={t('Push Notifications')}
                                />
                            </div>
                            <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                                <Monitor className="w-5 h-5 text-gray-400" />
                                <ToggleSwitch
                                    name="in_app_enabled"
                                    label={t('In-App Notifications')}
                                />
                            </div>
                            <div className="flex items-center gap-3 py-4">
                                <Volume2 className="w-5 h-5 text-gray-400" />
                                <ToggleSwitch
                                    name="sound_enabled"
                                    label={t('Sound Notifications')}
                                    description={t('Play a sound when notifications arrive')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Digest Options */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-black text-oflem-charcoal mb-6">
                            {t('Digest Options')}
                        </h2>

                        <ToggleSwitch
                            name="digest_enabled"
                            label={t('Enable Digest Mode')}
                            description={t('Group non-urgent notifications into a single summary')}
                        />

                        {data.digest_enabled && (
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-muted mb-2">
                                    {t('Digest Frequency')}
                                </label>
                                <select
                                    value={data.digest_frequency}
                                    onChange={(e) => setData('digest_frequency', e.target.value)}
                                    className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-bold focus:ring-2 focus:ring-oflem-terracotta/20"
                                >
                                    <option value="hourly">{t('Every Hour')}</option>
                                    <option value="daily">{t('Once Daily')}</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-4 bg-oflem-terracotta text-white rounded-full font-black text-lg hover:bg-oflem-terracotta/90 transition-colors disabled:opacity-50 flex items-center gap-3"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? t('Saving...') : t('Save Preferences')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
