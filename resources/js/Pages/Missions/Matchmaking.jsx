import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import { Search, Check, Star } from 'lucide-react';

export default function Matchmaking({ mission, providers, isGuest = false }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout 
            header={t('Match Providers')}
            maxWidth="max-w-7xl"
            showFooter={true}
        >
            <Head title={t('Match Providers')} />

            <div className="py-16">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-oflem-charcoal mb-3">
                        {t('Help found for')}: <span className="text-oflem-terracotta">{mission.title}</span>
                    </h1>
                    <p className="text-gray-muted font-bold">
                        {isGuest 
                            ? t('Sign up to contact these local experts and secure your mission.')
                            : t('Choose a provider to start negotiating and finalize your mission.')
                        }
                    </p>
                </div>

                {isGuest && (
                    <div className="mb-12 p-8 bg-cream-accent rounded-[32px] border border-oflem-terracotta flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-oflem-charcoal mb-2">{t('Almost there!')}</h3>
                            <p className="text-gray-muted font-bold">{t('Register now to post your mission and start chatting with these providers.')}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Link 
                                href={route('login')} 
                                className="px-8 py-4 bg-white border-2 border-oflem-charcoal text-oflem-charcoal font-black rounded-full hover:bg-oflem-cream transition-all whitespace-nowrap"
                            >
                                {t('Log in')}
                            </Link>
                            <Link 
                                href={route('register.manual')} 
                                className="px-8 py-4 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all whitespace-nowrap"
                            >
                                {t('Create Free Account')}
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {providers.map((provider) => (
                        <ProviderCard key={provider.id} provider={provider} missionId={mission.id} t={t} isGuest={isGuest} />
                    ))}
                </div>

                {providers.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-gray-border">
                        <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-black text-oflem-charcoal mb-2">{t('No providers found yet')}</h3>
                        <p className="text-gray-muted font-bold">{t('Try adjusting your mission details or location.')}</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function ProviderCard({ provider, missionId, t, isGuest }) {
    const { post, processing } = useForm();

    const handleContact = () => {
        if (isGuest) {
            // Redirect to login with intended redirect back to the pending mission handler
            window.location.href = route('login', { redirect: route('missions.pending') });
            return;
        }
        post(route('missions.contact', { mission: missionId, provider: provider.id }));
    };

    return (
        <div className="bg-white rounded-[32px] p-6 border border-gray-border shadow-sm hover:border-oflem-terracotta transition-all group flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-cream-accent flex items-center justify-center text-oflem-charcoal font-black text-xl overflow-hidden">
                    {provider.avatar ? (
                        <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                        provider.name.charAt(0)
                    )}
                </div>
                <div>
                    <h3 className="font-black text-oflem-charcoal flex items-center gap-2">
                        {provider.name}
                        {provider.verified && (
                            <span className="text-blue-500" title={t('Verified')}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-oflem-terracotta text-sm font-black flex items-center gap-1"><Star size={14} className="fill-oflem-terracotta" /> {provider.rating}</span>
                        <span className="text-gray-muted text-[10px] font-black uppercase tracking-widest">({provider.reviews_count} {t('reviews')})</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                <div className="flex justify-between items-center px-4 py-2 bg-oflem-cream rounded-xl">
                    <span className="text-xs font-black text-gray-muted uppercase tracking-widest">{t('Starting from')}</span>
                    <span className="text-sm font-black text-oflem-charcoal">{provider.price} CHF</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-cream-accent rounded-full text-[10px] font-black text-oflem-charcoal uppercase tracking-widest">{t('Available')}</span>
                    <span className="px-3 py-1 bg-white border border-gray-border rounded-full text-[10px] font-black text-gray-muted uppercase tracking-widest">{t('Local Expert')}</span>
                    
                    {/* Matched Skills Badges */}
                    {provider.matched_skills && provider.matched_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1">
                            <Check size={10} /> {skill}
                        </span>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleContact}
                disabled={processing}
                className="w-full py-4 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all shadow-md group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                {t('Contact Provider')}
            </button>
        </div>
    );
}
