import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import useTranslation from '@/Hooks/useTranslation';
import { motion } from 'framer-motion';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Wallet({ balance, availableBalance, pendingWithdrawal, totalWithdrawn, transactions, pendingWithdrawals }) {
    const { t } = useTranslation();
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

    const withdrawalForm = useForm({
        amount: '',
        bank_details: {
            account_holder: '',
            iban: '',
            bank_name: '',
        },
    });

    const submitWithdrawal = (e) => {
        e.preventDefault();
        withdrawalForm.post(route('wallet.withdraw'), {
            onSuccess: () => {
                setShowWithdrawalModal(false);
                withdrawalForm.reset();
            },
        });
    };

    const cancelWithdrawal = (withdrawalId) => {
        if (confirm(t('Are you sure you want to cancel this withdrawal request?'))) {
            useForm().delete(route('wallet.cancel', withdrawalId));
        }
    };

    return (
        <div className="min-h-screen bg-oflem-cream font-sans">
            <Head title={t('My Wallet')} />
            <Header />

            <main className="max-w-4xl mx-auto py-16 px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">{t('My Wallet')}</h1>
                    <p className="text-gray-muted font-bold">{t('Track your earnings and manage your balance.')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Balance Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-2 bg-oflem-charcoal rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-60 mb-4">{t('Available Balance')}</p>
                            <h2 className="text-6xl font-black mb-2">
                                <span className="text-oflem-terracotta mr-2">CHF</span>
                                {parseFloat(availableBalance).toFixed(2)}
                            </h2>
                            {pendingWithdrawal > 0 && (
                                <p className="text-sm opacity-75 mb-8">
                                    {t('Pending Withdrawal')}: CHF {parseFloat(pendingWithdrawal).toFixed(2)}
                                </p>
                            )}
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowWithdrawalModal(true)}
                                    disabled={availableBalance < 10}
                                    className="px-8 py-3 bg-white text-oflem-charcoal font-black rounded-full hover:bg-oflem-cream transition-all text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('Withdraw Funds')}
                                </button>
                            </div>
                            {availableBalance < 10 && (
                                <p className="text-xs opacity-60 mt-4">{t('Minimum withdrawal amount is CHF 10.00')}</p>
                            )}
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-oflem-terracotta/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-2xl" />
                    </motion.div>

                    {/* Stats Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[40px] p-10 border border-gray-border shadow-sm flex flex-col justify-center"
                    >
                        <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-1">{t('Total Earned')}</p>
                        <p className="text-2xl font-black text-oflem-charcoal mb-6">
                            CHF {transactions.reduce((acc, curr) => acc + parseFloat(curr.performer_amount), 0).toFixed(2)}
                        </p>
                        <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-1">{t('Withdrawn')}</p>
                        <p className="text-2xl font-black text-oflem-charcoal mb-6">
                            CHF {parseFloat(totalWithdrawn).toFixed(2)}
                        </p>
                        <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-1">{t('Missions')}</p>
                        <p className="text-2xl font-black text-oflem-charcoal">
                            {transactions.length}
                        </p>
                    </motion.div>
                </div>

                {/* Pending Withdrawals */}
                {pendingWithdrawals.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-xl font-black text-oflem-charcoal flex items-center gap-3 mb-6">
                            <span>⏳</span> {t('Pending Withdrawals')}
                        </h3>
                        <div className="bg-white rounded-[40px] border border-gray-border overflow-hidden shadow-sm divide-y divide-gray-border">
                            {pendingWithdrawals.map((withdrawal) => (
                                <div key={withdrawal.id} className="p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-black text-oflem-charcoal mb-1">
                                            CHF {parseFloat(withdrawal.amount).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-muted font-bold">
                                            {t('Requested on')} {new Date(withdrawal.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full ${
                                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {t(withdrawal.status)}
                                        </span>
                                        {withdrawal.status === 'pending' && (
                                            <button
                                                onClick={() => cancelWithdrawal(withdrawal.id)}
                                                className="text-xs font-black text-red-600 hover:text-red-800"
                                            >
                                                {t('Cancel')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-oflem-charcoal flex items-center gap-3">
                        <span>🕒</span> {t('Transaction History')}
                    </h3>

                    <div className="bg-white rounded-[40px] border border-gray-border overflow-hidden shadow-sm">
                        {transactions.length > 0 ? (
                            <div className="divide-y divide-gray-border">
                                {transactions.map((tx, index) => (
                                    <motion.div 
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-8 flex items-center justify-between hover:bg-oflem-cream/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                                📥
                                            </div>
                                            <div>
                                                <p className="font-black text-oflem-charcoal text-lg mb-1">{tx.mission.title}</p>
                                                <p className="text-xs font-bold text-gray-muted uppercase tracking-widest">
                                                    {tx.captured_at ? new Date(tx.captured_at).toLocaleDateString() : t('Processing')} • {t('Mission ID')}: #{tx.mission_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-green-600 mb-1">
                                                + CHF {parseFloat(tx.performer_amount).toFixed(2)}
                                            </p>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {t('Captured')}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <div className="text-6xl mb-6">🏜️</div>
                                <h4 className="text-xl font-black text-oflem-charcoal mb-2">{t('No transactions yet')}</h4>
                                <p className="text-gray-muted font-bold max-w-sm mx-auto">
                                    {t('Complete your first mission to start building your balance!')}
                                </p>
                                <Link 
                                    href={route('providers.index')}
                                    className="inline-block mt-8 px-8 py-3 bg-oflem-terracotta text-white font-black rounded-full hover:opacity-90 transition-all text-sm"
                                >
                                    {t('Find Helpers')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-oflem-charcoal mb-6">{t('Request Withdrawal')}</h2>
                        <form onSubmit={submitWithdrawal} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="amount" value={t('Amount (CHF)')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <TextInput
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="10"
                                    max={availableBalance}
                                    className="w-full"
                                    placeholder="0.00"
                                    value={withdrawalForm.data.amount}
                                    onChange={e => withdrawalForm.setData('amount', e.target.value)}
                                    required
                                />
                                <InputError message={withdrawalForm.errors.amount} className="mt-2" />
                                <p className="text-xs text-gray-muted mt-2">
                                    {t('Available')}: CHF {parseFloat(availableBalance).toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="account_holder" value={t('Account Holder Name')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <TextInput
                                    id="account_holder"
                                    type="text"
                                    className="w-full"
                                    value={withdrawalForm.data.bank_details.account_holder}
                                    onChange={e => withdrawalForm.setData('bank_details', {...withdrawalForm.data.bank_details, account_holder: e.target.value})}
                                    required
                                />
                                <InputError message={withdrawalForm.errors['bank_details.account_holder']} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="iban" value={t('IBAN')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <TextInput
                                    id="iban"
                                    type="text"
                                    className="w-full"
                                    placeholder="CH93 0076 2011 6238 5295 7"
                                    value={withdrawalForm.data.bank_details.iban}
                                    onChange={e => withdrawalForm.setData('bank_details', {...withdrawalForm.data.bank_details, iban: e.target.value})}
                                    required
                                />
                                <InputError message={withdrawalForm.errors['bank_details.iban']} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="bank_name" value={t('Bank Name (Optional)')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <TextInput
                                    id="bank_name"
                                    type="text"
                                    className="w-full"
                                    value={withdrawalForm.data.bank_details.bank_name}
                                    onChange={e => withdrawalForm.setData('bank_details', {...withdrawalForm.data.bank_details, bank_name: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawalModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-oflem-charcoal font-black rounded-full hover:bg-gray-300 transition-all"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={withdrawalForm.processing}
                                    className="flex-1 py-3 bg-oflem-terracotta text-white font-black rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {t('Submit Request')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
