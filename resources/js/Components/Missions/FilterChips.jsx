import React from 'react';
import { X } from 'lucide-react';

export default function FilterChips({ filters, onFilterChange }) {
    const activeFilters = [];

    // Build active filter list
    if (filters.search) {
        activeFilters.push({ key: 'search', label: `Search: ${filters.search}`, value: filters.search });
    }
    if (filters.category) {
        activeFilters.push({ key: 'category', label: `Category: ${filters.category}`, value: filters.category });
    }
    if (filters.min_budget) {
        activeFilters.push({ key: 'min_budget', label: `Min: CHF ${filters.min_budget}`, value: filters.min_budget });
    }
    if (filters.max_budget) {
        activeFilters.push({ key: 'max_budget', label: `Max: CHF ${filters.max_budget}`, value: filters.max_budget });
    }
    if (filters.radius && filters.radius !== 5) {
        activeFilters.push({ key: 'radius', label: `${filters.radius}km radius`, value: filters.radius });
    }
    if (filters.remote_only) {
        activeFilters.push({ key: 'remote_only', label: 'Remote only', value: true });
    }
    if (filters.deadline) {
        activeFilters.push({ key: 'deadline', label: `Deadline: ${filters.deadline}`, value: filters.deadline });
    }

    const removeFilter = (key) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFilterChange(newFilters);
    };

    const clearAll = () => {
        onFilterChange({ radius: 5, sort_by: filters.sort_by || 'distance' });
    };

    if (activeFilters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-gray-muted">
                Active Filters:
            </span>
            {activeFilters.map((filter) => (
                <button
                    key={filter.key}
                    onClick={() => removeFilter(filter.key)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-oflem-terracotta/10 text-oflem-terracotta rounded-full text-sm font-bold hover:bg-oflem-terracotta hover:text-white transition-colors group"
                >
                    {filter.label}
                    <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                </button>
            ))}
            {activeFilters.length > 1 && (
                <button
                    onClick={clearAll}
                    className="text-xs font-black uppercase tracking-widest text-gray-muted hover:text-oflem-terracotta transition-colors"
                >
                    Clear All
                </button>
            )}
        </div>
    );
}
