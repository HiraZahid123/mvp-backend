import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import ProviderHoverCard from './ProviderHoverCard';
import { Map, Search, Star, Send } from 'lucide-react';

export default function NearbyProvidersSection({ mission, t }) {
    const [nearbyProviders, setNearbyProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState(null);
    const [hoveredProvider, setHoveredProvider] = useState(null);

    useEffect(() => {
        // Fetch nearby Providers
        axios.get(route('missions.nearby-providers', mission.id))
            .then(response => {
                setNearbyProviders(response.data.nearby_providers);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching nearby Providers:', error);
                setLoading(false);
            });
    }, [mission.id]);

    const sendMission = (providerId) => {
        setSendingTo(providerId);
        router.post(route('missions.send-to-provider', { mission: mission.id, provider: providerId }), {}, {
            onFinish: () => setSendingTo(null),
        });
    };

    if (loading) {
        return (
            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border">
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-oflem-terracotta border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-sm font-bold text-gray-muted">{t('Finding nearby helpers...')}</p>
                </div>
            </section>
        );
    }

    if (nearbyProviders.length === 0) {
        return (
            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border">
                <h2 className="text-2xl font-black text-oflem-charcoal mb-6 flex items-center gap-3">
                    <Map size={24} className="text-oflem-terracotta" /> {t('Nearby Helpers')}
                </h2>
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-zinc-300">
                        <Search size={40} />
                    </div>
                    <p className="text-gray-muted font-bold">{t('No helpers found nearby')}</p>
                    <p className="text-xs text-gray-muted mt-2">{t('Try expanding your search radius or wait for offers')}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-oflem-charcoal mb-2 flex items-center gap-3">
                    <Map size={24} className="text-oflem-terracotta" /> {t('Nearby Helpers')}
                </h2>
                <p className="text-sm text-gray-muted font-medium">
                    {t('Found')} {nearbyProviders.length} {t('helpers near your mission location')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyProviders.map((provider) => (
                    <div
                        key={provider.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredProvider(provider)}
                        onMouseLeave={() => setHoveredProvider(null)}
                    >
                        <div className="bg-oflem-cream rounded-[24px] p-5 border-2 border-transparent hover:border-oflem-terracotta transition-all duration-300">
                            {/* Avatar and Name */}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={provider.profile_photo_url || provider.avatar || '/images/avatars/default-avatar.svg'}
                                    alt={provider.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-oflem-charcoal truncate">{provider.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <Star size={14} fill="currentColor" className="text-oflem-terracotta" />
                                        <span className="text-xs font-bold text-gray-muted">
                                            {parseFloat(provider.rating_cache || 0).toFixed(1)}
                                        </span>
                                        {provider.distance_km && (
                                            <>
                                                <span className="text-gray-300 mx-1">•</span>
                                                <span className="text-xs font-bold text-gray-muted">
                                                    {provider.distance_km} km
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Match Score */}
                            {provider.match_score > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black text-gray-muted uppercase tracking-wider">
                                            {t('Match Score')}
                                        </span>
                                        <span className="text-xs font-black text-oflem-charcoal">
                                            {provider.match_score}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-oflem-terracotta to-[#D4AF37] rounded-full"
                                            style={{ width: `${Math.min(provider.match_score, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Send Mission Button */}
                            <button
                                onClick={() => sendMission(provider.id)}
                                disabled={sendingTo === provider.id}
                                className="w-full py-3 bg-oflem-charcoal text-white font-black rounded-full hover:bg-black transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingTo === provider.id ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        {t('Sending...')}
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> {t('Send to Provider')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hover ID Card */}
                        {hoveredProvider?.id === provider.id && (
                            <ProviderHoverCard provider={provider} t={t} />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
