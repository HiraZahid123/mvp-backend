import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DollarSign, TrendingUp, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentsIndex({ payments, stats }) {
    const { t } = useTranslation();

    const handleRefund = (paymentId) => {
        const reason = prompt(t('Refund reason:'));
        if (reason) {
            router.post(route('admin.payments.refund', paymentId), {
                reason
            }, {
                preserveScroll: true,
                onSuccess: () => alert(t('Refund processed successfully'))
            });
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
            held: { bg: 'bg-blue-100', text: 'text-blue-700', icon: DollarSign },
            captured: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            refunded: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3" />
                {t(status)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Payment Management')} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                        {t('Payment Management')}
                    </h1>
                    <p className="text-gray-muted font-bold">
                        {t('Monitor transactions and process refunds')}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-oflem-terracotta" />
                            <p className="text-xs font-black uppercase text-gray-muted">Total Revenue</p>
                        </div>
                        <p className="text-3xl font-black text-oflem-charcoal">
                            CHF {stats?.total_revenue?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <p className="text-xs font-black uppercase text-gray-muted">Commission</p>
                        </div>
                        <p className="text-3xl font-black text-oflem-charcoal">
                            CHF {stats?.total_commission?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            <p className="text-xs font-black uppercase text-gray-muted">Held</p>
                        </div>
                        <p className="text-3xl font-black text-oflem-charcoal">
                            {stats?.held_count || '0'}
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <RefreshCw className="w-5 h-5 text-red-500" />
                            <p className="text-xs font-black uppercase text-gray-muted">Refunded</p>
                        </div>
                        <p className="text-3xl font-black text-oflem-charcoal">
                            {stats?.refunded_count || '0'}
                        </p>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-oflem-cream border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        Mission
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-gray-muted">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments?.data?.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-oflem-cream/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-black text-oflem-charcoal">#{payment.id}</p>
                                                <p className="text-xs text-gray-muted font-medium">{payment.payment_intent_id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('admin.missions.show', payment.mission_id)}
                                                className="font-bold text-oflem-terracotta hover:underline"
                                            >
                                                Mission #{payment.mission_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-black text-oflem-charcoal">CHF {payment.amount}</p>
                                                <p className="text-xs text-gray-muted">Commission: CHF {payment.platform_commission}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === 'held' || payment.status === 'captured' ? (
                                                <button
                                                    onClick={() => handleRefund(payment.id)}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4 inline mr-1" />
                                                    Refund
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {(!payments?.data || payments.data.length === 0) && (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100 mt-8">
                        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-oflem-charcoal mb-4">
                            {t('No payments yet')}
                        </h3>
                        <p className="text-gray-muted font-medium">
                            {t('Payments will appear here once missions are completed')}
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
