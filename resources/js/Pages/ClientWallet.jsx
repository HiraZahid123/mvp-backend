import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import {
    CreditCard, ArrowUpRight, Target, PlusCircle, TrendingUp,
    TrendingDown, Clock, Wallet as WalletIcon, ShieldCheck,
    ChevronRight, CheckCircle2, Flame, BarChart3, Sparkles,
    Award, ReceiptText, Star, ArrowRight, Tag, Percent,
    Building2, Users, Info, Download, AlertTriangle, RefreshCw, XCircle,
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

function buildMonthlyData(payments) {
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthMap[key] = { label: d.toLocaleDateString(undefined, { month: 'short' }), total: 0, count: 0 };
    }
    if (payments) {
        payments.forEach((p) => {
            if (!p.captured_at) return;
            const d = new Date(p.captured_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (monthMap[key]) {
                monthMap[key].total += parseFloat(p.amount || 0);
                monthMap[key].count += 1;
            }
        });
    }
    return Object.values(monthMap);
}

/* ─── Custom Tooltips ────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 text-sm">
            <p className="font-black mb-1">{label}</p>
            <p className="text-[#FF7F00] font-bold">CHF {fmt(payload[0]?.value)}</p>
            {payload[0]?.payload?.count > 0 && (
                <p className="text-white/50 text-xs mt-0.5">{payload[0].payload.count} missions</p>
            )}
        </div>
    );
};

const CategoryTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 text-sm">
            <p className="font-black mb-1">{payload[0].name}</p>
            <p className="font-bold" style={{ color: payload[0].fill }}>CHF {fmt(payload[0].value)}</p>
        </div>
    );
};

/* ─── Stat Pill ─────────────────────────────────────────────── */
const StatPill = ({ label, value, accent }) => (
    <div className="flex flex-col items-center justify-center px-5 py-3 bg-white border border-slate-100 rounded-xl shadow-sm min-w-[110px]">
        <p className={`text-sm font-black ${accent ?? 'text-[#0F172A]'}`}>{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
);

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function ClientWallet({ totalSpent, totalCommission, totalToProvider, categoryBreakdown, payments, issuePayments, totalRefunded, repeatProviders }) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');

    const missionCount    = payments?.length ?? 0;
    const avgPerMission   = missionCount > 0 ? totalSpent / missionCount : 0;
    const commissionRate  = totalSpent > 0 ? ((totalCommission / totalSpent) * 100).toFixed(0) : 0;
    const lastPaymentDate = payments?.[0]?.captured_at
        ? new Date(payments[0].captured_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    /* analytics */
    const monthlyData = useMemo(() => buildMonthlyData(payments), [payments]);
    const peakMonth = useMemo(() =>
        monthlyData.reduce((mx, m) => m.total > mx.total ? m : mx, { label: '—', total: 0 }),
    [monthlyData]);
    const curMonth  = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    const mDelta    = curMonth?.total - (prevMonth?.total ?? 0);
    const mDeltaPct = prevMonth?.total > 0 ? ((mDelta / prevMonth.total) * 100).toFixed(0) : null;

    const biggestPayment = useMemo(() => {
        if (!payments?.length) return null;
        return payments.reduce((mx, p) =>
            parseFloat(p.amount || 0) > parseFloat(mx.amount || 0) ? p : mx);
    }, [payments]);

    const filteredPayments = payments?.filter((p) => {
        if (filter === 'all') return true;
        return new Date(p.captured_at).getMonth() === new Date().getMonth();
    }) ?? [];

    /* category pie */
    const pieData = useMemo(() =>
        Object.entries(categoryBreakdown || {}).map(([name, value], i) => ({
            name, value, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        })),
    [categoryBreakdown]);

    return (
        <AuthenticatedLayout header={t('My Wallet')} maxWidth="max-w-6xl" showFooter={true}>
            <Head title={t('Wallet')} />

            <motion.div initial="hidden" animate="visible" variants={containerVariants}
                className="py-6 px-2 sm:px-0 space-y-8">

                {/* ── HEADER ─────────────────────────────────────────── */}
                <motion.div variants={cardVariants}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF7F00] mb-1">
                            {t('Financial Overview')}
                        </p>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">{t('Wallet Overview')}</h1>
                    </div>
                    <Link href={route('missions.create')}
                        className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF7F00] text-white font-bold text-sm rounded-xl hover:bg-[#e67300] active:scale-[0.97] transition-all shadow-md shadow-orange-200">
                        <PlusCircle size={16} />
                        {t('Create New Mission')}
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    {/* ★ TIER 2 #10 — CSV Export */}
                    <a href={route('wallet.client.export')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <Download size={15} />
                        {t('Export CSV')}
                    </a>
                </motion.div>

                {/* ── QUICK STATS STRIP ──────────────────────────────── */}
                <motion.div variants={cardVariants} className="flex flex-wrap gap-3">
                    <StatPill label={t('Missions')} value={missionCount} />
                    <StatPill label={t('Avg/Mission')} value={`CHF ${fmt(avgPerMission, 0)}`} />
                    {peakMonth.total > 0 && (
                        <StatPill label={t('Peak Month')} value={peakMonth.label} accent="text-[#FF7F00]" />
                    )}
                    {biggestPayment && (
                        <StatPill label={t('Biggest Pay')} value={`CHF ${fmt(biggestPayment.amount, 0)}`} />
                    )}
                    {mDeltaPct !== null && (
                        <StatPill label={t('vs Last Month')}
                            value={`${mDelta >= 0 ? '+' : ''}${mDeltaPct}%`}
                            accent={mDelta >= 0 ? 'text-emerald-600' : 'text-red-500'} />
                    )}
                </motion.div>

                {/* ── HERO 3-CARD ROW ────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Card 1 — Total Spent */}
                    <motion.div variants={cardVariants}
                        className="md:col-span-1 bg-[#FF7F00] rounded-2xl p-7 text-white relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[240px]">
                        <div className="relative z-10">
                            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center mb-5">
                                <WalletIcon size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">{t('Total Spent')}</p>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-base font-bold text-white/80">CHF</span>
                                <span className="text-5xl font-black tracking-tighter leading-none">{fmt(totalSpent, 0)}</span>
                            </div>
                            <p className="text-white/60 text-xs font-medium">{t('Across all your missions')}</p>
                        </div>
                        <div className="relative z-10 mt-auto pt-5 border-t border-white/20 flex items-center justify-between">
                            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                                {missionCount} {t('missions paid')}
                            </span>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Flame size={14} />
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-black/10 rounded-full" />
                    </motion.div>

                    {/* Card 2 — Avg per Mission */}
                    <motion.div variants={cardVariants}
                        className="bg-white rounded-2xl p-7 border border-slate-100 shadow-lg flex flex-col justify-between min-h-[240px]">
                        <div>
                            <div className="w-11 h-11 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00] mb-5">
                                <BarChart3 size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Avg. Per Mission')}</p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-base font-bold text-slate-400">CHF</span>
                                <span className="text-4xl font-black text-[#0F172A] tracking-tighter">{fmt(avgPerMission, 0)}</span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium">{t('Average investment per task')}</p>
                        </div>
                        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center gap-2 text-emerald-500">
                            <TrendingUp size={13} />
                            <span className="text-xs font-bold">{t('Smart budget tracking')}</span>
                        </div>
                    </motion.div>

                    {/* Card 3 — Last Payment */}
                    <motion.div variants={cardVariants}
                        className="bg-white rounded-2xl p-7 border border-slate-100 shadow-lg flex flex-col justify-between min-h-[240px]">
                        <div>
                            <div className="w-11 h-11 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-5">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Last Payment')}</p>
                            <p className="text-2xl font-black text-[#0F172A] tracking-tight mb-1 leading-snug">
                                {lastPaymentDate ?? t('No activity')}
                            </p>
                            <p className="text-slate-400 text-xs font-medium">{t('Most recent mission payment')}</p>
                        </div>
                        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                            <ShieldCheck size={13} />
                            <span className="text-xs font-bold">{t('Secured by Oflem Escrow')}</span>
                        </div>
                    </motion.div>
                </div>

                {/* ★ TIER 1 #2 + #5 — Commission Transparency & Platform Fee ★ */}
                <motion.div variants={cardVariants} className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-violet-500">
                            <Info size={14} strokeWidth={2.5} />
                        </span>
                        <h2 className="text-lg font-black text-[#0F172A]">{t('Payment Breakdown')}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {/* Total to Providers */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
                                <Users size={18} strokeWidth={2.5} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {t('Paid to Providers')}
                            </p>
                            <p className="text-2xl font-black text-emerald-600 mb-0.5">
                                CHF {fmt(totalToProvider ?? 0, 0)}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                {totalSpent > 0
                                    ? `${(((totalToProvider ?? 0) / totalSpent) * 100).toFixed(0)}% ${t('of total')}`
                                    : '—'}
                            </p>
                        </div>

                        {/* Platform Commission (Tier 1 #2) */}
                        <div className="bg-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-[#FF7F00]/20 rounded-lg flex items-center justify-center text-[#FF7F00] mb-4">
                                    <Percent size={18} strokeWidth={2.5} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                                    {t('Platform Fee Paid')}
                                </p>
                                <p className="text-2xl font-black text-white mb-0.5">
                                    CHF {fmt(totalCommission ?? 0, 0)}
                                </p>
                                <p className="text-xs text-white/40 font-medium">
                                    {commissionRate}% {t('avg commission')}
                                </p>
                            </div>
                            <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-[#FF7F00]/10 rounded-full" />
                        </div>

                        {/* ★ Tier 1 #5 — Platform Fee Summary ★ */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00] mb-4">
                                <Building2 size={18} strokeWidth={2.5} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {t('Oflem Contribution')}
                            </p>
                            <p className="text-2xl font-black text-[#0F172A] mb-0.5">
                                CHF {fmt(totalCommission ?? 0, 0)}
                            </p>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                {t('Powers platform security, escrow & support')}
                            </p>
                        </div>
                    </div>

                    {/* Visual breakdown bar */}
                    {totalSpent > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('How your CHF is split')}</p>
                                <p className="text-xs font-black text-slate-500">CHF {fmt(totalSpent, 0)} {t('total')}</p>
                            </div>
                            <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5">
                                <div
                                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-700"
                                    style={{ width: `${((totalToProvider ?? 0) / totalSpent * 100).toFixed(1)}%` }}
                                    title={`Provider: CHF ${fmt(totalToProvider, 0)}`}
                                />
                                <div
                                    className="h-full bg-[#FF7F00] rounded-r-full transition-all duration-700"
                                    style={{ width: `${((totalCommission ?? 0) / totalSpent * 100).toFixed(1)}%` }}
                                    title={`Platform: CHF ${fmt(totalCommission, 0)}`}
                                />
                            </div>
                            <div className="flex items-center gap-5 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-500">{t('Provider')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#FF7F00]" />
                                    <span className="text-[10px] font-bold text-slate-500">{t('Platform fee')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* ── SPENDING ANALYTICS ─────────────────────────────── */}
                <motion.div variants={cardVariants} className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00]">
                            <Sparkles size={14} strokeWidth={2.5} />
                        </span>
                        <h2 className="text-lg font-black text-[#0F172A]">{t('Spending Analytics')}</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Bar Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-lg p-7">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{t('Monthly Spending')}</p>
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
                            {missionCount > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={monthlyData} barSize={32} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                            tickFormatter={(v) => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
                                        <Bar dataKey="total" radius={[6, 6, 2, 2]}>
                                            {monthlyData.map((entry, i) => (
                                                <Cell key={i}
                                                    fill={entry.total === peakMonth.total && entry.total > 0 ? '#FF7F00' : '#0F172A'}
                                                    fillOpacity={entry.total === peakMonth.total && entry.total > 0 ? 1 : 0.1} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-slate-200">
                                    <BarChart3 size={44} strokeWidth={1} className="mb-3" />
                                    <p className="text-sm font-bold text-slate-300">{t('No spending data yet')}</p>
                                </div>
                            )}
                        </div>

                        {/* Insight Cards */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden flex-1">
                                <div className="relative z-10">
                                    <div className="w-9 h-9 bg-[#FF7F00]/20 rounded-lg flex items-center justify-center mb-4">
                                        <Award size={16} className="text-[#FF7F00]" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">{t('Peak Spend Month')}</p>
                                    <p className="text-2xl font-black text-white mb-0.5">
                                        {peakMonth.total > 0 ? peakMonth.label : '—'}
                                    </p>
                                    {peakMonth.total > 0 && (
                                        <p className="text-[#FF7F00] text-sm font-black">CHF {fmt(peakMonth.total, 0)}</p>
                                    )}
                                </div>
                                <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-[#FF7F00]/10 rounded-full" />
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md flex-1">
                                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                                    <Star size={16} className="text-[#FF7F00]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{t('Biggest Payment')}</p>
                                {biggestPayment ? (
                                    <>
                                        <p className="text-2xl font-black text-[#0F172A] mb-0.5">CHF {fmt(biggestPayment.amount, 0)}</p>
                                        <p className="text-xs text-slate-400 font-medium truncate">
                                            {biggestPayment.mission?.title ?? `Mission #${biggestPayment.mission_id}`}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-slate-300 text-sm font-bold">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ★ TIER 1 #1 — Category Spending Donut ★ */}
                {pieData.length > 0 && (
                    <motion.div variants={cardVariants} className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                <Tag size={14} strokeWidth={2.5} />
                            </span>
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Spending by Category')}</h2>
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

                                <div className="space-y-2.5">
                                    {pieData.map((entry, i) => {
                                        const total = pieData.reduce((s, e) => s + e.value, 0);
                                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                                                        <span className="text-sm font-bold text-[#0F172A] truncate">{entry.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs font-bold text-slate-400">{pct}%</span>
                                                        <span className="text-sm font-black text-[#0F172A]">CHF {fmt(entry.value, 0)}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${pct}%`, background: entry.fill }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── ESCROW NOTICE ──────────────────────────────────── */}
                <motion.div variants={cardVariants}
                    className="bg-[#0F172A] rounded-2xl p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-7 text-white relative overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <p className="text-[#FF7F00] text-[10px] font-black uppercase tracking-widest mb-2">{t('How it works')}</p>
                        <h3 className="text-xl font-black mb-2 leading-tight">{t('Secured Escrow Payments')}</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg">
                            {t('Your money is held securely in escrow and only released to the provider once you validate the completed mission. You are always protected.')}
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-wrap gap-2.5">
                        {['Fund mission', 'Work is done', 'You validate', 'Provider paid'].map((step, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl">
                                <span className="w-5 h-5 bg-[#FF7F00] rounded-full text-[10px] font-black text-white flex items-center justify-center">{i + 1}</span>
                                <span className="text-xs font-bold text-white/80">{t(step)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-[#FF7F00]/8 rounded-full blur-3xl" />
                </motion.div>

                {/* ── TRANSACTION HISTORY ────────────────────────────── */}
                <motion.div variants={cardVariants}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00]">
                                <ReceiptText size={14} strokeWidth={2.5} />
                            </span>
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Transaction History')}</h2>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                {missionCount} {t('total')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {['all', 'month'].map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        filter === f
                                            ? 'bg-[#0F172A] text-white shadow-md'
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                                    }`}>
                                    {f === 'all' ? t('All') : t('This Month')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg">
                        {filteredPayments.length > 0 ? (
                            <div>
                                <div className="hidden md:grid grid-cols-12 gap-4 px-7 py-3 border-b border-slate-50 bg-slate-50/60">
                                    <span className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Mission')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Category')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Date')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Status')}</span>
                                    <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{t('Amount')}</span>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {filteredPayments.map((payment, i) => (
                                        <motion.div key={payment.id}
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-5 md:px-7 py-4 hover:bg-slate-50/70 transition-colors group">
                                            <div className="md:col-span-4 flex items-center gap-3">
                                                <div className="w-9 h-9 shrink-0 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF7F00] group-hover:bg-[#FF7F00] group-hover:text-white transition-all">
                                                    <CheckCircle2 size={16} strokeWidth={2.5} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-[#0F172A] text-sm truncate">
                                                        {payment.mission?.title ?? `Mission #${payment.mission_id}`}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5 md:hidden">
                                                        {payment.captured_at ? new Date(payment.captured_at).toLocaleDateString() : t('Processing')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 hidden md:block">
                                                {payment.mission?.category ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wide truncate max-w-full">
                                                        {payment.mission.category}
                                                    </span>
                                                ) : <span className="text-slate-300 text-xs">—</span>}
                                            </div>

                                            <div className="md:col-span-2 hidden md:block">
                                                <p className="text-sm font-bold text-slate-500">
                                                    {payment.captured_at
                                                        ? new Date(payment.captured_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : t('Processing')}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">ID #{payment.mission_id}</p>
                                            </div>

                                            <div className="md:col-span-2 hidden md:block">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {t('Paid')}
                                                </span>
                                            </div>

                                            <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                                                <div className="text-right">
                                                    <p className="text-base font-black text-[#0F172A] tracking-tight">
                                                        − CHF {fmt(payment.amount)}
                                                    </p>
                                                    {payment.platform_commission > 0 && (
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            fee: {fmt(payment.platform_commission)}
                                                        </p>
                                                    )}
                                                </div>
                                                <Link href={route('missions.show', payment.mission_id)}
                                                    className="w-8 h-8 shrink-0 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#FF7F00] hover:text-white transition-all">
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="px-7 py-4 border-t border-slate-50 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {filteredPayments.length} {t('Transactions shown')}
                                    </p>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#0F172A]">
                                            {t('Total')}: CHF {fmt(filteredPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0))}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {t('Provider received')}: CHF {fmt(filteredPayments.reduce((s, p) => s + parseFloat(p.provider_amount || 0), 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 px-10 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                                    <Target size={40} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-xl font-black text-[#0F172A] mb-2">{t('No payments yet')}</h4>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 leading-relaxed text-sm">
                                    {t('Once you create and pay for your first mission, all transaction details will appear here.')}
                                </p>
                                <Link href={route('missions.create')}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F172A] text-white font-black text-sm rounded-xl hover:bg-[#FF7F00] transition-all shadow-lg shadow-slate-200">
                                    <PlusCircle size={16} />
                                    {t('Post Your First Mission')}
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ★ TIER 2 #9 — Refunds & Disputes Section */}
                {issuePayments?.length > 0 && (
                    <motion.div variants={cardVariants} className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                <AlertTriangle size={14} strokeWidth={2.5} />
                            </span>
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Refunds & Disputes')}</h2>
                            {totalRefunded > 0 && (
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                    + CHF {fmt(totalRefunded, 0)} {t('refunded')}
                                </span>
                            )}
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {issuePayments.map((p, i) => (
                                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                                                p.status === 'refunded' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'
                                            }`}>
                                                {p.status === 'refunded'
                                                    ? <RefreshCw size={16} strokeWidth={2.5} />
                                                    : <XCircle size={16} strokeWidth={2.5} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-[#0F172A] text-sm">
                                                    {p.mission?.title ?? `Mission #${p.mission_id}`}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    {p.mission?.category && <span className="capitalize">{p.mission.category} · </span>}
                                                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className={`text-base font-black ${
                                                p.status === 'refunded' ? 'text-emerald-600' : 'text-red-500'
                                            }`}>
                                                {p.status === 'refunded' ? '+ ' : ''}CHF {fmt(p.amount)}
                                            </p>
                                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                p.status === 'refunded'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-red-50 text-red-500 border-red-100'
                                            }`}>
                                                {p.status === 'refunded' ? t('Refunded') : t('Disputed')}
                                            </span>
                                            <Link href={route('missions.show', p.mission_id)}
                                                className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#FF7F00] hover:text-white transition-all">
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ★ TIER 3 #13 — Repeat Providers (Loyalty) */}
                {repeatProviders?.length > 0 && (
                    <motion.div variants={cardVariants} className="space-y-4">
                        <div className="flex items-center gap-2.5 px-1">
                            <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                                <Award size={14} strokeWidth={2.5} />
                            </span>
                            <h2 className="text-lg font-black text-[#0F172A]">{t('Loyal Providers')}</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {repeatProviders.map((provider) => (
                                <div key={provider.provider_id}
                                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 hover:border-amber-200 hover:shadow-md transition-all">
                                    <div className="relative">
                                        {provider.provider_avatar ? (
                                            <img src={provider.provider_avatar} alt={provider.provider_name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-white" />
                                        ) : (
                                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 font-black text-xs ring-2 ring-white">
                                                {provider.provider_name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-white">
                                            <Trophy size={8} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-[#0F172A] text-sm truncate">{provider.provider_name}</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {provider.mission_count} {t('Missions Finished')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-amber-600">CHF {fmt(provider.total_paid, 0)}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('Total Paid')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── QUICK ACTIONS ────────────────────────────────── */}
                <motion.div variants={cardVariants} className="grid sm:grid-cols-2 gap-4">
                    {[
                        { href: route('providers.index'), icon: ArrowUpRight, label: t('Find a Provider'), sub: t('Browse top-rated helpers near you'), hoverBg: 'group-hover:bg-[#FF7F00] group-hover:text-white', bg: 'bg-orange-50', tc: 'text-[#FF7F00]' },
                        { href: route('missions.create'), icon: PlusCircle, label: t('Start New Mission'), sub: t('Post a task and get it done fast'), hoverBg: 'group-hover:bg-[#0F172A] group-hover:text-white', bg: 'bg-slate-50', tc: 'text-slate-400' },
                    ].map(({ href, icon: Icon, label, sub, hoverBg, bg, tc }) => (
                        <Link key={href} href={href}
                            className="group bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4 hover:border-slate-200 hover:shadow-md transition-all">
                            <div className={`w-11 h-11 ${bg} rounded-lg flex items-center justify-center ${tc} ${hoverBg} transition-all shrink-0`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-[#0F172A] text-sm mb-0.5">{label}</p>
                                <p className="text-xs text-slate-400 font-medium">{sub}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                        </Link>
                    ))}
                </motion.div>

            </motion.div>
        </AuthenticatedLayout>
    );
}
