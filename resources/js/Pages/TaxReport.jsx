import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
    FileText, Download, ChevronLeft, TrendingUp, Calendar,
    ReceiptText, Banknote, Info, ChevronDown, ChevronUp,
} from 'lucide-react';

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function fmt(n, dec = 2) {
    return parseFloat(n || 0).toLocaleString(undefined, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
    });
}

const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function sortMonths(months) {
    return [...months].sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
}

export default function TaxReport({ taxData, providerName, year: currentYear }) {
    const { t } = useTranslation();
    const [selectedYear, setSelectedYear] = useState(taxData[0]?.year ?? currentYear);
    const [expandedYear, setExpandedYear] = useState(null);

    const yearData = taxData.find(y => y.year === selectedYear);
    const sortedMonths = yearData ? sortMonths(yearData.months) : [];

    const handlePrint = () => window.print();

    return (
        <AuthenticatedLayout header={t('Tax Report')} maxWidth="max-w-5xl" showFooter={true}>
            <Head title={t('Tax & Earnings Report')} />

            <motion.div initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
                className="py-6 px-2 sm:px-0 space-y-8">

                {/* ── HEADER ─────────────────────────────────────── */}
                <motion.div variants={cardVariants}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link href={route('wallet.index')}
                            className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-bold hover:text-[#FF7F00] transition-colors mb-3">
                            <ChevronLeft size={14} />
                            {t('Back to Wallet')}
                        </Link>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF7F00] mb-1">
                            {t('Provider Earnings')}
                        </p>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">{t('Annual Tax Report')}</h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">{providerName}</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Year selector */}
                        <div className="flex gap-2">
                            {taxData.map(y => (
                                <button key={y.year} onClick={() => setSelectedYear(y.year)}
                                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                                        selectedYear === y.year
                                            ? 'bg-[#0F172A] text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}>
                                    {y.year}
                                </button>
                            ))}
                        </div>
                        <button onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm print:hidden">
                            <Download size={15} />
                            {t('Print / Save PDF')}
                        </button>
                    </div>
                </motion.div>

                {taxData.length === 0 ? (
                    <motion.div variants={cardVariants}
                        className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} className="text-slate-300" />
                        </div>
                        <p className="font-black text-[#0F172A] text-lg">{t('No earnings data yet')}</p>
                        <p className="text-slate-400 text-sm font-medium mt-1">
                            {t('Complete missions to see your annual tax summary here.')}
                        </p>
                    </motion.div>
                ) : yearData ? (
                    <>
                        {/* ── YEAR SUMMARY CARDS ───────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: t('Gross Earnings'), value: `CHF ${fmt(yearData.total + yearData.commission)}`, accent: 'text-[#0F172A]', icon: Banknote },
                                { label: t('Net to You'), value: `CHF ${fmt(yearData.total)}`, accent: 'text-emerald-600', icon: TrendingUp },
                                { label: t('Platform Fees'), value: `CHF ${fmt(yearData.commission)}`, accent: 'text-orange-500', icon: ReceiptText },
                                { label: t('Missions'), value: yearData.count, accent: 'text-[#0F172A]', icon: Calendar },
                            ].map(({ label, value, accent, icon: Icon }) => (
                                <motion.div key={label} variants={cardVariants}
                                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center mb-3">
                                        <Icon size={16} className="text-slate-400" />
                                    </div>
                                    <p className={`text-xl font-black ${accent}`}>{value}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* ── SWISS TAX NOTE ────────────────────────── */}
                        <motion.div variants={cardVariants}
                            className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-black text-blue-700 text-sm mb-0.5">
                                    {t('Swiss Freelance Tax Guidance')}
                                </p>
                                <p className="text-blue-600 text-xs font-medium leading-relaxed">
                                    {t('In Switzerland, freelance income (Selbstständigkeit) must be declared in your cantonal tax return. Platform fees (CHF')} {fmt(yearData.commission)} {t(') paid to Oflem are deductible as business expenses. Consult a Treuhänder (fiduciary) for personalised advice.')}
                                </p>
                            </div>
                        </motion.div>

                        {/* ── MONTHLY BAR CHART ─────────────────────── */}
                        <motion.div variants={cardVariants}
                            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <h2 className="text-base font-black text-[#0F172A] mb-5">{t('Monthly Earnings Breakdown')} — {yearData.year}</h2>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={sortedMonths} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${v}`} />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-2xl text-sm">
                                                    <p className="font-black mb-1">{label} {yearData.year}</p>
                                                    <p className="text-emerald-400 font-bold">Net: CHF {fmt(payload[0]?.value)}</p>
                                                    {payload[1] && <p className="text-orange-400 font-bold">Fee: CHF {fmt(payload[1]?.value)}</p>}
                                                    <p className="text-white/50 text-xs mt-1">{payload[0]?.payload?.count ?? 0} missions</p>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar dataKey="total" name="Net" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="commission" name="Fee" fill="#FF7F00" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex gap-5 justify-center mt-3">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> {t('Net Earnings')}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <span className="w-3 h-3 rounded-sm bg-[#FF7F00] inline-block" /> {t('Platform Fee')}
                                </span>
                            </div>
                        </motion.div>

                        {/* ── MONTHLY TABLE ─────────────────────────── */}
                        <motion.div variants={cardVariants}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50">
                                <h2 className="text-base font-black text-[#0F172A]">{t('Month-by-Month Detail')}</h2>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {/* Header */}
                                <div className="grid grid-cols-4 px-6 py-3 bg-slate-50">
                                    {[t('Month'), t('Missions'), t('Platform Fee'), t('Net Earnings')].map(h => (
                                        <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</span>
                                    ))}
                                </div>
                                {sortedMonths.map((m) => (
                                    <div key={m.month} className="grid grid-cols-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                        <span className="font-black text-[#0F172A] text-sm">{m.month} {yearData.year}</span>
                                        <span className="text-slate-500 font-medium text-sm">{m.count}</span>
                                        <span className="text-orange-500 font-bold text-sm">CHF {fmt(m.commission)}</span>
                                        <span className="text-emerald-600 font-black text-sm">CHF {fmt(m.total)}</span>
                                    </div>
                                ))}
                                {/* Total row */}
                                <div className="grid grid-cols-4 px-6 py-4 bg-slate-50 border-t border-slate-100">
                                    <span className="font-black text-[#0F172A] text-sm">{t('Total')} {yearData.year}</span>
                                    <span className="font-black text-[#0F172A] text-sm">{yearData.count}</span>
                                    <span className="text-orange-500 font-black text-sm">CHF {fmt(yearData.commission)}</span>
                                    <span className="text-emerald-600 font-black text-sm">CHF {fmt(yearData.total)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── ALL YEARS SUMMARY ─────────────────────── */}
                        {taxData.length > 1 && (
                            <motion.div variants={cardVariants}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedYear(expandedYear ? null : 'all')}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <h2 className="text-base font-black text-[#0F172A]">{t('All Years Overview')}</h2>
                                    {expandedYear ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </button>
                                {expandedYear && (
                                    <div className="divide-y divide-slate-50">
                                        <div className="grid grid-cols-4 px-6 py-3 bg-slate-50">
                                            {[t('Year'), t('Missions'), t('Platform Fee'), t('Net Earnings')].map(h => (
                                                <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</span>
                                            ))}
                                        </div>
                                        {taxData.map(y => (
                                            <div key={y.year} className="grid grid-cols-4 px-6 py-4">
                                                <button onClick={() => setSelectedYear(y.year)}
                                                    className="font-black text-[#FF7F00] text-sm hover:underline text-left">
                                                    {y.year}
                                                </button>
                                                <span className="text-slate-500 font-medium text-sm">{y.count}</span>
                                                <span className="text-orange-500 font-bold text-sm">CHF {fmt(y.commission)}</span>
                                                <span className="text-emerald-600 font-black text-sm">CHF {fmt(y.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </>
                ) : (
                    <motion.div variants={cardVariants} className="text-center py-16 text-slate-400">
                        {t('No data for selected year.')}
                    </motion.div>
                )}

            </motion.div>
        </AuthenticatedLayout>
    );
}
