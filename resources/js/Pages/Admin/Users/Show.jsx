import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { User, Mail, Calendar, Shield, MapPin, Phone, ArrowLeft } from 'lucide-react';

export default function Show({ user }) {
    const { t } = useTranslation();

    const getRoleBadge = (roleType) => {
        const badges = {
            customer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Flemmard' },
            performer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Motivé' },
            both: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Both' }
        };
        const badge = badges[roleType] || badges.customer;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${user.name} - User Details`} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href={route('admin.users.index')}
                        className="text-sm font-bold text-oflem-terracotta hover:underline mb-4 inline-block"
                    >
                        <ArrowLeft size={16} className="inline mr-1" /> {t('Back to Users')}
                    </Link>
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                        {t('User Details')}
                    </h1>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/10 rounded-full flex items-center justify-center font-black text-4xl text-oflem-terracotta">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-oflem-charcoal mb-2">{user.name}</h2>
                            <div className="flex items-center gap-4 mb-4">
                                {getRoleBadge(user.role_type)}
                                {user.email_verified_at ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-green-700">
                                        {t('Verified')}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-100 text-yellow-700">
                                        {t('Unverified')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Email')}</div>
                                <div className="font-bold text-oflem-charcoal">{user.email}</div>
                            </div>
                        </div>

                        {user.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Phone')}</div>
                                    <div className="font-bold text-oflem-charcoal">{user.phone}</div>
                                </div>
                            </div>
                        )}

                        {user.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Location')}</div>
                                    <div className="font-bold text-oflem-charcoal">{user.location}</div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Joined')}</div>
                                <div className="font-bold text-oflem-charcoal">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                {user.skills && user.skills.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                        <h3 className="text-xl font-black text-oflem-charcoal mb-4">{t('Skills')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="px-4 py-2 bg-oflem-cream rounded-full text-sm font-bold text-oflem-charcoal"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Account Status */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-black text-oflem-charcoal mb-4">{t('Account Status')}</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-600">{t('Chat Status')}</span>
                            {user.chat_suspended_until && new Date(user.chat_suspended_until) > new Date() ? (
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">
                                    {t('Suspended until')} {new Date(user.chat_suspended_until).toLocaleDateString()}
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-green-700">
                                    {t('Active')}
                                </span>
                            )}
                        </div>
                        {user.admin_role && (
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-600">{t('Admin Role')}</span>
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                                    {user.admin_role}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
