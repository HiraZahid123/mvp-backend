import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function ActiveMissions({ missions, userLocation, radius }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-off-white-bg font-sans">
            <Head title={t('Active Missions')} />
            <Header />

            <main className="max-w-5xl mx-auto py-16 px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-primary-black mb-3">{t('Active Missions')}</h1>
                        <p className="text-gray-muted font-bold">
                            {t('Showing missions within')} <span className="text-gold-accent">{radius}km</span> {t('of your location.')}
                        </p>
                    </div>
                    
                    <Link 
                        href={route('missions.search')}
                        className="px-8 py-4 bg-white border-2 border-gray-border rounded-full font-black text-primary-black hover:bg-off-white-bg transition-all flex items-center gap-2 shadow-sm"
                    >
                        🔍 {t('Search Filtering')}
                    </Link>
                </div>

                {missions.data.length > 0 ? (
                    <div className="grid gap-6">
                        {missions.data.map((mission) => (
                            <div key={mission.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-border hover:shadow-md transition-shadow group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-4 py-1.5 bg-cream-accent text-primary-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {t(mission.category || 'General')}
                                            </span>
                                            {mission.price_type === 'fixed' ? (
                                                <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    ⚡ {t('Fixed Price')}
                                                </span>
                                            ) : (
                                                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    🏷️ {t('Open Offer')}
                                                </span>
                                            )}
                                            {mission.distance && (
                                                <span className="text-xs font-bold text-gray-muted bg-off-white-bg px-3 py-1 rounded-full">
                                                    📍 {Math.round(mission.distance)}km {t('away')}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h2 className="text-2xl font-black text-primary-black mb-3 group-hover:text-gold-accent transition-colors">
                                            {mission.title}
                                        </h2>
                                        
                                        <p className="text-gray-muted font-medium line-clamp-2 mb-6">
                                            {mission.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">💰</span>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-muted uppercase tracking-tighter">{t('Estimated Budget')}</p>
                                                    <p className="font-black text-primary-black">
                                                        {mission.budget ? `CHF ${mission.budget}` : t('To be discussed')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">📅</span>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-muted uppercase tracking-tighter">{t('Date & Time')}</p>
                                                    <p className="font-black text-primary-black">
                                                        {mission.date_time ? new Date(mission.date_time).toLocaleDateString() : t('Flexible')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">🏠</span>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-muted uppercase tracking-tighter">{t('Location')}</p>
                                                    <p className="font-black text-primary-black">
                                                        {mission.location || t('Approximate location')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center md:border-l border-gray-border md:pl-8">
                                        <Link
                                            href={route('missions.show', mission.id)}
                                            className="w-full md:w-auto px-10 py-5 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all shadow-xl whitespace-nowrap"
                                        >
                                            {mission.price_type === 'fixed' ? t('Accept Task') : t('View & Quote')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-border">
                        <div className="text-6xl mb-6">🛰️</div>
                        <h2 className="text-2xl font-black text-primary-black mb-4">{t('No missions found nearby')}</h2>
                        <p className="text-gray-muted font-bold max-w-md mx-auto mb-10">
                            {t("We couldn't find any active missions within your chosen radius. Try expanding your discovery radius in your profile settings.")}
                        </p>
                        <Link 
                            href={route('profile.edit')}
                            className="inline-block px-10 py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-md"
                        >
                            ⚙️ {t('Update Radius')}
                        </Link>
                    </div>
                )}

                {/* Pagination (Simplified) */}
                {missions.links.length > 3 && (
                    <div className="mt-12 flex justify-center gap-2">
                        {missions.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    link.active 
                                        ? 'bg-primary-black text-white' 
                                        : 'bg-white text-gray-muted hover:text-primary-black border border-gray-border'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                as="button"
                                disabled={!link.url}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
