import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { Calendar, DollarSign, CreditCard, User, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function Show({ payment }) {
    const { t } = useTranslation();

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <CreditCard className="w-4 h-4" /> },
            'held': { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CreditCard className="w-4 h-4" /> },
            'captured': { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
            'refunded': { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-4 h-4" /> },
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badge.bg} ${badge.text} flex items-center gap-1`}>
                {badge.icon}
                {status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Payment #${payment.id} - Details`} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href={route('admin.payments.index')}
                        className="text-sm font-bold text-oflem-terracotta hover:underline mb-4 inline-block"
                    >
                        <ArrowLeft size={16} className="inline mr-1" /> {t('Back to Payments')}
                    </Link>
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                        {t('Payment Details')}
                    </h1>
                </div>

                {/* Payment Info Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-oflem-charcoal mb-2">
                                Payment #{payment.id}
                            </h2>
                            <p className="text-sm font-medium text-gray-muted">
                                Stripe ID: {payment.payment_intent_id}
                            </p>
                        </div>
                        {getStatusBadge(payment.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Total Amount')}</div>
                                <div className="font-black text-2xl text-oflem-charcoal">{payment.amount} CHF</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Platform Commission')}</div>
                                <div className="font-black text-xl text-oflem-terracotta">{payment.platform_commission} CHF</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Performer Amount')}</div>
                                <div className="font-black text-xl text-green-600">{payment.performer_amount} CHF</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-xs font-black uppercase text-gray-muted">{t('Created')}</div>
                                <div className="font-bold text-oflem-charcoal">
                                    {new Date(payment.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {payment.held_at && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Held At')}</div>
                                    <div className="font-bold text-oflem-charcoal">
                                        {new Date(payment.held_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {payment.captured_at && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Captured At')}</div>
                                    <div className="font-bold text-oflem-charcoal">
                                        {new Date(payment.captured_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {payment.refunded_at && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-xs font-black uppercase text-gray-muted">{t('Refunded At')}</div>
                                    <div className="font-bold text-oflem-charcoal">
                                        {new Date(payment.refunded_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {payment.refund_reason && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="text-xs font-black uppercase text-gray-muted mb-2">{t('Refund Reason')}</div>
                            <p className="font-medium text-gray-600">{payment.refund_reason}</p>
                        </div>
                    )}
                </div>

                {/* Related Mission */}
                {payment.mission && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-black text-oflem-charcoal mb-4">{t('Related Mission')}</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-black uppercase text-gray-muted">{t('Title')}:</span>
                                <p className="font-bold text-oflem-charcoal">{payment.mission.title}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-xs font-black uppercase text-gray-muted">{t('Customer')}:</span>
                                    <p className="font-bold text-oflem-charcoal">{payment.mission.user?.name}</p>
                                </div>
                                {payment.mission.assigned_user && (
                                    <div>
                                        <span className="text-xs font-black uppercase text-gray-muted">{t('Performer')}:</span>
                                        <p className="font-bold text-oflem-charcoal">{payment.mission.assigned_user?.name}</p>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={route('admin.missions.show', payment.mission.id)}
                                className="inline-block px-6 py-3 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white rounded-2xl font-black text-sm hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/90 transition-colors"
                            >
                                {t('View Mission')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
