import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import lodash from 'lodash';

export default function Index({ providers, filters: initialFilters }) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState(initialFilters || {});
    const [isInitialMount, setIsInitialMount] = useState(true);

    const debouncedSearch = useCallback(
        lodash.debounce((newFilters) => {
            router.get(route('providers.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300),
        []
    );

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }
        debouncedSearch(filters);
    }, [filters]);

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-oflem-cream font-sans">
            <Head title={t('Find Helpers')} />
            <Header />

            <main className="max-w-7xl mx-auto py-16 px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-primary-black mb-3">{t('Find Expert Help')}</h1>
                    <p className="text-gray-muted font-bold text-lg">
                        {t('Browse our community of talented local helpers and find the perfect match for your next mission.')}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-gray-muted">🔍</span>
                        <input
                            type="text"
                            placeholder={t('Search by name or skill...')}
                            value={filters.search || ''}
                            onChange={handleSearchChange}
                            className="w-full pl-14 pr-8 py-4 bg-white border-2 border-gray-border rounded-[24px] font-bold text-primary-black outline-none focus:border-gold-accent transition-all shadow-sm"
                        />
                    </div>
                </div>

                {providers.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {providers.data.map((provider) => (
                            <ProviderCard key={provider.id} provider={provider} t={t} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-border">
                        <div className="text-6xl mb-6">🔍</div>
                        <h2 className="text-2xl font-black text-primary-black mb-4">{t('No helpers found')}</h2>
                        <p className="text-gray-muted font-bold max-w-md mx-auto mb-10">
                            {t("We couldn't find any helpers matching your search. Try different keywords or browse all.")}
                        </p>
                        <button 
                            onClick={() => setFilters({})}
                            className="inline-block px-10 py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-md"
                        >
                            🔄 {t('Reset Search')}
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {providers.links.length > 3 && (
                    <div className="mt-16 flex justify-center gap-2">
                        {providers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                data={filters}
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

function ProviderCard({ provider, t }) {
    return (
        <div className="bg-white rounded-[32px] p-8 border border-gray-border shadow-sm hover:border-gold-accent transition-all group flex flex-col h-full">
            <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-cream-accent flex items-center justify-center text-primary-black font-black text-2xl overflow-hidden border border-gray-border">
                    {provider.profile_photo_url ? (
                        <img src={provider.profile_photo_url} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                        provider.name.charAt(0)
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-black text-primary-black flex items-center gap-2">
                        {provider.name}
                        {provider.verified && (
                            <span className="text-blue-500" title={t('Verified')}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gold-accent font-black">★ {provider.average_rating || 0}</span>
                        <span className="text-gray-muted text-xs font-black uppercase tracking-widest">({provider.total_reviews} {t('reviews')})</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 mb-8">
                {provider.hourly_rate && (
                    <div className="flex justify-between items-center px-4 py-3 bg-oflem-cream rounded-2xl border border-gray-border/50">
                        <span className="text-xs font-black text-gray-muted uppercase tracking-widest">{t('Hourly Rate')}</span>
                        <span className="text-base font-black text-primary-black">{provider.hourly_rate} CHF</span>
                    </div>
                )}
                
                {provider.location && (
                    <div className="flex items-center gap-2 text-gray-muted">
                        <span className="text-lg">📍</span>
                        <span className="text-sm font-bold">{provider.location}</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {provider.skills && provider.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-white border border-gray-border rounded-full text-[10px] font-black text-gray-muted uppercase tracking-widest group-hover:border-gold-accent/30 transition-colors">
                            {skill}
                        </span>
                    ))}
                    {(!provider.skills || provider.skills.length === 0) && (
                        <span className="px-3 py-1 bg-gray-50 border border-gray-border rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                            {t('No skills listed')}
                        </span>
                    )}
                </div>
            </div>

            <Link 
                href={route('profile.show', provider.id)}
                className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all shadow-md group-hover:scale-[1.02] active:scale-[0.98] text-center"
            >
                {t('View Profile')}
            </Link>
        </div>
    );
}
