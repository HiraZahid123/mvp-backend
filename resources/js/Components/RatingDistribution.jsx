import React from 'react';
import { Star } from 'lucide-react';

export default function RatingDistribution({ distribution, totalReviews }) {
    const getPercentage = (count) => {
        if (totalReviews === 0) return 0;
        return Math.round((count / totalReviews) * 100);
    };

    return (
        <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars] || 0;
                const percentage = getPercentage(count);

                return (
                    <div key={stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-black text-oflem-charcoal">{stars}</span>
                            <Star className="w-3 h-3 fill-oflem-terracotta text-oflem-terracotta" />
                        </div>
                        
                        <div className="flex-1 h-2 bg-oflem-cream rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        
                        <span className="text-xs font-bold text-gray-muted w-12 text-right">
                            {count}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
