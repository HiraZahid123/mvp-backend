import React from 'react';
import { Sliders } from 'lucide-react';

export default function FilterSidebar({ filters, onFilterChange, availableCategories }) {
    const defaultCategories = [
        'Cleaning', 'Moving', 'DIY', 'IT', 'Admin', 'Delivery', 
        'Pets', 'Gardening', 'Events', 'Education', 'Wellness', 'Other'
    ];
    
    const displayCategories = availableCategories?.length > 0 
        ? [...new Set([...availableCategories, ...defaultCategories])]
        : defaultCategories;

    return (
        <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <Sliders className="w-5 h-5 text-oflem-terracotta" />
                    <h2 className="text-xl font-black text-oflem-charcoal">Filters</h2>
                </div>

                <div className="space-y-6">
                    {/* Category */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Category
                        </label>
                        <select
                            value={filters.categories && filters.categories.length > 0 ? filters.categories[0] : ''}
                            onChange={(e) => onFilterChange({ ...filters, categories: e.target.value ? [e.target.value] : [] })}
                            className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                        >
                            <option value="">All Categories</option>
                            {displayCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Range */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Budget Range
                        </label>
                        <div className="space-y-3">
                            <input
                                type="number"
                                placeholder="Min CHF"
                                value={filters.min_budget || ''}
                                onChange={(e) => onFilterChange({ ...filters, min_budget: e.target.value })}
                                className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                            />
                            <input
                                type="number"
                                placeholder="Max CHF"
                                value={filters.max_budget || ''}
                                onChange={(e) => onFilterChange({ ...filters, max_budget: e.target.value })}
                                className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                            />
                        </div>
                    </div>

                    {/* Radius */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-muted mb-3 block">
                            Distance: {filters.radius || 5}km
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={filters.radius || 5}
                            onChange={(e) => onFilterChange({ ...filters, radius: e.target.value })}
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
                            value={filters.deadline || ''}
                            onChange={(e) => onFilterChange({ ...filters, deadline: e.target.value })}
                            className="w-full px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                        />
                    </div>

                    {/* Remote Only */}
                    <div className="flex items-center justify-between p-4 bg-oflem-cream rounded-2xl">
                        <span className="font-bold text-oflem-charcoal">Remote Only</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.remote_only || false}
                                onChange={(e) => onFilterChange({ ...filters, remote_only: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-oflem-terracotta/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light"></div>
                        </label>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => onFilterChange({ radius: 5, sort_by: filters.sort_by || 'distance' })}
                        className="w-full px-6 py-3 bg-gray-100 text-oflem-charcoal rounded-2xl font-black hover:bg-gray-200 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
