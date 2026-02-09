import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { CheckCircle, MessageSquare, Bell, Search, ArrowRight } from 'lucide-react';

export default function MissionSuccess({ mission, userRole }) {
    const { t } = useTranslation();
    const isCustomer = userRole === 'customer';

    return (
        <AuthenticatedLayout
            maxWidth="max-w-3xl"
            showFooter={true}
        >
            <Head title={t('Mission Published')} />

            <div className="py-12">
                {/* Success Icon */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-oflem-charcoal mb-4">
                        {isCustomer ? t('Mission Published!') : t('Offer Submitted!')} 🎉
                    </h1>
                    <p className="text-lg font-bold text-gray-muted">
                        {isCustomer 
                            ? t('Your mission is now live and visible to motivated helpers')
                            : t('The customer will review your offer and get back to you')}
                    </p>
                </div>

                {/* Mission Summary Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-2xl font-black text-oflem-charcoal mb-4">
                        {mission.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            <span className="font-bold text-gray-600">CHF {mission.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📍</span>
                            <span className="font-bold text-gray-600">{mission.location}</span>
                        </div>
                        {mission.date_time && (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📅</span>
                                <span className="font-bold text-gray-600">
                                    {new Date(mission.date_time).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-oflem-cream rounded-3xl p-8 mb-8">
                    <h3 className="text-xl font-black text-oflem-charcoal mb-6">
                        {t('Next Steps')}
                    </h3>
                    
                    {isCustomer ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-oflem-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-oflem-terracotta">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-black text-oflem-charcoal mb-1">
                                        {t('Wait for Offers')}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t('Motivated helpers will send you offers. You\'ll receive notifications.')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-oflem-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-oflem-terracotta">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-black text-oflem-charcoal mb-1">
                                        {t('Review & Chat')}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t('Review offers, chat with helpers, and choose the best match.')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-oflem-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-oflem-terracotta">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-black text-oflem-charcoal mb-1">
                                        {t('Accept & Pay')}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t('Accept an offer and pay securely. Funds are held in escrow until completion.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-oflem-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-oflem-terracotta">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-black text-oflem-charcoal mb-1">
                                        {t('Wait for Response')}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t('The customer will review your offer and may contact you via chat.')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-oflem-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-oflem-terracotta">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-black text-oflem-charcoal mb-1">
                                        {t('Get Accepted')}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t('If accepted, you\'ll receive a notification and payment will be secured.')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-oflem-terracotta/10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-oflem-terracotta">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-black text-oflem-charcoal mb-1">
                                        {t('Complete & Get Paid')}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600">
                                        {t('Complete the task and receive your payment directly to your account.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        href={route('missions.show', mission.id)}
                        className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-gray-100 hover:border-oflem-terracotta hover:shadow-md transition-all group"
                    >
                        <MessageSquare className="w-8 h-8 text-oflem-terracotta group-hover:scale-110 transition-transform" />
                        <span className="font-black text-sm text-center text-oflem-charcoal">
                            {t('View Mission')}
                        </span>
                    </Link>
                    <Link
                        href={route('notifications.index')}
                        className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-gray-100 hover:border-oflem-terracotta hover:shadow-md transition-all group"
                    >
                        <Bell className="w-8 h-8 text-oflem-terracotta group-hover:scale-110 transition-transform" />
                        <span className="font-black text-sm text-center text-oflem-charcoal">
                            {t('Notifications')}
                        </span>
                    </Link>
                    <Link
                        href={isCustomer ? route('dashboard') : route('missions.active')}
                        className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-gray-100 hover:border-oflem-terracotta hover:shadow-md transition-all group"
                    >
                        <Search className="w-8 h-8 text-oflem-terracotta group-hover:scale-110 transition-transform" />
                        <span className="font-black text-sm text-center text-oflem-charcoal">
                            {isCustomer ? t('Dashboard') : t('Find More')}
                        </span>
                    </Link>
                </div>

                {/* Primary CTA */}
                <div className="mt-8 text-center">
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-oflem-terracotta text-white rounded-full font-black text-lg hover:bg-oflem-terracotta/90 transition-all shadow-xl group"
                    >
                        {t('Go to Dashboard')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
