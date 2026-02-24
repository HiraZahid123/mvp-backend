import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import ChatWindow from '@/Components/ChatWindow';
import axios from 'axios';
import DashboardStats from '@/Components/Dashboard/DashboardStats';
import MissionFilterTabs from '@/Components/Dashboard/MissionFilterTabs';
import { 
    Briefcase, 
    Search, 
    ShieldCheck, 
    ArrowRight, 
    Layout, 
    Inbox,
    Package,
    Hammer,
    Sprout,
    Monitor,
    Truck,
    Dog,
    Sparkles,
    Utensils,
    Trash2,
    Rocket,
    Star,
    TrendingUp,
    CheckCircle,
    Clock,
    Wallet,
    Send,
    MapPin,
    Eye,
    Award,
    Compass,
    Settings,
    MessageSquare,
    CircleDollarSign,
    XCircle,
    Hourglass
} from 'lucide-react';

export default function Dashboard({ missions, stats, providerMissions, providerOffers, providerReviews, providerStats }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    const urlParams = new URLSearchParams(window.location.search);
    const chatWith = urlParams.get('chat_with');
    const missionId = urlParams.get('mission_id');


    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        if (chatWith && missionId) {
            axios.get(route('api.missions.chat', missionId)).then(response => {
                setActiveChat(response.data);
            });
        }
    }, [chatWith, missionId]);

    const renderDashboardContent = () => {
        const activeRole = user.last_selected_role || user.role_type;
        
        // If the active role is specifically set, use that dashboard
        if (activeRole === 'client') {
            return <ClientDashboard user={user} missions={missions} stats={stats} t={t} />;
        } else if (activeRole === 'provider') {
            return <ProviderDashboard user={user} providerMissions={providerMissions || []} providerOffers={providerOffers || []} providerReviews={providerReviews || []} providerStats={providerStats || {}} t={t} />;
        }

        // Fallback to BothDashboard if role_type is both and no last_selected_role is set
        switch (user.role_type) {
            case 'client':
                return <ClientDashboard user={user} missions={missions} stats={stats} t={t} />;
            case 'provider':
                return <ProviderDashboard user={user} providerMissions={providerMissions || []} providerOffers={providerOffers || []} providerReviews={providerReviews || []} providerStats={providerStats || {}} t={t} />;
            case 'both':
                return <BothDashboard user={user} t={t} />;
            default:
                return <DefaultDashboard user={user} t={t} />;
        }
    };

    return (
        <AuthenticatedLayout 
            header={t('Dashboard')}
            maxWidth="max-w-7xl"
            showFooter={true}
        >
            <Head title={t('Dashboard')} />
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {renderDashboardContent()}
            </div>

            {activeChat && (
                <ChatWindow 
                    chat={activeChat} 
                    onClose={() => setActiveChat(null)} 
                />
            )}
        </AuthenticatedLayout>
    );
}

function ClientDashboard({ user, missions, stats, t }) {
    const [activeTab, setActiveTab] = useState('all');

    const filteredMissions = missions.filter(m => {
        if (activeTab === 'all') return true;
        if (activeTab === 'open') return ['OUVERTE', 'EN_NEGOCIATION'].includes(m.status);
        if (activeTab === 'active') return ['VERROUILLEE', 'EN_COURS', 'EN_VALIDATION', 'EN_LITIGE'].includes(m.status);
        if (activeTab === 'completed') return m.status === 'TERMINEE';
        return true;
    });

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div>
                    <h3 className="text-3xl font-black text-oflem-charcoal mb-2">
                        {t('My Workspace')}
                    </h3>
                    <p className="text-zinc-500 font-bold text-sm">
                        {t('Welcome back')}, <span className="text-oflem-terracotta">{user.name}</span>. {t('You have')} <span className="text-oflem-charcoal font-black">{stats.open + stats.active}</span> {t('active tasks right now.')}
                    </p>
                </div>
                <Link 
                    href={route('missions.create')} 
                    className="bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white px-8 py-3.5 rounded-rs font-black shadow-sho hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                >
                    + {t('Post a New Mission')}
                </Link>
            </div>

            {/* Stats Bar */}
            <DashboardStats stats={stats} t={t} />

            {/* Missions Section */}
            <div className="bg-white border border-zinc-100 rounded-[32px] p-6 lg:p-10 shadow-sm relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-oflem-terracotta/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h4 className="text-xl font-black text-oflem-charcoal flex items-center gap-3">
                                {t('Manage Missions')}
                                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                                    {missions.length} {t('Total')}
                                </span>
                            </h4>
                        </div>
                        
                        <MissionFilterTabs 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                            t={t} 
                            counts={{
                                all: missions.length,
                                open: stats.open,
                                active: stats.active,
                                completed: stats.completed
                            }}
                        />
                    </div>
                    
                    {filteredMissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMissions.map((mission) => (
                                <div key={mission.id} className="bg-white border border-zinc-100 rounded-[28px] p-6 hover:shadow-xl hover:border-oflem-terracotta/20 transition-all group flex flex-col justify-between border-b-4 border-b-oflem-terracotta/10 hover:border-b-oflem-terracotta/40">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-oflem-cream rounded-xl flex items-center justify-center text-oflem-terracotta shadow-sm group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-oflem-terracotta group-hover:to-oflem-terracotta-light group-hover:text-white transition-all duration-300">
                                                {getCategoryEmoji(mission.category)}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusClasses(mission.status)}`}>
                                                    {mission.status}
                                                </span>
                                                {mission.offers_count > 0 && mission.status === 'OUVERTE' && (
                                                    <span className="text-[9px] font-black text-oflem-terracotta uppercase animate-pulse flex items-center gap-1">
                                                        <Sparkles size={10} /> {mission.offers_count} {t('New offers')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h5 className="font-black text-lg text-oflem-charcoal mb-2 line-clamp-1 group-hover:text-oflem-terracotta transition-colors">{mission.title}</h5>
                                        <p className="text-sm text-zinc-400 font-bold line-clamp-2 mb-6 leading-relaxed">
                                            {mission.description || t('No description provided.')}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(mission.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-oflem-charcoal bg-zinc-50 px-2 py-1 rounded-md">
                                                {mission.budget} CHF
                                            </span>
                                        </div>

                                        <Link 
                                            href={route('missions.show', mission.id)} 
                                            className="w-full flex items-center justify-center py-3.5 bg-zinc-50 rounded-xl text-xs font-black text-oflem-charcoal hover:bg-oflem-charcoal hover:text-white transition-all group/btn"
                                        >
                                            {t('Manage Mission')} 
                                            <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[32px] p-16 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-zinc-300">
                                <Inbox size={40} strokeWidth={1.5} />
                            </div>
                            <h5 className="text-xl font-black text-oflem-charcoal mb-2">{t('No Missions Managed')}</h5>
                            <p className="text-zinc-400 font-bold mb-8 max-w-xs mx-auto">
                                {t("It seems there's nothing here yet. Start by posting your first mission to find a provider.")}
                            </p>
                            <Link href={route('missions.create')} className="inline-flex items-center gap-2 bg-oflem-charcoal text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-oflem-terracotta transition-colors shadow-md group">
                                {t('Post My First Mission')}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href={route('providers.index')} className="bg-oflem-charcoal rounded-[32px] p-8 text-white flex items-center justify-between group overflow-hidden relative shadow-lg hover:-translate-y-1 transition-all">
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-2 flex items-center gap-3">
                            {t('Expert Providers')} <Search size={24} className="text-oflem-terracotta" />
                        </h4>
                        <p className="text-white/60 text-sm font-bold">{t('Browse and contact top helpers in your area.')}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-oflem-terracotta transition-all">
                        <ArrowRight size={24} />
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-oflem-terracotta/10 rounded-full blur-2xl group-hover:bg-oflem-terracotta/20 transition-all"></div>
                </Link>

                <div className="bg-white border border-zinc-100 rounded-[32px] p-8 flex items-center justify-between group hover:border-oflem-terracotta transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-oflem-cream rounded-2xl flex items-center justify-center text-oflem-terracotta shadow-inner group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-oflem-terracotta group-hover:to-oflem-terracotta-light group-hover:text-white transition-all duration-300">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h5 className="text-lg font-black text-oflem-charcoal mb-1">{t('How it works')}</h5>
                            <p className="text-sm text-zinc-400 font-bold">{t('Learn about safety and payments.')}</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-oflem-terracotta transition-colors">
                        <ArrowRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Emojis based on category strings
function getCategoryEmoji(category) {
    const iconSize = 22;
    const map = {
        'nettoyage': <Trash2 size={iconSize} />,
        'demenagement': <Package size={iconSize} />,
        'bricolage': <Hammer size={iconSize} />,
        'jardinage': <Sprout size={iconSize} />,
        'informatique': <Monitor size={iconSize} />,
        'livraison': <Truck size={iconSize} />,
        'animaux': <Dog size={iconSize} />,
        'sante-beaute': <Sparkles size={iconSize} />,
        'cuisine': <Utensils size={iconSize} />,
    };
    return map[category?.toLowerCase()] || <Layout size={iconSize} />;
}

function getStatusClasses(status) {
    switch (status) {
        case 'OUVERTE': return 'bg-oflem-cream text-oflem-terracotta';
        case 'EN_NEGOCIATION': return 'bg-blue-50 text-blue-500';
        case 'VERROUILLEE': return 'bg-zinc-100 text-zinc-600';
        case 'EN_COURS': return 'bg-yellow-50 text-yellow-600';
        case 'EN_VALIDATION': return 'bg-purple-50 text-purple-600';
        case 'TERMINEE': return 'bg-oflem-green/10 text-oflem-green';
        case 'ANNULEE': return 'bg-red-50 text-red-500';
        case 'EN_LITIGE': return 'bg-red-50 text-red-600 border border-red-100';
        default: return 'bg-zinc-100 text-zinc-400';
    }
}



function ProviderDashboard({ user, providerMissions, providerOffers, providerReviews, providerStats, t }) {
    const [activeTab, setActiveTab] = useState('all');

    const filteredMissions = providerMissions.filter(m => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return ['VERROUILLEE', 'EN_COURS'].includes(m.status);
        if (activeTab === 'validation') return ['EN_VALIDATION', 'EN_LITIGE'].includes(m.status);
        if (activeTab === 'completed') return m.status === 'TERMINEE';
        return true;
    });

    const statCards = [
        {
            label: t('Active Missions'),
            value: providerStats.active || 0,
            icon: Briefcase,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            description: t('Currently working on')
        },
        {
            label: t('Completed'),
            value: providerStats.completed || 0,
            icon: CheckCircle,
            color: 'text-oflem-green',
            bg: 'bg-oflem-green/10',
            description: t('Successfully delivered')
        },
        {
            label: t('Total Earned'),
            value: `${providerStats.earnings || 0} CHF`,
            icon: TrendingUp,
            color: 'text-oflem-terracotta',
            bg: 'bg-oflem-terracotta/10',
            description: t('From completed missions')
        },
        {
            label: t('Avg. Rating'),
            value: providerStats.avg_rating > 0 ? Number(providerStats.avg_rating).toFixed(1) : '—',
            icon: Star,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            description: `${providerStats.reviews_count || 0} ${t('reviews')}`
        }
    ];

    const providerFilterTabs = [
        { id: 'all', label: t('All'), count: providerMissions.length },
        { id: 'active', label: t('In Progress'), count: providerMissions.filter(m => ['VERROUILLEE', 'EN_COURS'].includes(m.status)).length },
        { id: 'validation', label: t('Validation'), count: providerMissions.filter(m => ['EN_VALIDATION', 'EN_LITIGE'].includes(m.status)).length },
        { id: 'completed', label: t('Done'), count: providerMissions.filter(m => m.status === 'TERMINEE').length },
    ];

    const getOfferStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted': return { label: t('Accepted'), classes: 'bg-oflem-green/10 text-oflem-green', icon: CheckCircle };
            case 'rejected': return { label: t('Rejected'), classes: 'bg-red-50 text-red-500', icon: XCircle };
            default: return { label: t('Pending'), classes: 'bg-amber-50 text-amber-600', icon: Hourglass };
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* 1. Hero Welcome Banner */}
            <div className="bg-oflem-charcoal rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-3xl lg:text-4xl font-black leading-tight">
                                {t('Welcome back')}, {user.name.split(' ')[0]}!
                            </h3>
                            {providerStats.avg_rating > 0 && (
                                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="text-sm font-black">{Number(providerStats.avg_rating).toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-white/60 text-lg font-bold">
                            {providerStats.active > 0
                                ? <>{t('You have')} <span className="text-oflem-terracotta font-black">{providerStats.active}</span> {t('active missions. Keep up the great work!')}</>
                                : t('Browse available missions nearby and start earning.')
                            }
                        </p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            <Link href={route('missions.active')} className="bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-oflem-charcoal font-black py-3 px-8 rounded-full hover:opacity-90 transition-all shadow-md flex items-center gap-2">
                                <Compass size={18} />
                                {t('Browse Missions')}
                            </Link>
                            <Link href={route('profile.edit')} className="bg-white/10 backdrop-blur-sm text-white font-black py-3 px-6 rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
                                <Eye size={18} />
                                {t('View Profile')}
                            </Link>
                        </div>
                    </div>

                    {/* Mini summary on hero */}
                    <div className="hidden lg:flex flex-col gap-3 min-w-[180px]">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black">{providerStats.offers_sent || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('Offers sent')}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black">{providerStats.balance || 0} <span className="text-sm">CHF</span></p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('Balance')}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-oflem-terracotta/10 rounded-full blur-3xl"></div>
            </div>

            {/* 2. Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* 3. My Active Missions */}
            <div className="bg-white border border-zinc-100 rounded-[32px] p-6 lg:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h4 className="text-xl font-black text-oflem-charcoal flex items-center gap-3">
                                {t('My Missions')}
                                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                                    {providerMissions.length} {t('Total')}
                                </span>
                            </h4>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {providerFilterTabs.map((tab) => (
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
                    </div>
                    
                    {filteredMissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMissions.map((mission) => (
                                <div key={mission.id} className="bg-white border border-zinc-100 rounded-[28px] p-6 hover:shadow-xl hover:border-oflem-terracotta/20 transition-all group flex flex-col justify-between border-b-4 border-b-blue-500/10 hover:border-b-blue-500/40">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-oflem-cream rounded-xl flex items-center justify-center text-oflem-terracotta shadow-sm group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-oflem-terracotta group-hover:to-oflem-terracotta-light group-hover:text-white transition-all duration-300">
                                                {getCategoryEmoji(mission.category)}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusClasses(mission.status)}`}>
                                                {mission.status}
                                            </span>
                                        </div>
                                        <h5 className="font-black text-lg text-oflem-charcoal mb-2 line-clamp-1 group-hover:text-oflem-terracotta transition-colors">{mission.title}</h5>
                                        <p className="text-sm text-zinc-400 font-bold line-clamp-2 mb-4 leading-relaxed">
                                            {mission.description || t('No description provided.')}
                                        </p>
                                        {/* Client info */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500">
                                                {mission.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400">{t('Client')}: {mission.user?.name || t('Unknown')}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(mission.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-oflem-charcoal bg-zinc-50 px-2 py-1 rounded-md">
                                                {mission.budget} CHF
                                            </span>
                                        </div>

                                        <Link 
                                            href={route('missions.show', mission.id)} 
                                            className="w-full flex items-center justify-center py-3.5 bg-zinc-50 rounded-xl text-xs font-black text-oflem-charcoal hover:bg-oflem-charcoal hover:text-white transition-all group/btn"
                                        >
                                            {t('View Mission')} 
                                            <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-50/50 border-2 border-dashed border-zinc-100 rounded-[32px] p-16 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-zinc-300">
                                <Inbox size={40} strokeWidth={1.5} />
                            </div>
                            <h5 className="text-xl font-black text-oflem-charcoal mb-2">{t('No Missions Yet')}</h5>
                            <p className="text-zinc-400 font-bold mb-8 max-w-xs mx-auto">
                                {t('Start browsing available missions and send offers to get your first job.')}
                            </p>
                            <Link href={route('missions.active')} className="inline-flex items-center gap-2 bg-oflem-charcoal text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-oflem-terracotta transition-colors shadow-md group">
                                {t('Browse Missions')}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Recent Offers */}
            {providerOffers.length > 0 && (
                <div className="bg-white border border-zinc-100 rounded-[32px] p-6 lg:p-10 shadow-sm">
                    <h4 className="text-xl font-black text-oflem-charcoal mb-6 flex items-center gap-3">
                        <Send size={20} className="text-oflem-terracotta" />
                        {t('My Recent Offers')}
                    </h4>
                    <div className="space-y-3">
                        {providerOffers.map((offer) => {
                            const statusInfo = getOfferStatusInfo(offer.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                                <Link 
                                    key={offer.id} 
                                    href={offer.mission ? route('missions.show', offer.mission.id) : '#'}
                                    className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-oflem-cream transition-colors group border border-transparent hover:border-oflem-terracotta/10"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-oflem-terracotta group-hover:scale-110 transition-transform">
                                            <CircleDollarSign size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-sm text-oflem-charcoal truncate">{offer.mission?.title || t('Mission')}</p>
                                            <p className="text-[11px] text-zinc-400 font-bold">{t('Offer')}: {offer.amount} CHF</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 ${statusInfo.classes}`}>
                                            <StatusIcon size={12} />
                                            {statusInfo.label}
                                        </span>
                                        <ArrowRight size={16} className="text-zinc-300 group-hover:text-oflem-terracotta group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 5. Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href={route('missions.active')} className="bg-oflem-charcoal rounded-[32px] p-8 text-white flex items-center justify-between group overflow-hidden relative shadow-lg hover:-translate-y-1 transition-all">
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-2 flex items-center gap-3">
                            {t('Find Missions')} <Compass size={24} className="text-oflem-terracotta" />
                        </h4>
                        <p className="text-white/60 text-sm font-bold">{t('Browse available missions near you and send offers.')}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-oflem-terracotta transition-all">
                        <ArrowRight size={24} />
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-oflem-terracotta/10 rounded-full blur-2xl group-hover:bg-oflem-terracotta/20 transition-all"></div>
                </Link>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href={route('onboarding.index')} className="bg-white border border-zinc-100 rounded-[24px] p-6 hover:shadow-lg hover:border-oflem-terracotta/30 transition-all group">
                        <div className="w-12 h-12 bg-oflem-cream rounded-xl flex items-center justify-center mb-4 text-oflem-terracotta group-hover:bg-gradient-to-br group-hover:from-oflem-terracotta group-hover:to-oflem-terracotta-light group-hover:text-white transition-all">
                            <Settings size={22} />
                        </div>
                        <h5 className="font-black text-oflem-charcoal text-sm mb-1">{t('Update Expertise')}</h5>
                        <p className="text-[11px] text-zinc-400 font-bold">{t('Showcase your skills')}</p>
                    </Link>
                    <Link href={route('wallet.index')} className="bg-white border border-zinc-100 rounded-[24px] p-6 hover:shadow-lg hover:border-oflem-terracotta/30 transition-all group">
                        <div className="w-12 h-12 bg-oflem-cream rounded-xl flex items-center justify-center mb-4 text-oflem-terracotta group-hover:bg-gradient-to-br group-hover:from-oflem-terracotta group-hover:to-oflem-terracotta-light group-hover:text-white transition-all">
                            <Wallet size={22} />
                        </div>
                        <h5 className="font-black text-oflem-charcoal text-sm mb-1">{t('Wallet & Earnings')}</h5>
                        <p className="text-[11px] text-zinc-400 font-bold">{providerStats.balance || 0} CHF {t('available')}</p>
                    </Link>
                </div>
            </div>

            {/* 6. Recent Reviews */}
            {providerReviews.length > 0 && (
                <div className="bg-white border border-zinc-100 rounded-[32px] p-6 lg:p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-black text-oflem-charcoal flex items-center gap-3">
                            <Award size={20} className="text-oflem-terracotta" />
                            {t('Recent Reviews')}
                        </h4>
                        {providerStats.avg_rating > 0 && (
                            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm font-black text-amber-700">{Number(providerStats.avg_rating).toFixed(1)}</span>
                                <span className="text-[10px] font-bold text-amber-500">({providerStats.reviews_count})</span>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {providerReviews.map((review) => (
                            <div key={review.id} className="bg-zinc-50 rounded-2xl p-5 hover:bg-oflem-cream transition-colors group">
                                <div className="flex items-center gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star} 
                                            size={14} 
                                            className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'} 
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-zinc-600 font-medium leading-relaxed line-clamp-3 mb-4 italic">
                                    "{review.comment || t('No comment')}"
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-oflem-charcoal/10 flex items-center justify-center text-[10px] font-black text-oflem-charcoal">
                                            {review.reviewer?.name?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500">{review.reviewer?.name || t('Anonymous')}</span>
                                    </div>
                                    {review.mission && (
                                        <span className="text-[10px] text-zinc-400 font-bold truncate max-w-[120px]">{review.mission.title}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BothDashboard({ user, t }) {
    return (
        <div className="space-y-10">
            {/* Split Welcome */}
            <div className="bg-gradient-to-br from-cream-accent to-white border border-oflem-terracotta/20 rounded-[32px] p-8 lg:p-12 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-3xl lg:text-4xl font-black text-oflem-charcoal mb-4 leading-tight">
                            {t('Hi')} {user.name.split(' ')[0]}, {t('Dual Power!')} <Rocket size={28} className="inline ml-1" />
                        </h3>
                        <p className="text-gray-muted text-lg font-bold">
                            {t("Manage your tasks and bookings all in one place. You're set for both worlds.")}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href={route('missions.create')} className="bg-oflem-charcoal text-white font-black py-3 px-6 rounded-full hover:opacity-90 transition-all text-sm shadow-md">{t('Post Task')}</Link>
                        <button className="bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-oflem-charcoal font-black py-3 px-8 rounded-full hover:opacity-90 transition-all text-sm shadow-md">{t('Available Tasks')}</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-border rounded-[32px] p-8">
                    <h4 className="text-xl font-black text-oflem-charcoal mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center transition-colors group-hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light"><svg className="w-4 h-4 text-oflem-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
                        {t('As a Client')}
                    </h4>
                    <div className="space-y-4">
                        <Link href={route('providers.index')} className="p-4 bg-oflem-cream rounded-[20px] font-black text-sm text-oflem-charcoal flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-oflem-terracotta/20">
                            <span>{t('Find Providers')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                        <div className="p-4 bg-oflem-cream rounded-[20px] font-black text-sm text-oflem-charcoal flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-oflem-terracotta/20">
                            <span>{t('Manage My Tasks')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-border rounded-[32px] p-8">
                    <h4 className="text-xl font-black text-oflem-charcoal mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center transition-colors group-hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light"><svg className="w-4 h-4 text-oflem-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                        {t('As a Provider')}
                    </h4>
                    <div className="space-y-4">
                        <Link href={route('missions.active')} className="p-4 bg-oflem-cream rounded-[20px] font-black text-sm text-oflem-charcoal flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-oflem-terracotta/20">
                            <span>{t('Available Tasks')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                        <div className="p-4 bg-oflem-cream rounded-[20px] font-black text-sm text-oflem-charcoal flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-oflem-terracotta/20">
                            <span>{t('My Earning Overview')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <Link href={route('onboarding.index')} className="p-4 bg-oflem-cream rounded-[20px] font-black text-sm text-oflem-charcoal flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-oflem-terracotta/20">
                            <span>{t('Update My Expertise')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DefaultDashboard({ user, t }) {
    return (
        <div className="bg-white border border-gray-border rounded-[32px] p-12 text-center max-w-2xl mx-auto mt-20 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-3xl font-black text-oflem-charcoal mb-4">{t('Welcome to Oflem!')}</h3>
            <p className="text-gray-muted text-lg font-bold mb-8">{t("You're logged in as")} {user.name}. {t('Your account setup is complete.')}</p>
            <Link href="/" className="bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-oflem-charcoal font-black py-3 px-8 rounded-full hover:opacity-90 inline-block shadow-md">
                {t('Get Started')}
            </Link>
        </div>
    );
}

/* Internal Components */
function DashboardCard({ title, subtitle, icon }) {
    return (
        <div className="bg-white border border-gray-border rounded-[24px] p-10 hover:shadow-xl hover:border-oflem-terracotta transition-all group cursor-pointer">
            <div className="w-14 h-14 bg-cream-accent rounded-full flex items-center justify-center mb-6 text-oflem-terracotta group-hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light group-hover:text-oflem-charcoal transition-colors shadow-sm">
                {icon}
            </div>
            <h5 className="text-lg font-black text-oflem-charcoal mb-1">{title}</h5>
            <p className="text-sm text-gray-muted font-bold">{subtitle}</p>
        </div>
    );
}

function LogoIcon() { return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function ScheduleIcon() { return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function EarningsIcon() { return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>; }
