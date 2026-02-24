import React from 'react';
import { Head } from '@inertiajs/react';
import { Star, MapPin, Award, CheckCircle, Briefcase, UserCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import ReviewCard from '@/Components/ReviewCard';
import RatingDistribution from '@/Components/RatingDistribution';

export default function PublicProfile({ user, reviews, ratingDistribution }) {
    const { t } = useTranslation();
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-6 h-6 ${
                    index < Math.floor(rating)
                        ? 'fill-oflem-terracotta text-oflem-terracotta'
                        : index < rating
                        ? 'fill-oflem-terracotta/50 text-oflem-terracotta'
                        : 'text-gray-border'
                }`}
            />
        ));
    };

    return (
        <AuthenticatedLayout 
            header={`${user.name}`}
            maxWidth="max-w-6xl"
            showFooter={true}
        >
            <Head title={`${user.name} - Profile`} />

            <div className="py-16">
                {/* Profile Header */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border mb-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full bg-oflem-cream flex items-center justify-center font-black text-oflem-charcoal text-5xl border-4 border-oflem-terracotta shadow-xl">
                            {user.name.charAt(0)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                                        {user.name}
                                    </h1>
                                    {user.location_address && (
                                        <div className="flex items-center gap-2 text-gray-muted">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm font-medium">{user.location_address}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {user.email_verified_at && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-black text-green-600 uppercase tracking-widest">
                                            Verified
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Role Badge */}
                            <div className="flex gap-2 mb-6">
                                {(user.role_type === 'client' || user.role_type === 'both') && (
                                    <span className="px-4 py-2 bg-oflem-cream rounded-full text-xs font-black uppercase tracking-widest text-oflem-charcoal flex items-center gap-2 border border-gray-border/10">
                                        <UserCircle size={14} className="text-oflem-charcoal/60" /> {t('Client')}
                                    </span>
                                )}
                                {(user.role_type === 'provider' || user.role_type === 'both') && (
                                    <span className="px-4 py-2 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/10 rounded-full text-xs font-black uppercase tracking-widest text-oflem-terracotta flex items-center gap-2 border border-oflem-terracotta/10">
                                        <Briefcase size={14} /> {t('Provider')}
                                    </span>
                                )}
                            </div>

                            {/* Rating Summary */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    {renderStars(user.average_rating)}
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-oflem-charcoal">
                                        {user.average_rating.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-muted font-bold uppercase tracking-widest">
                                        {user.total_reviews} {user.total_reviews === 1 ? t('Review') : t('Reviews')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About & Bio Section */}
                {(user.provider_profile || (user.skills && user.skills.length > 0)) && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border mb-8">
                        <div className="grid md:grid-cols-3 gap-12">
                            {/* Bio */}
                            {user.provider_profile?.bio && (
                                <div className="md:col-span-2">
                                    <h2 className="text-xl font-black text-oflem-charcoal mb-4 uppercase tracking-tight">
                                        {t("About Me")}
                                    </h2>
                                    <p className="text-gray-muted font-medium leading-relaxed">
                                        {user.provider_profile.bio}
                                    </p>
                                </div>
                            )}

                            {/* Skills Tag Cloud */}
                            {user.skills && user.skills.length > 0 && (
                                <div className="md:col-span-1">
                                    <h2 className="text-xl font-black text-oflem-charcoal mb-4 uppercase tracking-tight">
                                        {t("Expertise")}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills.map((skill, index) => (
                                            <div key={index} className="px-4 py-2 bg-oflem-cream border border-gray-border rounded-full flex items-center gap-2 group hover:border-oflem-terracotta transition-colors">
                                                <span className="text-xs font-black text-oflem-charcoal uppercase tracking-wider">{skill.name}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    skill.pivot?.proficiency_level === 'expert' ? 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-oflem-charcoal' : 
                                                    'bg-gray-200 text-gray-500'
                                                }`}>
                                                    {skill.pivot?.proficiency_level}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Rating Distribution */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-border sticky top-24">
                            <h2 className="text-xl font-black text-oflem-charcoal mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-oflem-terracotta" />
                                {t("Rating Breakdown")}
                            </h2>
                            <RatingDistribution 
                                distribution={ratingDistribution} 
                                totalReviews={user.total_reviews}
                            />
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-black text-oflem-charcoal mb-6">
                            {t("Reviews")} ({reviews.length})
                        </h2>
                        
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[32px] p-12 text-center border border-gray-border">
                                <div className="w-16 h-16 bg-off-white-bg rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8 text-gray-border" />
                                </div>
                                <p className="text-lg font-black text-gray-muted mb-2">
                                    {t("No reviews yet")}
                                </p>
                                <p className="text-sm text-gray-muted font-medium">
                                    {t("This user hasn't received any reviews yet.")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
