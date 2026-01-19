import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import TypewriterEffect from '@/Components/TypewriterEffect';
import axios from 'axios';

export default function Welcome() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isClean, setIsClean] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const typewriterStrings = [
        t('Cleaning my apartment'),
        t('Walking my dog'),
        t('Assembling IKEA furniture'),
        t('Picking up groceries'),
        t('Helping with a move'),
    ];

    const handleSearchInput = (val) => {
        setSearchTerm(val);
        setIsClean(true); 
        setHasChecked(false);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm || isChecking) return;

        setIsChecking(true);
        setHasChecked(false);
        try {
            const response = await axios.post(route('moderation.check'), { content: searchTerm });
            const clean = response.data.is_clean;
            setIsClean(clean);
            setHasChecked(true);

            if (clean) {
                router.get(route('missions.create'), { 
                    title: searchTerm,
                    improved_title: response.data.improved_title 
                });
            }
        } catch (error) {
            console.error("Moderation check failed", error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <Head title={t('Welcome')} />
            
            <Header />

            {/* Hero Section */}
            <section className="py-20 px-6 max-w-7xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-black text-primary-black tracking-tight leading-tight mb-6">
                    {t('Save time.')} <span className="text-gold-accent">{t('Or make money.')}</span>
                </h1>
                <p className="text-xl font-bold text-gray-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                    {t('Oflem: the Swiss help platform for lazy ones and motivated ones.')}
                </p>

                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        <div className={`transition-all duration-300 rounded-[32px] p-0.5 ${
                            !searchTerm ? 'bg-transparent' : 
                            isChecking ? 'bg-gray-200 animate-pulse' :
                            hasChecked && !isClean ? 'bg-red-100' : 
                            hasChecked && isClean ? 'bg-green-100 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-transparent'
                        }`}>
                            <TypewriterEffect 
                                strings={typewriterStrings} 
                                onUserInput={handleSearchInput} 
                                className={`${
                                    !searchTerm ? 'border-gray-border' : 
                                    hasChecked && isClean ? 'border-green-500 shadow-sm' : 
                                    hasChecked && !isClean ? 'border-red-500' : 'border-gray-border'
                                }`}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!searchTerm.trim() || isChecking}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 rounded-full font-black transition-all duration-300 shadow-md active:scale-95 ${
                                searchTerm.trim() && !isChecking
                                    ? 'bg-gold-accent text-primary-black hover:opacity-90 opacity-100 translate-x-0'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-0 translate-x-4 pointer-events-none'
                            }`}
                        >
                            {isChecking ? t('Checking...') : `🚀 ${t('Start the search')}`}
                        </button>
                    </form>
                    {hasChecked && !isClean && (
                        <p className="text-red-500 text-sm font-bold mt-4 flex items-center justify-center gap-2 animate-bounce">
                            <span>🚫</span> {t('Content violates moderation rules. Please revise.')}
                        </p>
                    )}
                    <div className="flex justify-center gap-4 mt-8">
                        <Link 
                            href={route('missions.create')} 
                            className="text-sm font-black text-primary-black hover:text-gold-accent transition-all flex items-center gap-2 group"
                        >
                            {t("I'm Motivated")} 
                            <span className="group-hover:translate-x-1 transition-transform">➔</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Talent Showcase Grid */}
            <section className="bg-off-white-bg py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-black text-primary-black mb-12 text-center underline decoration-gold-accent decoration-4 underline-offset-8">
                        {t('What can we do for you?')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TalentCard 
                            title={t('Cleaning & Home')} 
                            text={t("Deep cleaning, organizing, or just tidying up. Professional results for your peace of mind.")}
                            icon="✨"
                        />
                        <TalentCard 
                            title={t('Delivery & Shopping')} 
                            text={t("Groceries delivered to your door, or that parcel you forgot to pick up.")}
                            icon="📦"
                        />
                        <TalentCard 
                            title={t('DIY & Furniture')} 
                            text={t("Assembling furniture, drilling holes, or fixing that leaky tap.")}
                            icon="🛠️"
                        />
                        <TalentCard 
                            title={t('Garden & Outdoor')} 
                            text={t("Lawn mowing, hedge trimming, or balcony beautification.")}
                            icon="🌿"
                        />
                        <TalentCard 
                            title={t('Tech & Admin')} 
                            text={t("Setting up your printer, organizing digital files, or simple admin tasks.")}
                            icon="💻"
                        />
                        <TalentCard 
                            title={t('Troubleshooting & Special Missions')} 
                            text={t("From delivering an urgent document to retrieving a forgotten item, or simply carrying bags. Everyday missions handled with complete trust.")}
                            icon="🪄"
                            highlight
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 border-b border-gray-border">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white p-8 rounded-3xl border border-gray-border shadow-sm">
                            <p className="text-lg font-medium italic text-primary-black mb-6">
                                "Oflem saved my weekend. I didn't want to move, and someone came to fix my sink in 2 hours."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cream-accent rounded-full"></div>
                                <div>
                                    <h4 className="font-black text-sm">Marc, Slacker</h4>
                                    <p className="text-xs text-gray-muted">Geneva</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-primary-black p-8 rounded-3xl text-white shadow-xl">
                            <p className="text-lg font-medium italic mb-6">
                                "I make an extra 500 CHF per month just by helping my neighbors. It's flexible and rewarding."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gold-accent rounded-full"></div>
                                <div>
                                    <h4 className="font-black text-sm text-gold-accent">Sarah, Motivated</h4>
                                    <p className="text-xs text-gray-muted/70">Zurich</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment / Trust Section */}
            <section className="py-24 px-6 bg-cream-accent/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <TrustBox 
                            title={t('Secure Payment')}
                            text={t('Mission paid after completion, funds held in escrow.')}
                        />
                        <TrustBox 
                            title={t('Total Trust')}
                            text={t('Verified profiles and community ratings.')}
                        />
                        <TrustBox 
                            title={t('100% Rewards')}
                            text={t('Motives receive the full price agreed upon.')}
                        />
                        <TrustBox 
                            title={t('Swiss Quality')}
                            text={t('A platform built by help-seekers for help-seekers.')}
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function TalentCard({ title, text, icon, highlight }) {
    return (
        <div className={`p-8 rounded-[32px] border-2 transition-all group ${
            highlight ? 'bg-primary-black border-primary-black text-white shadow-xl' : 'bg-white border-gray-border hover:border-gold-accent'
        }`}>
            <div className={`text-4xl mb-6 flex w-16 h-16 items-center justify-center rounded-2xl ${
                highlight ? 'bg-gold-accent' : 'bg-off-white-bg group-hover:bg-cream-accent'
            }`}>
                {icon}
            </div>
            <h3 className="text-xl font-black mb-4">{title}</h3>
            <p className={`text-sm font-bold leading-relaxed ${highlight ? 'text-gray-muted/80' : 'text-gray-muted'}`}>
                {text}
            </p>
        </div>
    );
}

function TrustBox({ title, text }) {
    return (
        <div className="text-center">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary-black mb-3">{title}</h4>
            <p className="text-xs font-bold text-gray-muted leading-relaxed uppercase">{text}</p>
        </div>
    );
}

