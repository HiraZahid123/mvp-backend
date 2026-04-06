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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {statCards.map((stat, index) => (
                <div 
                    key={index} 
                    className="bg-white border border-zinc-100 rounded-[28px] p-6 shadow-sm hover:shadow-lg hover:border-oflem-terracotta/20 transition-all group relative overflow-hidden"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[2px] mb-0.5">
                                {stat.label}
                            </p>
                            <h4 className="text-2xl font-black text-oflem-charcoal tracking-tight">
                                {stat.value}
                            </h4>
                        </div>
                    </div>
                    <div className="relative z-10 mt-4 flex items-center justify-between">
                        <p className="text-[11px] font-bold text-zinc-400 italic">
                            {stat.description}
                        </p>
                        <div className={`w-1.5 h-1.5 rounded-full ${stat.color.replace('text-', 'bg-')} animate-pulse`}></div>
                    </div>
                    {/* Subtle accent line at the bottom */}
                    <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${stat.color.replace('text-', 'bg-')}`}></div>
                </div>
            ))}
        </div>
    );
}
