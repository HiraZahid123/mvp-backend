import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import FilterSidebar from '@/Components/Missions/FilterSidebar';
import FilterChips from '@/Components/Missions/FilterChips';
import FilterDrawer from '@/Components/Missions/FilterDrawer';
import lodash from 'lodash';

export default function ActiveMissions({ missions, userLocation, currentFilters }) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState(currentFilters || {});
    const [isInitialMount, setIsInitialMount] = useState(true);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Debounced filter update to avoid too many requests while typing/sliding
    const debouncedSearch = useCallback(
        lodash.debounce((newFilters) => {
            router.get(route('missions.active'), newFilters, {
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

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <AuthenticatedLayout 
            header={t('Active Missions')}
            maxWidth="max-w-[1400px]"
            showFooter={true}
        >
            <Head title={t('Active Missions')} />

            <div className="py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <FilterSidebar 
                        filters={filters} 
                        onFilterChange={handleFilterChange} 
                    />

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <p className="text-gray-muted font-bold">
                                    {t('Showing missions within')} <span className="text-gold-accent">{filters.radius || 5}km</span> {t('of your location.')}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-gray-muted uppercase tracking-widest">{t('Sort')}:</span>
                                <select
                                    value={filters.sort_by || 'distance'}
                                    onChange={(e) => handleFilterChange({ ...filters, sort_by: e.target.value })}
                                    className="bg-white border-2 border-gray-border rounded-full px-6 py-2 font-bold text-sm outline-none focus:border-gold-accent transition-all"
                                >
                                    <option value="distance">{t('Closest')}</option>
                                    <option value="newest">{t('Newest')}</option>
                                    <option value="budget">{t('Budget')}</option>
                                    <option value="deadline">{t('Deadline')}</option>
                                </select>

                                <button
                                    onClick={() => setIsFilterDrawerOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-6 py-2 bg-white border-2 border-gray-border rounded-full font-bold text-sm hover:border-gold-accent transition-all shadow-sm"
                                >
                                    🔍 {t('Filters')}
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        <FilterChips filters={filters} onFilterChange={handleFilterChange} />
                        
                        {/* Mobile Filter Drawer */}
                        <FilterDrawer 
                            filters={filters} 
                            onFilterChange={handleFilterChange} 
                            isOpen={isFilterDrawerOpen} 
                            onClose={() => setIsFilterDrawerOpen(false)} 
                        />

                        {missions.data.length > 0 ? (
                            <div className="grid gap-6">
                                {missions.data.map((mission) => (
                                    <div key={mission.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-border hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
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
                                                        <span className="text-xs font-bold text-gray-muted bg-oflem-cream px-3 py-1 rounded-full">
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
                                                    {mission.price_type === 'fixed' ? t('View missions') : t('View & Quote')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-border">
                                <div className="text-6xl mb-6">🛰️</div>
                                <h2 className="text-2xl font-black text-primary-black mb-4">{t('No missions found')}</h2>
                                <p className="text-gray-muted font-bold max-w-md mx-auto mb-10">
                                    {t("We couldn't find any active missions matching your filters. Try clearing some filters or expanding your radius.")}
                                </p>
                                <button 
                                    onClick={() => handleFilterChange({ radius: 5, sort_by: 'distance' })}
                                    className="inline-block px-10 py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-md"
                                >
                                    🔄 {t('Reset Filters')}
                                </button>
                            </div>
                        )}

                        {/* Pagination (Simplified) */}
                        {missions.links.length > 3 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {missions.links.map((link, i) => (
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
