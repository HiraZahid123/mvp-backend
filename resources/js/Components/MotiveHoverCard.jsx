import React from 'react';
import { Link } from '@inertiajs/react';

export default function MotiveHoverCard({ motive, t }) {
    return (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-[24px] p-6 shadow-2xl border-2 border-gold-accent z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-border">
                <img
                    src={motive.profile_photo_url || motive.avatar || '/images/avatars/default-avatar.svg'}
                    alt={motive.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-gold-accent shadow-lg"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-primary-black mb-1">{motive.name}</h3>
                    <p className="text-xs text-gray-muted font-medium">@{motive.username || 'user'}</p>
                    <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-sm ${
                                    i < Math.round(parseFloat(motive.rating_cache || 0))
                                        ? 'text-gold-accent'
                                        : 'text-gray-300'
                                }`}
                            >
                                ★
                            </span>
                        ))}
                        <span className="text-xs font-bold text-gray-muted ml-1">
                            ({motive.reviews_count_cache || 0})
                        </span>
                    </div>
                </div>
            </div>

            {/* Skills */}
            {motive.matched_skills && motive.matched_skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-muted uppercase tracking-wider mb-2">
                        {t('Matched Skills')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {motive.matched_skills.slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gold-accent/10 text-gold-accent text-xs font-bold rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {motive.provider_profile?.years_experience && (
                    <div className="bg-oflem-cream rounded-[16px] p-3 text-center">
                        <p className="text-2xl font-black text-primary-black">
                            {motive.provider_profile.years_experience}
                        </p>
                        <p className="text-[9px] font-black text-gray-muted uppercase tracking-wider">
                            {t('Years Exp')}
                        </p>
                    </div>
                )}
                {motive.distance_km && (
                    <div className="bg-oflem-cream rounded-[16px] p-3 text-center">
                        <p className="text-2xl font-black text-primary-black">{motive.distance_km}</p>
                        <p className="text-[9px] font-black text-gray-muted uppercase tracking-wider">
                            {t('km away')}
                        </p>
                    </div>
                )}
            </div>

            {/* Bio */}
            {motive.provider_profile?.bio && (
                <div className="mb-4">
                    <p className="text-xs text-gray-muted font-medium line-clamp-3">
                        {motive.provider_profile.bio}
                    </p>
                </div>
            )}
        </div>
    );
}
