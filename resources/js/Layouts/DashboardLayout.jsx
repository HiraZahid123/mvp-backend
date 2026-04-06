import React, { useState, useEffect } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { 
    Home, 
    MessageSquare, 
    ClipboardList, 
    Search, 
    Wallet, 
    ShieldCheck, 
    Settings, 
    HelpCircle, 
    Menu, 
    X,
    LogOut,
    RefreshCw,
    Bell,
    User,
    PlusCircle,
    ChevronDown
} from 'lucide-react';
import NotificationBell from '@/Components/Header/NotificationBell';
import Dropdown from '@/Components/Dropdown';

export default function DashboardLayout({ children, header }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const userRole = user.last_selected_role || user.role_type || 'client';
    const activePath = window.location.pathname;

    const navLinks = {
        client: [
            { name: t('Dashboard'), href: route('dashboard'), icon: Home },
            { name: t('Messages'), href: route('messages'), icon: MessageSquare, badge: user.unread_messages_count },
            { name: t('My Missions'), href: route('dashboard'), icon: ClipboardList },
            { name: t('Find Helpers'), href: route('providers.index'), icon: Search },
            { name: t('Payments'), href: route('wallet.client'), icon: Wallet },
            { name: t('Escrow'), href: route('dashboard'), icon: ShieldCheck },
        ],
        provider: [
            { name: t('Dashboard'), href: route('dashboard'), icon: Home },
            { name: t('Messages'), href: route('messages'), icon: MessageSquare, badge: user.unread_messages_count },
            { name: t('Mission History'), href: route('dashboard'), icon: ClipboardList },
            { name: t('Find Missions'), href: route('missions.active'), icon: Search },
            { name: t('My Wallet'), href: route('wallet.index'), icon: Wallet },
            { name: t('Earnings'), href: route('wallet.index'), icon: ShieldCheck },
        ]
    };

    const currentLinks = navLinks[userRole] || navLinks.client;

    const handleRoleSwitch = () => {
        router.post(route('role.switch'), { 
            role: userRole === 'provider' ? 'client' : 'provider' 
        });
    };

    return (
        <div className="db-wrap bg-oflem-cream min-h-screen">
            {/* Sidebar Overlay */}
            <div 
                className={`db-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Header */}
            <div className="db-mobile-header">
                <Link href="/" className="text-xl font-black text-white decoration-none">
                    Oflem<span className="text-oflem-terracotta">.</span>
                </Link>
                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <button 
                        className="db-hamburger p-2 text-white"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`db-sidebar shadow-2xl ${isSidebarOpen ? 'open' : ''}`}>
                <div className="db-logo">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">Oflem</span>
                        <span className="text-2xl font-black text-oflem-terracotta">.</span>
                    </Link>
                </div>

                <nav className="db-nav mt-4">
                    <ul>
                        {currentLinks.map((link, idx) => (
                            <li key={idx}>
                                <Link 
                                    href={link.href}
                                    className={activePath === link.href ? 'active' : ''}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <link.icon size={18} />
                                    <span>{link.name}</span>
                                    {link.badge > 0 && <span className="badge">{link.badge}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="px-6 mt-8 mb-4">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-[2px] mb-4">
                            {t('Account & Support')}
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <Link 
                                    href={route('profile.edit')}
                                    className="flex items-center gap-3 px-0 py-2 text-white/60 hover:text-white transition-colors text-sm font-bold"
                                >
                                    <Settings size={18} />
                                    {t('Settings')}
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="#"
                                    className="flex items-center gap-3 px-0 py-2 text-white/60 hover:text-white transition-colors text-sm font-bold"
                                >
                                    <HelpCircle size={18} />
                                    {t('Help Center')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Sidebar Bottom / User Profile */}
                <div className="mt-auto border-t border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black overflow-hidden border border-white/20">
                            {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-black text-[14px] truncate">{user.name}</div>
                            <div className="text-[10px] font-extrabold text-oflem-terracotta uppercase tracking-wider">
                                {t(userRole)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button 
                            onClick={handleRoleSwitch}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[12px] font-black transition-all border border-white/5"
                        >
                            <RefreshCw size={14} className="text-oflem-terracotta" />
                            {userRole === 'provider' ? t('Switch to Client') : t('Switch to Provider')}
                        </button>
                        
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[12px] font-black transition-all border border-red-500/10"
                        >
                            <LogOut size={14} />
                            {t('Log Out')}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="db-main">
                <header className="db-header">
                    <div>
                        <h1 className="db-title">{header || t('Dashboard')}</h1>
                        <p className="text-sm font-bold text-zinc-500 mt-1">
                            {t('Welcome back,')} <span className="text-oflem-charcoal">{user.name}</span>!
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                            <Wallet size={16} className="text-zinc-400" />
                            <div className="text-sm font-black text-oflem-charcoal">
                                CHF {parseFloat(user.balance || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="relative hidden sm:block">
                            <NotificationBell />
                        </div>

                        {userRole === 'client' && (
                            <Link 
                                href={route('missions.create')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-oflem-terracotta text-white rounded-2xl font-black text-sm shadow-lg shadow-oflem-terracotta/20 hover:scale-[1.02] transition-all"
                            >
                                <PlusCircle size={18} />
                                <span>{t('Post a Mission')}</span>
                            </Link>
                        )}
                    </div>
                </header>

                <div className="db-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
