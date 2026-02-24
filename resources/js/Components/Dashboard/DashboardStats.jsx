import React from 'react';
import { Briefcase, Clock, CheckCircle, Wallet } from 'lucide-react';

export default function DashboardStats({ stats, t }) {
    const statCards = [
        {
            label: t('Open Missions'),
            value: stats.open || 0,
            icon: Briefcase,
            color: 'text-oflem-terracotta',
            bg: 'bg-oflem-terracotta/10',
            description: t('Awaiting offers')
        },
        {
            label: t('In Progress'),
            value: stats.active || 0,
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            description: t('Active missions')
        },
        {
            label: t('Completed'),
            value: stats.completed || 0,
            icon: CheckCircle,
            color: 'text-oflem-green',
            bg: 'bg-oflem-green/10',
            description: t('Total finished')
        },
        {
            label: t('Wallet Balance'),
            value: `${stats.balance || 0} CHF`,
            icon: Wallet,
            color: 'text-oflem-charcoal',
            bg: 'bg-zinc-100',
            description: t('Available funds')
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <div 
                    key={index} 
                    className="bg-white border border-zinc-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                                {stat.label}
                            </p>
                            <h4 className="text-2xl font-black text-oflem-charcoal">
                                {stat.value}
                            </h4>
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] font-bold text-zinc-400 italic">
                        {stat.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
