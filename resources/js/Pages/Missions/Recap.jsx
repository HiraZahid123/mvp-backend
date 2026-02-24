import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { MapPin, Calendar, DollarSign, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function MissionRecap({ mission }) {
    const { t } = useTranslation();

    const handleConfirm = () => {
        router.post(route('missions.store'), mission);
    };

    const handleEdit = () => {
        router.get(route('missions.create'), {
            ...mission,
            edit: true
        });
    };

    return (
        <AuthenticatedLayout 
            header={t('Mission Recap')}
            maxWidth="max-w-4xl"
            showFooter={true}
        >
            <Head title={t('Mission Recap')} />

            <div className="py-12">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href={route('missions.create')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-muted hover:text-oflem-terracotta transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('Back to edit')}
                    </Link>

                    <p className="text-lg font-bold text-gray-muted max-w-2xl">
                        {t('Review the details below. You can edit before confirming.')}
                    </p>
                </div>

                {/* Mission Details Card */}
                <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 mb-8">
                    {/* Title */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <FileText className="w-6 h-6 text-oflem-terracotta" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-muted">
                                {t('Mission Title')}
                            </h2>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-oflem-charcoal">
                            {mission.title}
                        </p>
                    </div>

                    {/* Description */}
                    {mission.description && (
                        <div className="mb-10 pb-10 border-b border-gray-100">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-muted mb-4">
                                {t('Description')}
                            </h3>
                            <p className="text-base font-medium text-gray-600 leading-relaxed">
                                {mission.description}
                            </p>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-100">
                        {/* Location */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <MapPin className="w-5 h-5 text-oflem-terracotta" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-muted">
                                    {t('Location')}
                                </h3>
                            </div>
                            <p className="text-lg font-black text-oflem-charcoal">
                                {mission.location}
                            </p>
                            {mission.exact_address && (
                                <p className="text-sm font-medium text-gray-muted mt-1">
                                    {mission.exact_address}
                                </p>
                            )}
                        </div>

                        {/* Date & Time */}
                        {mission.date_time && (
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Calendar className="w-5 h-5 text-oflem-terracotta" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-muted">
                                        {t('Date & Time')}
                                    </h3>
                                </div>
                                <p className="text-lg font-black text-oflem-charcoal">
                                    {new Date(mission.date_time).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-sm font-medium text-gray-muted mt-1">
                                    {new Date(mission.date_time).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}

                        {/* Budget */}
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <DollarSign className="w-5 h-5 text-oflem-terracotta" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-muted">
                                    {t('Budget')}
                                </h3>
                            </div>
                            <p className="text-lg font-black text-oflem-charcoal">
                                CHF {mission.budget}
                            </p>
                            <p className="text-sm font-medium text-gray-muted mt-1">
                                {mission.price_type === 'fixed' ? t('Fixed Price') : t('Open to offers')}
                            </p>
                        </div>

                        {/* Category */}
                        {mission.category && (
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-muted mb-3">
                                    {t('Category')}
                                </h3>
                                <span className="inline-block px-4 py-2 bg-oflem-cream text-oflem-charcoal text-sm font-black rounded-full">
                                    {t(mission.category)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Chat Availability Note */}
                    <div className="bg-oflem-cream/50 rounded-3xl p-6 border border-oflem-terracotta/10">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-oflem-terracotta" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-oflem-charcoal mb-2">
                                    {t('After confirmation')}
                                </h4>
                                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                    {t('Your mission will be visible and you will be able to exchange messages with the Motivé you choose.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <SecondaryButton
                        onClick={handleEdit}
                        className="flex-1 py-5 text-base"
                    >
                        {t('Edit Mission')}
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleConfirm}
                        className="flex-1 py-5 text-base bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/90 flex items-center justify-center gap-3"
                    >
                        <CheckCircle2 size={24} /> {t('Confirm my mission')}
                    </PrimaryButton>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-gray-muted">
                        {t('By confirming, you agree to our')} <Link href="#" className="text-oflem-terracotta hover:underline">{t('Terms of Service')}</Link> {t('and')} <Link href="#" className="text-oflem-terracotta hover:underline">{t('Privacy Policy')}</Link>
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
