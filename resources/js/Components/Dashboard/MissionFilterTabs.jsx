import React from 'react';

export default function MissionFilterTabs({ activeTab, setActiveTab, t, counts }) {
    const tabs = [
        { id: 'all', label: t('All Missions'), count: counts.all },
        { id: 'open', label: t('Open'), count: counts.open },
        { id: 'active', label: t('Active'), count: counts.active },
        { id: 'completed', label: t('Done'), count: counts.completed },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-black transition-all border ${
                        activeTab === tab.id
                            ? 'bg-oflem-charcoal text-white border-oflem-charcoal shadow-md scale-[1.02]'
                            : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300 hover:text-zinc-600'
                    } flex items-center gap-2`}
                >
                    {tab.label}
                    {tab.count > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
