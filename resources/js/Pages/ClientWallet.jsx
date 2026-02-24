import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, Target } from 'lucide-react';

export default function ClientWallet({ totalSpent, payments }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout 
            header={t('Spending History')}
            maxWidth="max-w-4xl"
            showFooter={true}
        >
            <Head title={t('Spending History')} />

            <div className="mb-12">
                <p className="text-gray-muted font-bold">{t('Track your mission payments and expenses.')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Total Spent Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-oflem-charcoal rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-60 mb-4">{t('Total Spent')}</p>
                        <h2 className="text-6xl font-black mb-10">
                            <span className="text-oflem-terracotta mr-2">CHF</span>
                            {parseFloat(totalSpent).toFixed(2)}
                        </h2>
                        <Link 
                            href={route('missions.create')}
                            className="inline-block px-8 py-3 bg-white text-oflem-charcoal font-black rounded-full hover:bg-oflem-cream transition-all text-sm shadow-lg"
                        >
                            {t('Create New Mission')}
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-2xl" />
                </motion.div>

                {/* Stats Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[40px] p-10 border border-gray-border shadow-sm flex flex-col justify-center"
                >
                    <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-1">{t('Missions Paid')}</p>
                    <p className="text-2xl font-black text-oflem-charcoal mb-6">
                        {payments.length}
                    </p>
                    <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-1">{t('Average Cost')}</p>
                    <p className="text-2xl font-black text-oflem-charcoal">
                        CHF {payments.length > 0 ? (totalSpent / payments.length).toFixed(2) : '0.00'}
                    </p>
                </motion.div>
            </div>

            {/* Payment History */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-oflem-charcoal flex items-center gap-3">
                    <CreditCard size={20} className="inline mr-2" /> {t('Payment History')}
                </h3>

                <div className="bg-white rounded-[40px] border border-gray-border overflow-hidden shadow-sm">
                    {payments.length > 0 ? (
                        <div className="divide-y divide-gray-border">
                            {payments.map((payment, index) => (
                                <motion.div 
                                    key={payment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-8 flex items-center justify-between hover:bg-oflem-cream/50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-oflem-charcoal text-lg mb-1">{payment.mission.title}</p>
                                            <p className="text-xs font-bold text-gray-muted uppercase tracking-widest">
                                                {payment.captured_at ? new Date(payment.captured_at).toLocaleDateString() : t('Processing')} • {t('Mission ID')}: #{payment.mission_id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-red-600 mb-1">
                                            - CHF {parseFloat(payment.amount).toFixed(2)}
                                        </p>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {t('Paid')}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                                <Target className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-black text-oflem-charcoal mb-2">{t('No payments yet')}</h4>
                            <p className="text-gray-muted font-bold max-w-sm mx-auto">
                                {t('Create your first mission to get started!')}
                            </p>
                            <Link 
                                href={route('missions.create')}
                                className="inline-block mt-8 px-8 py-3 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white font-black rounded-full hover:opacity-90 transition-all text-sm"
                            >
                                {t('Create Mission')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
