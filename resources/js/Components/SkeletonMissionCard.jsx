import React from 'react';

export default function SkeletonMissionCard() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Meta Info Skeleton */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="h-10 bg-gray-200 rounded-2xl w-24"></div>
                <div className="h-10 bg-gray-200 rounded-2xl w-32"></div>
            </div>
        </div>
    );
}
