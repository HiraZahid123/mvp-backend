import React from 'react';
import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';

export default function ProviderHoverCard({ provider, t }) {
    return (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-[24px] p-6 shadow-2xl border-2 border-oflem-terracotta z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-border">
                <img
                    src={provider.profile_photo_url || provider.avatar || '/images/avatars/default-avatar.svg'}
                    alt={provider.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-oflem-terracotta shadow-lg"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-oflem-charcoal mb-1">{provider.name}</h3>
                    <p className="text-xs text-gray-muted font-medium">@{provider.username || 'user'}</p>
                    <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-sm ${
                                    i < Math.round(parseFloat(provider.rating_cache || 0))
                                        ? 'text-oflem-terracotta'
                                        : 'text-gray-300'
                                }`}
                            >
                                <Star size={14} className={`${
                                    i < Math.round(parseFloat(provider.rating_cache || 0))
                                        ? 'text-oflem-terracotta fill-oflem-terracotta'
                                        : 'text-gray-300'
                                }`} />
                            </span>
                        ))}
                        <span className="text-xs font-bold text-gray-muted ml-1">
                            ({provider.reviews_count_cache || 0})
                        </span>
                    </div>
                </div>
            </div>

            {/* Skills */}
            {provider.matched_skills && provider.matched_skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-muted uppercase tracking-wider mb-2">
                        {t('Matched Skills')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {provider.matched_skills.slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/10 text-oflem-terracotta text-xs font-bold rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {provider.provider_profile?.years_experience && (
                    <div className="bg-oflem-cream rounded-[16px] p-3 text-center">
                        <p className="text-2xl font-black text-oflem-charcoal">
                            {provider.provider_profile.years_experience}
                        </p>
                        <p className="text-[9px] font-black text-gray-muted uppercase tracking-wider">
                            {t('Years Exp')}
                        </p>
                    </div>
                )}
                {provider.distance_km && (
                    <div className="bg-oflem-cream rounded-[16px] p-3 text-center">
                        <p className="text-2xl font-black text-oflem-charcoal">{provider.distance_km}</p>
                        <p className="text-[9px] font-black text-gray-muted uppercase tracking-wider">
                            {t('km away')}
                        </p>
                    </div>
                )}
            </div>

            {/* Bio */}
            {provider.provider_profile?.bio && (
                <div className="mb-4">
                    <p className="text-xs text-gray-muted font-medium line-clamp-3">
                        {provider.provider_profile.bio}
                    </p>
                </div>
            )}
        </div>
    );
}
