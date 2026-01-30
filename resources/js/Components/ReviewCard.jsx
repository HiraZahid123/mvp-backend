import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < rating
                        ? 'fill-gold-accent text-gold-accent'
                        : 'text-gray-border'
                }`}
            />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-[24px] p-6 border border-gray-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-oflem-cream flex items-center justify-center font-black text-primary-black text-lg">
                        {review.reviewer?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <p className="font-black text-primary-black">
                            {review.reviewer?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-muted font-medium">
                            {formatDate(review.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {renderStars(review.rating)}
                </div>
            </div>

            {review.comment && (
                <p className="text-sm text-gray-muted font-medium leading-relaxed">
                    "{review.comment}"
                </p>
            )}

            {review.mission && (
                <div className="mt-4 pt-4 border-t border-gray-border">
                    <p className="text-xs text-gray-muted font-bold uppercase tracking-widest">
                        Mission: {review.mission.title}
                    </p>
                </div>
            )}
        </div>
    );
}
