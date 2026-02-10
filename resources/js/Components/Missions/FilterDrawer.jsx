import React, { useState } from 'react';
import { X, Sliders } from 'lucide-react';

export default function FilterDrawer({ filters, onFilterChange, isOpen, onClose }) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleApply = () => {
        onFilterChange(localFilters);
        onClose();
    };

    const categories = [
        'Cleaning', 'Moving', 'DIY', 'IT', 'Admin', 'Delivery', 
        'Pets', 'Gardening', 'Events', 'Education', 'Wellness', 'Other'
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 lg:hidden overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sliders className="w-5 h-5 text-oflem-terracotta" />
                        <h2 className="text-xl font-black text-oflem-charcoal">Filters</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 space-y-6">
                    {/* Category */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Category
                        </label>
                        <select
                            value={localFilters.category || ''}
                            onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                            className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Range */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Budget Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min CHF"
                                value={localFilters.min_budget || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, min_budget: e.target.value })}
                                className="px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                            />
                            <input
                                type="number"
                                placeholder="Max CHF"
                                value={localFilters.max_budget || ''}
                                onChange={(e) => setLocalFilters({ ...localFilters, max_budget: e.target.value })}
                                className="px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                            />
                        </div>
                    </div>

                    {/* Radius */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Distance: {localFilters.radius || 5}km
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={localFilters.radius || 5}
                            onChange={(e) => setLocalFilters({ ...localFilters, radius: e.target.value })}
                            className="w-full h-2 bg-oflem-cream rounded-lg appearance-none cursor-pointer accent-oflem-terracotta"
                        />
                        <div className="flex justify-between text-xs text-gray-muted mt-1">
                            <span>1km</span>
                            <span>50km</span>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Deadline
                        </label>
                        <input
                            type="date"
                            value={localFilters.deadline || ''}
                            onChange={(e) => setLocalFilters({ ...localFilters, deadline: e.target.value })}
                            className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                        />
                    </div>

                    {/* Remote Only */}
                    <div className="flex items-center justify-between p-4 bg-oflem-cream rounded-2xl">
                        <span className="font-bold text-oflem-charcoal">Remote Only</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localFilters.remote_only || false}
                                onChange={(e) => setLocalFilters({ ...localFilters, remote_only: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-oflem-terracotta/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-oflem-terracotta"></div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-4">
                    <button
                        onClick={() => {
                            setLocalFilters({ radius: 5, sort_by: 'distance' });
                            onFilterChange({ radius: 5, sort_by: 'distance' });
                            onClose();
                        }}
                        className="flex-1 px-6 py-4 bg-gray-100 text-oflem-charcoal rounded-2xl font-black hover:bg-gray-200 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-6 py-4 bg-oflem-terracotta text-white rounded-2xl font-black hover:bg-oflem-terracotta/90 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
}
