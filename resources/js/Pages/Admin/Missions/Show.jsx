import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { Calendar, User, MapPin, DollarSign, MessageSquare, ArrowLeft } from 'lucide-react';

export default function Show({ mission }) {
    const { t } = useTranslation();

    const getStatusBadge = (status) => {
        const badges = {
            'OUVERTE': { bg: 'bg-blue-100', text: 'text-blue-700' },
            'EN_NEGOCIATION': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            'VERROUILLEE': { bg: 'bg-purple-100', text: 'text-purple-700' },
            'EN_COURS': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
            'EN_VALIDATION': { bg: 'bg-orange-100', text: 'text-orange-700' },
            'TERMINEE': { bg: 'bg-green-100', text: 'text-green-700' },
            'ANNULEE': { bg: 'bg-gray-100', text: 'text-gray-700' },
            'EN_LITIGE': { bg: 'bg-red-100', text: 'text-red-700' },
        };
        const badge = badges[status] || badges.OUVERTE;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                {status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${mission.title} - Mission Details`} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href={route('admin.missions.index')}
                        className="text-sm font-bold text-oflem-terracotta hover:underline mb-4 inline-block"
                    >
                        <ArrowLeft size={16} className="inline mr-1" /> {t('Back to Missions')}
                    </Link>
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                        {t('Mission Details')}
                    </h1>
                </div>

                {/* Mission Info Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-oflem-charcoal mb-4">{mission.title}</h2>
                            <p className="text-lg font-medium text-gray-600 mb-4">{mission.description}</p>
                        </div>
                        {getStatusBadge(mission.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Customer')}</div>
                                <div className="font-bold text-oflem-charcoal">
                                    {mission.user?.name || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {mission.assigned_user && (
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Performer')}</div>
                                    <div className="font-bold text-oflem-charcoal">
                                        {mission.assigned_user?.name || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Budget')}</div>
                                <div className="font-bold text-oflem-charcoal">{mission.budget} CHF</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Location')}</div>
                                <div className="font-bold text-oflem-charcoal">{mission.location}</div>
                            </div>
                        </div>

                        {mission.date_time && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Deadline')}</div>
                                    <div className="font-bold text-oflem-charcoal">
                                        {new Date(mission.date_time).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Created')}</div>
                                <div className="font-bold text-oflem-charcoal">
                                    {new Date(mission.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {mission.category && (
                        <div className="pt-4 border-t border-gray-100">
                            <span className="text-xs font-black uppercase text-gray-muted mr-2">{t('Category')}:</span>
                            <span className="px-3 py-1 bg-oflem-cream rounded-full text-sm font-bold text-oflem-charcoal">
                                {mission.category}
                            </span>
                        </div>
                    )}
                </div>

                {/* Offers Section */}
                {mission.offers && mission.offers.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                        <h3 className="text-xl font-black text-oflem-charcoal mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {t('Offers')} ({mission.offers.length})
                        </h3>
                        <div className="space-y-4">
                            {mission.offers.map((offer) => (
                                <div key={offer.id} className="p-4 bg-oflem-cream rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-oflem-charcoal">{offer.user?.name}</span>
                                        <span className="font-black text-oflem-terracotta">{offer.amount} CHF</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">{offer.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Questions Section */}
                {mission.questions && mission.questions.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-black text-oflem-charcoal mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            {t('Questions')} ({mission.questions.length})
                        </h3>
                        <div className="space-y-4">
                            {mission.questions.map((question) => (
                                <div key={question.id} className="p-4 bg-oflem-cream rounded-2xl">
                                    <div className="mb-2">
                                        <span className="font-bold text-oflem-charcoal">{question.user?.name}</span>
                                        <span className="text-xs text-gray-muted ml-2">
                                            {new Date(question.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">{question.question}</p>
                                    {question.answer && (
                                        <div className="pl-4 border-l-2 border-oflem-terracotta">
                                            <p className="text-sm font-bold text-oflem-charcoal">{question.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
