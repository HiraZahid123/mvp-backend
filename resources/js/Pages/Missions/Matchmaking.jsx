import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Matchmaking({ mission, helpers }) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-off-white-bg font-sans">
            <Head title={t('Match Helpers')} />
            <Header />

            <main className="max-w-7xl mx-auto py-16 px-6">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-primary-black mb-3">
                        {t('Help found for')}: <span className="text-gold-accent">{mission.title}</span>
                    </h1>
                    <p className="text-gray-muted font-bold">
                        {t('Choose a helper to start negotiating and finalize your mission.')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {helpers.map((helper) => (
                        <HelperCard key={helper.id} helper={helper} missionId={mission.id} t={t} />
                    ))}
                </div>

                {helpers.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-gray-border">
                        <div className="text-5xl mb-6">🔍</div>
                        <h3 className="text-xl font-black text-primary-black mb-2">{t('No helpers found yet')}</h3>
                        <p className="text-gray-muted font-bold">{t('Try adjusting your mission details or location.')}</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

function HelperCard({ helper, missionId, t }) {
    const { post, processing } = useForm();

    const handleContact = () => {
        post(route('missions.contact', { mission: missionId, helper: helper.id }));
    };

    return (
        <div className="bg-white rounded-[32px] p-6 border border-gray-border shadow-sm hover:border-gold-accent transition-all group flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-cream-accent flex items-center justify-center text-primary-black font-black text-xl overflow-hidden">
                    {helper.avatar ? (
                        <img src={helper.avatar} alt={helper.name} className="w-full h-full object-cover" />
                    ) : (
                        helper.name.charAt(0)
                    )}
                </div>
                <div>
                    <h3 className="font-black text-primary-black flex items-center gap-2">
                        {helper.name}
                        {helper.verified && (
                            <span className="text-blue-500" title={t('Verified')}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-gold-accent text-sm font-black">★ {helper.rating}</span>
                        <span className="text-gray-muted text-[10px] font-black uppercase tracking-widest">({helper.reviews_count} {t('reviews')})</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                <div className="flex justify-between items-center px-4 py-2 bg-off-white-bg rounded-xl">
                    <span className="text-xs font-black text-gray-muted uppercase tracking-widest">{t('Starting from')}</span>
                    <span className="text-sm font-black text-primary-black">{helper.price} CHF</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-cream-accent rounded-full text-[10px] font-black text-primary-black uppercase tracking-widest">{t('Available')}</span>
                    <span className="px-3 py-1 bg-white border border-gray-border rounded-full text-[10px] font-black text-gray-muted uppercase tracking-widest">{t('Local Expert')}</span>
                    
                    {/* Matched Skills Badges */}
                    {helper.matched_skills && helper.matched_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1">
                            ✓ {skill}
                        </span>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleContact}
                disabled={processing}
                className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all shadow-md group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                {t('Contact Helper')}
            </button>
        </div>
    );
}
