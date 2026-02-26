import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import {
    Clock, ArrowDownLeft, Wallet as WalletIcon, ChevronRight,
    AlertCircle, ArrowUpRight, TrendingUp, TrendingDown,
    ShieldCheck, Banknote, CircleDollarSign, X, CheckCircle2,
    Hourglass, Target, Sparkles, Trophy, Star, Lock,
    Activity, ReceiptText, Landmark, History, CheckCheck,
    XCircle, Tag, Zap, Download, Building, Trash2, FileText, Edit3,
} from 'lucide-react';

/* ─── animation ─────────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Category Palette ───────────────────────────────────────── */
const CATEGORY_COLORS = [
    '#FF7F00', '#0F172A', '#10b981', '#6366f1', '#f59e0b',
    '#ec4899', '#14b8a6', '#8b5cf6', '#ef4444', '#64748b',
];

/* ─── helpers ────────────────────────────────────────────────── */
function fmt(n, dec = 2) {
    return parseFloat(n || 0).toLocaleString(undefined, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
    });
}

function buildMonthlyEarnings(transactions) {
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthMap[key] = { label: d.toLocaleDateString(undefined, { month: 'short' }), total: 0, count: 0 };
    }
    if (transactions) {
        transactions.forEach((tx) => {
            if (!tx.captured_at) return;
            const d = new Date(tx.captured_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (monthMap[key]) {
                monthMap[key].total += parseFloat(tx.provider_amount || 0);
                monthMap[key].count += 1;
            }
        });
    }
    return Object.values(monthMap);
}

/* ─── Custom Bar Tooltip ─────────────────────────────────────── */
const EarningsTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 text-sm">
            <p className="font-black mb-1">{label}</p>
            <p className="text-emerald-400 font-bold">+ CHF {fmt(payload[0]?.value)}</p>
            {payload[0]?.payload?.count > 0 && (
                <p className="text-white/50 text-xs mt-0.5">{payload[0].payload.count} missions</p>
            )}
        </div>
    );
};

/* ─── Custom Pie Tooltip ─────────────────────────────────────── */
const CategoryTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 text-sm">
            <p className="font-black mb-1">{payload[0].name}</p>
            <p className="font-bold" style={{ color: payload[0].fill }}>CHF {fmt(payload[0].value)}</p>
        </div>
    );
};

/* ─── Star Rating ────────────────────────────────────────────── */
const StarRating = ({ rating, count }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
        <span className="text-sm font-black text-[#0F172A]">{rating > 0 ? rating.toFixed(1) : '—'}</span>
        {count > 0 && <span className="text-xs text-slate-400 font-medium">({count} reviews)</span>}
    </div>
);

/* ─── Stat Pill ─────────────────────────────────────────────── */
const StatPill = ({ label, value, accent }) => (
    <div className="flex flex-col items-center justify-center px-5 py-3 bg-white border border-slate-100 rounded-xl shadow-sm min-w-[110px]">
        <p className={`text-sm font-black ${accent ?? 'text-[#0F172A]'}`}>{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
);

/* ─── Withdrawal Modal ───────────────────────────────────────── */
function WithdrawalModal({ availableBalance, savedBankAccounts, onClose, t }) {
    const saved = savedBankAccounts ?? [];
    const [useExisting, setUseExisting] = useState(saved.length > 0 ? 0 : -1);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        bank_details: saved[0] ?? { account_holder: '', iban: '', bank_name: '' },
        save_bank_account: false,
    });

    const selectSaved = (idx) => {
        setUseExisting(idx);
        if (idx >= 0) setData('bank_details', saved[idx]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('wallet.withdraw'), { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                    <X size={16} />
                </button>

                <div className="mb-6">
                    <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00] mb-4">
                        <Banknote size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A]">{t('Withdraw Funds')}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        {t('Available')}: <span className="text-[#0F172A] font-black">CHF {fmt(availableBalance)}</span>
                    </p>
                </div>

                {/* ★ TIER 2 — Saved bank accounts selector */}
                {saved.length > 0 && (
                    <div className="mb-5">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t('Saved Accounts')}</p>
                        <div className="space-y-2">
                            {saved.map((acc, i) => (
                                <button key={i} type="button" onClick={() => selectSaved(i)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                        useExisting === i
                                            ? 'border-[#FF7F00] bg-orange-50'
                                            : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                                    }`}>
                                    <Building size={16} className={useExisting === i ? 'text-[#FF7F00]' : 'text-slate-400'} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-[#0F172A] truncate">{acc.account_holder}</p>
                                        <p className="text-xs font-mono text-slate-400">{String(acc.iban).slice(-10)}</p>
                                    </div>
                                    {useExisting === i && <span className="w-2 h-2 rounded-full bg-[#FF7F00]" />}
                                </button>
                            ))}
                            <button type="button" onClick={() => { setUseExisting(-1); setData('bank_details', { account_holder: '', iban: '', bank_name: '' }); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                    useExisting === -1 ? 'border-[#0F172A] bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}>
                                <span className="text-xs font-black text-slate-500">+ {t('New bank account')}</span>
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel value={t('Amount (CHF)')} className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2" />
                        <TextInput type="number" step="0.01" min="10" max={availableBalance}
                            value={data.amount} onChange={(e) => setData('amount', e.target.value)}
                            className="w-full rounded-xl border-slate-200 text-xl font-black text-[#0F172A] placeholder:text-slate-200 focus:ring-2 focus:ring-[#FF7F00] focus:border-transparent"
                            placeholder="0.00" />
                        <InputError message={errors.amount} className="mt-1" />
                    </div>

                    <div className="border-t border-slate-50 pt-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t('Bank Details')}</p>
                        <div className="space-y-3">
                            {[
                                { key: 'account_holder', label: t('Account Holder'), placeholder: t('Full name as on account') },
                                { key: 'iban', label: 'IBAN', placeholder: 'CH00 0000 0000 0000 0000 0', mono: true },
                                { key: 'bank_name', label: t('Bank Name (Optional)'), placeholder: 'e.g. UBS, Postfinance...' },
                            ].map(({ key, label, placeholder, mono }) => (
                                <div key={key}>
                                    <InputLabel value={label} className="text-xs font-bold text-slate-500 mb-1.5" />
                                    <TextInput value={data.bank_details[key] ?? ''}
                                        onChange={(e) => setData('bank_details', { ...data.bank_details, [key]: e.target.value })}
                                        className={`w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-[#FF7F00] focus:border-transparent ${mono ? 'font-mono' : ''}`}
                                        placeholder={placeholder} />
                                    <InputError message={errors[`bank_details.${key}`]} className="mt-1" />
                                </div>
                            ))}
                        </div>
                        {/* ★ Save for future checkbox */}
                        {useExisting === -1 && (
                            <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
                                <input type="checkbox" checked={data.save_bank_account}
                                    onChange={(e) => setData('save_bank_account', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#FF7F00] focus:ring-[#FF7F00]" />
                                <span className="text-xs font-bold text-slate-500">{t('Save this account for future withdrawals')}</span>
                            </label>
                        )}
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-sm hover:bg-slate-50 transition-colors">
                            {t('Cancel')}
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-3 rounded-xl bg-[#FF7F00] text-white font-black text-sm hover:bg-[#e67300] active:scale-[0.97] transition-all shadow-md shadow-orange-200 disabled:opacity-60">
                            {processing ? t('Processing...') : t('Request Withdrawal')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function Wallet({
    balance, availableBalance, pendingWithdrawal, totalWithdrawn,
    transactions, categoryBreakdown, pendingWithdrawals, withdrawalHistory,
    rating, reviewsCount, savedBankAccounts, earningsVelocity,
}) {
    const { t } = useTranslation();
    const [showModal, setShowModal]           = useState(false);
    const [withdrawalTab, setWithdrawalTab]   = useState('pending');

    const cancelWithdrawal = (id) => {
        if (confirm(t('Are you sure you want to cancel this withdrawal request?'))) {
            router.delete(route('wallet.cancel', id));
        }
    };

    const txCount = transactions?.length ?? 0;

    /* ── financial goal logic (Tier 3 #11) ───────────────── */
    const [goalAmount, setGoalAmount] = useState(() => {
        return parseFloat(localStorage.getItem('oflem_wallet_goal') || '1000');
    });
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal]           = useState(goalAmount);

    const saveGoal = () => {
        const val = parseFloat(tempGoal) || 0;
        setGoalAmount(val);
        localStorage.setItem('oflem_wallet_goal', val.toString());
        setIsEditingGoal(false);
    };

    const goalProgress = goalAmount > 0
        ? Math.min(100, (parseFloat(balance) / goalAmount) * 100)
        : 100;

    /* ── analytics ────────────────────────────────────────────── */
    const monthlyData = useMemo(() => buildMonthlyEarnings(transactions), [transactions]);

    const peakMonth = useMemo(() =>
        monthlyData.reduce((mx, m) => m.total > mx.total ? m : mx, { label: '—', total: 0 }),
    [monthlyData]);

    const curMonth  = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    const mDelta    = curMonth?.total - (prevMonth?.total ?? 0);
    const mDeltaPct = prevMonth?.total > 0 ? ((mDelta / prevMonth.total) * 100).toFixed(0) : null;

    const biggestEarning = useMemo(() => {
        if (!transactions?.length) return null;
        return transactions.reduce((mx, tx) =>
            parseFloat(tx.provider_amount || 0) > parseFloat(mx.provider_amount || 0) ? tx : mx);
    }, [transactions]);

    const withdrawalRatio = parseFloat(balance) > 0
        ? Math.min(100, (parseFloat(totalWithdrawn) / parseFloat(balance)) * 100).toFixed(0)
        : 0;

    /* ── category pie data ────────────────────────────────────── */
    const pieData = useMemo(() =>
        Object.entries(categoryBreakdown || {}).map(([name, value], i) => ({
            name, value, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        })),
    [categoryBreakdown]);

    return (
        <AuthenticatedLayout header={t('My Earnings')} maxWidth="max-w-6xl" showFooter={true}>
            <Head title={t('Wallet & Earnings')} />

            <motion.div initial="hidden" animate="visible" variants={containerVariants}
                className="py-6 px-2 sm:px-0 space-y-8">

                {/* ── HEADER ─────────────────────────────────────────── */}
                <motion.div variants={cardVariants}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF7F00] mb-1">
                            {t('Provider Dashboard')}
                        </p>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
                            {t('Wallet & Earnings')}
                        </h1>
                        {/* ★ TIER 1 #3 — Provider Rating ★ */}
                        {(reviewsCount > 0 || rating > 0) && (
                            <div className="mt-2">
                                <StarRating rating={rating} count={reviewsCount} />
                            </div>
                        )}
                    </div>

                    <button onClick={() => setShowModal(true)}
                        disabled={parseFloat(availableBalance) < 10}
                        className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF7F00] text-white font-bold text-sm rounded-xl hover:bg-[#e67300] active:scale-[0.97] transition-all shadow-md shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                        <Banknote size={16} />
                        {t('Withdraw Funds')}
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                    {/* ★ TIER 2 #10 — CSV Export */}
                    <a href={route('wallet.export')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <Download size={15} />
                        {t('Export CSV')}
                    </a>
                    {/* ★ TIER 3 #12 — Tax Report */}
                    <Link href={route('wallet.tax')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <FileText size={15} />
                        {t('Tax Report')}
                    </Link>
                </motion.div>

                {/* ── QUICK STATS STRIP ──────────────────────────────── */}
                <motion.div variants={cardVariants} className="flex flex-wrap gap-3">
                    <StatPill label={t('Missions')} value={txCount} />
                    <StatPill label={t('Withdrawn')} value={`${withdrawalRatio}%`} accent="text-emerald-600" />
                    {earningsVelocity?.perDay > 0 && (
                        <StatPill label={t('CHF/day')} value={`CHF ${fmt(earningsVelocity.perDay, 0)}`} accent="text-emerald-600" />
                    )}
                    {peakMonth.total > 0 && (
                        <StatPill label={t('Peak Month')} value={peakMonth.label} accent="text-[#FF7F00]" />
                    )}
                    {biggestEarning && (
                        <StatPill label={t('Best Payout')} value={`CHF ${fmt(biggestEarning.provider_amount, 0)}`} accent="text-emerald-600" />
                    )}
                    {mDeltaPct !== null && (
                        <StatPill label={t('vs Last Month')}
                            value={`${mDelta >= 0 ? '+' : ''}${mDeltaPct}%`}
                            accent={mDelta >= 0 ? 'text-emerald-600' : 'text-red-500'} />
                    )}
                    {rating > 0 && (
                        <StatPill label={t('Rating')} value={`⭐ ${rating.toFixed(1)}`} accent="text-amber-500" />
                    )}
                </motion.div>

                {/* ★ TIER 2 #7 — Earnings Velocity */}
                {earningsVelocity?.perDay > 0 && (
                    <motion.div variants={cardVariants}
                        className="bg-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="flex flex-wrap items-center gap-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                                    <Zap size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{t('Earnings Velocity')}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white tracking-tight">CHF {fmt(earningsVelocity.perDay, 0)}</span>
                                        <span className="text-white/40 text-sm font-bold">/{t('day')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{t('This Month')}</p>
                                    <p className="text-lg font-black text-emerald-400">+ CHF {fmt(earningsVelocity.currentMonth, 0)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{t('30-Day Projection')}</p>
                                    <p className="text-lg font-black text-white">CHF {fmt(earningsVelocity.projectedMonthly, 0)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{t('Days Tracked')}</p>
                                    <p className="text-lg font-black text-white/70">{earningsVelocity.dayOfMonth}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    </motion.div>
                )}

                {/* ★ TIER 3 #11 — Financial Goal Progress Ring */}
                <motion.div variants={cardVariants}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-32 h-32 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * goalProgress) / 100}
                                strokeLinecap="round"
                                className="text-[#FF7F00] transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[#0F172A] leading-none">{goalProgress.toFixed(0)}%</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('Goal')}</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Target size={18} className="text-[#FF7F00]" />
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Financial Goal')}</h2>
                        </div>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            {goalProgress >= 100
                                ? t("Congratulations! You've reached your financial goal. Keep up the amazing work.")
                                : t("You're on your way! Reaching your goal will unlock new tier milestones.")}
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-center md:items-end gap-1">
                        <div className="flex items-center gap-2">
                            {isEditingGoal ? (
                                <div className="flex items-center gap-1">
                                    <input type="number" value={tempGoal} onChange={(e) => setTempGoal(e.target.value)}
                                        className="w-24 px-2 py-1 text-sm font-black border-slate-200 rounded-lg focus:ring-1 focus:ring-[#FF7F00]" />
                                    <button onClick={saveGoal} className="bg-[#FF7F00] text-white p-1 rounded-lg">
                                        <CheckCheck size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-xl font-black text-[#0F172A]">CHF {fmt(goalAmount, 0)}</span>
                                    <button onClick={() => { setTempGoal(goalAmount); setIsEditingGoal(true); }}
                                        className="text-slate-300 hover:text-[#FF7F00] transition-colors">
                                        <Edit3 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Target Earnings')}</p>
                    </div>
                </motion.div>

                {/* ── TOP 3-CARD ROW ─────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Card 1 — Total Balance */}
                    <motion.div variants={cardVariants}
                        className="md:col-span-1 bg-[#0F172A] rounded-2xl p-7 text-white relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[240px]">
                        <div className="relative z-10">
                            <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center mb-5">
                                <WalletIcon size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">{t('Total Balance')}</p>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-base font-bold text-white/50">CHF</span>
                                <span className="text-5xl font-black tracking-tighter leading-none text-[#FF7F00]">
                                    {fmt(balance, 0)}
                                </span>
                            </div>
                            <p className="text-white/30 text-xs font-medium">{t('Gross earnings to date')}</p>
                        </div>
                        <div className="relative z-10 mt-auto pt-5 border-t border-white/10">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('Withdrawn')}</span>
                                <span className="text-[10px] font-black text-white/60">{withdrawalRatio}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FF7F00] rounded-full transition-all duration-700"
                                    style={{ width: `${withdrawalRatio}%` }} />
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#FF7F00]/5 rounded-full" />
                    </motion.div>

                    {/* Card 2 — Available */}
                    <motion.div variants={cardVariants}
                        className="bg-white rounded-2xl p-7 border border-slate-100 shadow-lg flex flex-col justify-between min-h-[240px]">
                        <div>
                            <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00] mb-5">
                                <CircleDollarSign size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Available to Withdraw')}</p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-base font-bold text-slate-400">CHF</span>
                                <span className="text-4xl font-black text-[#0F172A] tracking-tighter">
                                    {fmt(availableBalance, 0)}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium">{t('Ready to be transferred')}</p>
                        </div>
                        <div className="mt-auto pt-5 border-t border-slate-50">
                            <button onClick={() => setShowModal(true)}
                                disabled={parseFloat(availableBalance) < 10}
                                className="w-full py-2.5 bg-[#0F172A] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#FF7F00] active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                {t('Request Withdrawal')}
                            </button>
                        </div>
                    </motion.div>

                    {/* Card 3 — Pending + Rating */}
                    <motion.div variants={cardVariants}
                        className="bg-white rounded-2xl p-7 border border-slate-100 shadow-lg flex flex-col gap-4">
                        <div className="flex-1">
                            <div className="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 mb-5">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Pending Clearance')}</p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-base font-bold text-slate-400">CHF</span>
                                <span className="text-4xl font-black text-[#0F172A] tracking-tighter">
                                    {fmt(pendingWithdrawal, 0)}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium">{t('Processing 3–5 business days')}</p>
                        </div>

                        <div className="border-t border-slate-50 pt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{t('Total Withdrawn')}</p>
                                <p className="text-sm font-black text-[#0F172A]">CHF {fmt(totalWithdrawn, 0)}</p>
                            </div>
                            {/* ★ TIER 1 #3 — Rating in card ★ */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('My Rating')}</p>
                                <StarRating rating={rating ?? 0} count={reviewsCount ?? 0} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── EARNINGS ANALYTICS ─────────────────────────────── */}
                <motion.div variants={cardVariants} className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                            <Sparkles size={14} strokeWidth={2.5} />
                        </span>
                        <h2 className="text-lg font-black text-[#0F172A]">{t('Earnings Analytics')}</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Bar Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-lg p-7">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{t('Monthly Earnings')}</p>
                                    <p className="text-xl font-black text-[#0F172A]">{t('Last 6 Months')}</p>
                                </div>
                                {mDeltaPct !== null && (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                                        mDelta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                        {mDelta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                        {mDelta >= 0 ? '+' : ''}{mDeltaPct}%
                                    </span>
                                )}
                            </div>
                            {txCount > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={monthlyData} barSize={32} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                            tickFormatter={(v) => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'} />
                                        <Tooltip content={<EarningsTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
                                        <Bar dataKey="total" radius={[6, 6, 2, 2]}>
                                            {monthlyData.map((entry, i) => (
                                                <Cell key={i}
                                                    fill={entry.total === peakMonth.total && entry.total > 0 ? '#10b981' : '#0F172A'}
                                                    fillOpacity={entry.total === peakMonth.total && entry.total > 0 ? 1 : 0.1} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-slate-200">
                                    <Activity size={44} strokeWidth={1} className="mb-3" />
                                    <p className="text-sm font-bold text-slate-300">{t('No earnings data yet')}</p>
                                </div>
                            )}
                        </div>

                        {/* Insight Cards */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden flex-1">
                                <div className="relative z-10">
                                    <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                                        <Trophy size={16} className="text-emerald-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{t('Best Earning Month')}</p>
                                    <p className="text-2xl font-black text-white mb-0.5">
                                        {peakMonth.total > 0 ? peakMonth.label : '—'}
                                    </p>
                                    {peakMonth.total > 0 && (
                                        <p className="text-emerald-400 text-sm font-black">+ CHF {fmt(peakMonth.total, 0)}</p>
                                    )}
                                </div>
                                <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-emerald-500/10 rounded-full" />
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md flex-1">
                                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                                    <Star size={16} className="text-[#FF7F00]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{t('Biggest Single Earning')}</p>
                                {biggestEarning ? (
                                    <>
                                        <p className="text-2xl font-black text-emerald-600 mb-0.5">+ CHF {fmt(biggestEarning.provider_amount, 0)}</p>
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {biggestEarning.mission?.title ?? `Mission #${biggestEarning.mission_id}`}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-slate-300 text-sm font-bold">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ★ TIER 1 #1 — Category Breakdown Donut ★ */}
                {pieData.length > 0 && (
                    <motion.div variants={cardVariants} className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                <Tag size={14} strokeWidth={2.5} />
                            </span>
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Earnings by Category')}</h2>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-7">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                            paddingAngle={3} stroke="none">
                                            {pieData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CategoryTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="space-y-2">
                                    {pieData.map((entry, i) => {
                                        const total = pieData.reduce((s, e) => s + e.value, 0);
                                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
                                        return (
                                            <div key={i} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                                                    <span className="text-sm font-bold text-[#0F172A] truncate">{entry.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-xs font-bold text-slate-400">{pct}%</span>
                                                    <span className="text-sm font-black text-[#0F172A]">CHF {fmt(entry.value, 0)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ★ TIER 1 #4 — Withdrawal Tabs (Pending + History) ★ */}
                <motion.div variants={cardVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                                <Hourglass size={14} strokeWidth={2.5} />
                            </span>
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Withdrawals')}</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            {[
                                { key: 'pending', label: t('Pending'), count: pendingWithdrawals?.length ?? 0 },
                                { key: 'history', label: t('History'), count: withdrawalHistory?.length ?? 0 },
                            ].map(({ key, label, count }) => (
                                <button key={key} onClick={() => setWithdrawalTab(key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                                        withdrawalTab === key
                                            ? 'bg-[#0F172A] text-white shadow-md'
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                                    }`}>
                                    {label}
                                    {count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                            withdrawalTab === key ? 'bg-white/20' : 'bg-slate-200'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg">
                        <AnimatePresence mode="wait">
                            {withdrawalTab === 'pending' ? (
                                <motion.div key="pending"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}>
                                    {pendingWithdrawals?.length > 0 ? (
                                        <div className="divide-y divide-slate-50">
                                            {pendingWithdrawals.map((w) => (
                                                <div key={w.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/60 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 shrink-0 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                                                            <Clock size={17} strokeWidth={2.5} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0F172A] text-sm">CHF {fmt(w.amount)}</p>
                                                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                                {new Date(w.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                {w.bank_details?.iban && (
                                                                    <> · <span className="font-mono">{String(w.bank_details.iban).slice(-6)}</span></>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            {w.status === 'approved' ? t('Approved') : t('Pending')}
                                                        </span>
                                                        {w.status === 'pending' && (
                                                            <button onClick={() => cancelWithdrawal(w.id)}
                                                                className="px-3 py-1 rounded-lg text-xs font-black text-red-500 border border-red-100 hover:bg-red-50 transition-colors">
                                                                {t('Cancel')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-slate-300">
                                            <Hourglass size={36} strokeWidth={1} className="mx-auto mb-3" />
                                            <p className="text-sm font-bold text-slate-400">{t('No pending withdrawals')}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                /* ★ TIER 1 #4 — History Tab ★ */
                                <motion.div key="history"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}>
                                    {withdrawalHistory?.length > 0 ? (
                                        <div className="divide-y divide-slate-50">
                                            {withdrawalHistory.map((w) => (
                                                <div key={w.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                                                            w.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'}`}>
                                                            {w.status === 'completed'
                                                                ? <CheckCheck size={17} strokeWidth={2.5} />
                                                                : <XCircle size={17} strokeWidth={2.5} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#0F172A] text-sm">CHF {fmt(w.amount)}</p>
                                                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                                {w.processed_at
                                                                    ? new Date(w.processed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                                                                    : '—'}
                                                                {w.bank_details?.iban && (
                                                                    <> · <span className="font-mono">{String(w.bank_details.iban).slice(-6)}</span></>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                            w.status === 'completed'
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                            {w.status === 'completed' ? t('Completed') : t('Rejected')}
                                                        </span>
                                                        {w.admin_notes && (
                                                            <p className="text-[11px] text-slate-400 text-right max-w-[200px] truncate">{w.admin_notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <History size={36} strokeWidth={1} className="mx-auto mb-3 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400">{t('No completed withdrawals yet')}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ── EARNINGS HISTORY ───────────────────────────────── */}
                <motion.div variants={cardVariants}>
                    <div className="flex items-center gap-2.5 mb-4">
                        <span className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00]">
                            <ReceiptText size={14} strokeWidth={2.5} />
                        </span>
                        <h2 className="text-lg font-black text-[#0F172A]">{t('Earnings History')}</h2>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                            {txCount} {t('total')}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg">
                        {txCount > 0 ? (
                            <div>
                                <div className="hidden md:grid grid-cols-12 gap-4 px-7 py-3 border-b border-slate-50 bg-slate-50/60">
                                    <span className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Mission')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Category')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Date')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Status')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{t('Earned')}</span>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {transactions.map((tx, i) => (
                                        <motion.div key={tx.id}
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-5 md:px-7 py-4 hover:bg-slate-50/70 transition-colors group">
                                            <div className="md:col-span-4 flex items-center gap-3">
                                                <div className="w-9 h-9 shrink-0 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00] group-hover:bg-[#FF7F00] group-hover:text-white transition-all">
                                                    <CheckCircle2 size={16} strokeWidth={2.5} />
                                                </div>
                                                <p className="font-black text-[#0F172A] text-sm truncate">
                                                    {tx.mission?.title ?? `Mission #${tx.mission_id}`}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 hidden md:block">
                                                {tx.mission?.category ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wide truncate max-w-full">
                                                        {tx.mission.category}
                                                    </span>
                                                ) : <span className="text-slate-300 text-xs">—</span>}
                                            </div>
                                            <div className="md:col-span-2 hidden md:block">
                                                <p className="text-sm font-bold text-slate-500">
                                                    {tx.captured_at
                                                        ? new Date(tx.captured_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : t('Processing')}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 hidden md:block">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {t('Cleared')}
                                                </span>
                                            </div>
                                            <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                                                <p className="text-base font-black text-emerald-600 tracking-tight">
                                                    + CHF {fmt(tx.provider_amount)}
                                                </p>
                                                <Link href={route('missions.show', tx.mission_id)}
                                                    className="w-8 h-8 shrink-0 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#FF7F00] hover:text-white transition-all">
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="px-7 py-4 border-t border-slate-50 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {txCount} {t('Earnings recorded')}
                                    </p>
                                    <p className="text-sm font-black text-emerald-600">
                                        {t('Total')}: + CHF {fmt(transactions.reduce((s, tx) => s + parseFloat(tx.provider_amount || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 px-10 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                                    <Target size={40} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-xl font-black text-[#0F172A] mb-2">{t('No earnings yet')}</h4>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 leading-relaxed text-sm">
                                    {t('Complete your first mission to start building your earnings history here.')}
                                </p>
                                <Link href={route('missions.active')}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F172A] text-white font-black text-sm rounded-xl hover:bg-[#FF7F00] transition-all shadow-lg shadow-slate-200">
                                    {t('Browse Available Missions')}
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── BANK INFO NOTICE ───────────────────────────────── */}
                <motion.div variants={cardVariants}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-9 h-9 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Landmark size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-black text-[#0F172A] text-sm mb-1">{t('Secure Bank Transfers')}</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            {t('Withdrawals are processed via SEPA transfer within 3–5 business days. Your IBAN data is encrypted and never stored in plain text.')}
                        </p>
                    </div>
                    <div className="ml-auto shrink-0">
                        <Lock size={14} className="text-slate-300" />
                    </div>
                </motion.div>

                {/* ── LOW BALANCE WARNING ────────────────────────────── */}
                {parseFloat(availableBalance) < 10 && parseFloat(availableBalance) >= 0 && (
                    <motion.div variants={cardVariants}
                        className="flex items-start gap-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-black text-amber-700 text-sm mb-0.5">{t('Minimum withdrawal is CHF 10')}</p>
                            <p className="text-amber-600 text-xs font-medium">
                                {t('Complete more missions to accumulate enough balance to request a withdrawal.')}
                            </p>
                        </div>
                    </motion.div>
                )}

            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <WithdrawalModal
                        availableBalance={availableBalance}
                        savedBankAccounts={savedBankAccounts}
                        onClose={() => setShowModal(false)}
                        t={t}
                    />
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
