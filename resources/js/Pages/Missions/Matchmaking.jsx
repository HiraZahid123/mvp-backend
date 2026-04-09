import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useTranslation from '@/Hooks/useTranslation';
import { Search, Check, Star } from 'lucide-react';

export default function Matchmaking({ mission, providers, isGuest = false }) {
    const { t } = useTranslation();

    const renderProviders = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} missionId={mission.id} t={t} isGuest={isGuest} />
            ))}
        </div>
    );

    const emptyState = (
        <div className="text-center py-20 bg-white rounded-[40px] border border-gray-border">
            <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-oflem-charcoal mb-2">{t('onboarding.no_providers_found')}</h3>
            <p className="text-gray-muted font-bold">{t('onboarding.adjust_details_hint')}</p>
        </div>
    );

    if (isGuest) {
        return (
            <div className="oflem-home-page" style={{ background: 'var(--g50)', minHeight: '100vh' }}>
                <Head title={t('onboarding.match_providers_title')} />
                <header className="oflem-header" style={{ background: '#fff' }}>
                    <div className="oflem-container">
                        <nav className="oflem-nav">
                            <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                            <Link href={route('welcome')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                        </nav>
                    </div>
                </header>

                <main className="oflem-container py-12 animate-in fade-in duration-700">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black text-oflem-charcoal mb-4">
                                {t('onboarding.excellent_news')} <span className="text-oflem-terracotta">{providers.length} {t('onboarding.providers_count')}</span> {t('onboarding.around_you')}
                            </h1>
                            <p className="text-gray-muted font-bold text-lg">
                                {t('onboarding.signup_to_contact_hint')}
                            </p>
                        </div>

                        <div className="mb-10 p-8 bg-white border border-gray-border rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="oflem-final-cta-orb-1" style={{ opacity: 0.05, top: '-50px', left: '-50px' }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h3 className="text-2xl font-black text-oflem-charcoal mb-2">{t('onboarding.last_step')}</h3>
                                <p className="text-gray-muted font-bold">{t('onboarding.finalize_request_hint')}</p>
                            </div>
                            <div className="flex gap-4 items-center relative z-1">
                                <Link 
                                    href={route('register.client')} 
                                    className="px-10 py-5 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all shadow-xl text-lg flex items-center gap-3"
                                >
                                    {t('onboarding.continue_to_account')} →
                                </Link>
                            </div>
                        </div>

                        {providers.length > 0 ? renderProviders() : emptyState}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <DashboardLayout header={t('Match Providers')}>
            <Head title={t('Match Providers')} />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-oflem-charcoal mb-3">
                        {t('onboarding.help_found_for')}: <span className="text-oflem-terracotta">{mission.title}</span>
                    </h1>
                    <p className="text-gray-muted font-bold">
                        {t('onboarding.choose_provider_hint')}
                    </p>
                </div>

                {providers.length > 0 ? renderProviders() : emptyState}
            </div>
        </DashboardLayout>
    );
}

function ProviderCard({ provider, missionId, t, isGuest }) {
    const { post, processing } = useForm();

    const handleContact = () => {
        if (isGuest) {
            window.location.href = route('register.client');
            return;
        }
        post(route('missions.contact', { mission: missionId, provider: provider.id }));
    };

    return (
        <div className="bg-white rounded-[40px] p-8 border border-gray-border shadow-sm hover:border-oflem-terracotta transition-all group flex flex-col h-full relative overflow-hidden">
            <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-[24px] bg-cream-accent flex items-center justify-center text-oflem-charcoal font-black text-2xl overflow-hidden border border-gray-border/50 shadow-inner">
                    {provider.profile_photo ? (
                        <img src={provider.profile_photo} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                        provider.name.charAt(0)
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-black text-oflem-charcoal flex items-center gap-2">
                        {provider.name}
                        {provider.verified && (
                            <span className="text-blue-500" title={t('common.verified')}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-oflem-terracotta text-base font-black flex items-center gap-1"><Star size={16} className="fill-oflem-terracotta" /> {provider.rating}</span>
                        <span className="text-gray-muted text-xs font-black uppercase tracking-widest">({provider.reviews_count} {t('onboarding.reviews')})</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 mb-10">
                <div className="flex justify-between items-center px-6 py-3 bg-oflem-cream rounded-2xl border border-oflem-terracotta/5">
                    <span className="text-[11px] font-black text-gray-muted uppercase tracking-widest">{t('onboarding.starting_from')}</span>
                    <span className="text-lg font-black text-oflem-charcoal">{provider.price} CHF</span>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                    <span className="px-4 py-1.5 bg-green-50 border border-green-100 rounded-full text-[11px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Check size={12} /> {t('onboarding.verified_profile')}
                    </span>
                    
                    {provider.matched_skills && provider.matched_skills.map((skill, index) => (
                        <span key={index} className="px-4 py-1.5 bg-cream-accent border border-gray-border/50 rounded-full text-[11px] font-black text-oflem-charcoal uppercase tracking-widest">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleContact}
                disabled={processing}
                className="w-full py-5 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all shadow-xl group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-base"
            >
                {t('onboarding.contact_this_provider')}
            </button>
        </div>
    );
}
