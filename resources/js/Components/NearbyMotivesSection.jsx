import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import MotiveHoverCard from './MotiveHoverCard';

export default function NearbyMotivesSection({ mission, t }) {
    const [nearbyMotives, setNearbyMotives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState(null);
    const [hoveredMotive, setHoveredMotive] = useState(null);

    useEffect(() => {
        // Fetch nearby Motivés
        axios.get(route('missions.nearby-motives', mission.id))
            .then(response => {
                setNearbyMotives(response.data.nearby_motives);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching nearby Motivés:', error);
                setLoading(false);
            });
    }, [mission.id]);

    const sendMission = (motiveId) => {
        setSendingTo(motiveId);
        router.post(route('missions.send-to-motive', { mission: mission.id, motive: motiveId }), {}, {
            onFinish: () => setSendingTo(null),
        });
    };

    if (loading) {
        return (
            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border">
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-sm font-bold text-gray-muted">{t('Finding nearby helpers...')}</p>
                </div>
            </section>
        );
    }

    if (nearbyMotives.length === 0) {
        return (
            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border">
                <h2 className="text-2xl font-black text-primary-black mb-6">🗺️ {t('Nearby Helpers')}</h2>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-muted font-bold">{t('No helpers found nearby')}</p>
                    <p className="text-xs text-gray-muted mt-2">{t('Try expanding your search radius or wait for offers')}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-primary-black mb-2">🗺️ {t('Nearby Helpers')}</h2>
                <p className="text-sm text-gray-muted font-medium">
                    {t('Found')} {nearbyMotives.length} {t('helpers near your mission location')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyMotives.map((motive) => (
                    <div
                        key={motive.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredMotive(motive)}
                        onMouseLeave={() => setHoveredMotive(null)}
                    >
                        <div className="bg-oflem-cream rounded-[24px] p-5 border-2 border-transparent hover:border-gold-accent transition-all duration-300">
                            {/* Avatar and Name */}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={motive.profile_photo_url || motive.avatar || '/images/avatars/default-avatar.svg'}
                                    alt={motive.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-primary-black truncate">{motive.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gold-accent text-sm">★</span>
                                        <span className="text-xs font-bold text-gray-muted">
                                            {parseFloat(motive.rating_cache || 0).toFixed(1)}
                                        </span>
                                        {motive.distance_km && (
                                            <>
                                                <span className="text-gray-300 mx-1">•</span>
                                                <span className="text-xs font-bold text-gray-muted">
                                                    {motive.distance_km} km
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Match Score */}
                            {motive.match_score > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black text-gray-muted uppercase tracking-wider">
                                            {t('Match Score')}
                                        </span>
                                        <span className="text-xs font-black text-primary-black">
                                            {motive.match_score}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-gold-accent to-[#D4AF37] rounded-full"
                                            style={{ width: `${Math.min(motive.match_score, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Send Mission Button */}
                            <button
                                onClick={() => sendMission(motive.id)}
                                disabled={sendingTo === motive.id}
                                className="w-full py-3 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingTo === motive.id ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        {t('Sending...')}
                                    </>
                                ) : (
                                    <>
                                        📤 {t('Send Mission')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hover ID Card */}
                        {hoveredMotive?.id === motive.id && (
                            <MotiveHoverCard motive={motive} t={t} />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
