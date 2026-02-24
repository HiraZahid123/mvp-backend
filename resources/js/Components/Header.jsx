import React, { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

import NotificationBell from '@/Components/Header/NotificationBell';
import useNotificationSound from '@/Hooks/useNotificationSound';
import Dropdown from '@/Components/Dropdown';
import { 
    ChevronDown, LayoutDashboard, Users, Wallet, ClipboardList, 
    Home, UserCircle, RefreshCw, LogOut, Compass, MessageSquare,
    PlusCircle, Search, Briefcase, Settings, Bell, Star, 
    Menu, X, ArrowRight
} from 'lucide-react';

export default function Header() {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const { playSound } = useNotificationSound();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    const userRole = auth.user?.last_selected_role || auth.user?.role_type || 'guest';
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        if (auth.user && window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
            channel.notification((notification) => {
                playSound();
                router.reload({ only: ['auth'] });
            });
            return () => {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
                window.removeEventListener('scroll', handleScroll);
            };
        }
        return () => window.removeEventListener('scroll', handleScroll);
    }, [auth.user?.id, playSound]);

    const navLinks = {
        admin: [
            { name: t('Dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
            { name: t('Users'), href: '/admin/users', icon: Users },
            { name: t('Withdrawals'), href: '/admin/withdrawals', icon: Wallet },
            { name: t('Missions'), href: '/admin/missions', icon: ClipboardList },
        ],
        provider: [
            { name: t('Dashboard'), href: route('dashboard'), icon: Home },
            { name: t('Find Missions'), href: route('missions.active'), icon: Compass },
            { name: t('Messages'), href: route('messages'), icon: MessageSquare },
            { name: t('My Wallet'), href: route('wallet.index'), icon: Wallet },
        ],
        client: [
            { name: t('Dashboard'), href: route('dashboard'), icon: Home },
            { name: t('Find Helpers'), href: route('providers.index'), icon: Search },
            { name: t('Messages'), href: route('messages'), icon: MessageSquare },
            { name: t('My Wallet'), href: route('wallet.client'), icon: Wallet },
        ],
        both: [
            { name: t('Dashboard'), href: route('dashboard'), icon: Home },
            { name: t('Missions'), href: route('missions.active'), icon: Compass },
            { name: t('Messages'), href: route('messages'), icon: MessageSquare },
            { name: t('My Wallet'), href: route('wallet.index'), icon: Wallet },
        ],
        guest: [
            { name: t('How it works'), href: '/#how-it-works', icon: Star },
            { name: t('Find Helpers'), href: route('providers.index'), icon: Search },
        ]
    };

    const currentLinks = isAdminRoute 
        ? navLinks.admin 
        : (navLinks[userRole] || navLinks.guest);

    const isActive = (href) => {
        if (href === '/') return currentPath === '/';
        return currentPath.startsWith(href);
    };

    const dropdownLinks = [
        { name: t('Dashboard'), href: route('dashboard'), icon: Home },
        { name: t('Profile Settings'), href: route('profile.edit'), icon: UserCircle },
        ...(userRole === 'provider' || userRole === 'both' 
            ? [{ name: t('My Wallet'), href: route('wallet.index'), icon: Wallet }] 
            : [{ name: t('Payments'), href: route('wallet.client'), icon: Wallet }]
        ),
        { name: t('Notifications'), href: route('profile.notifications'), icon: Bell },
    ];

    const ctaButton = () => {
        if (isAdminRoute) return null;
        if (userRole === 'client' || userRole === 'both') {
            return { label: t('Post a mission'), href: route('missions.create'), style: 'terracotta' };
        }
        return null;
    };

    const cta = ctaButton();

    return (
        <nav className={`bg-white/95 backdrop-blur-xl border-b sticky top-0 z-[100] transition-all duration-300 ${
            scrolled ? 'border-zinc-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border-zinc-100'
        }`}>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
                <div className="flex justify-between h-[68px] items-center">
                    {/* Brand & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="logo text-[28px] font-black tracking-[-0.8px] text-zinc-900 flex items-baseline group hover:scale-[1.03] transition-transform duration-200">
                            Oflem<span className="text-oflem-terracotta">.</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1">
                            {currentLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.name + link.href}
                                        href={link.href}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                                            active
                                                ? 'bg-oflem-terracotta/8 text-oflem-terracotta'
                                                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <Icon size={15} className={active ? 'text-oflem-terracotta' : ''} />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden sm:flex items-center gap-3">
                        {/* Language Switcher */}
                        <div className="flex items-center bg-zinc-50 rounded-lg p-0.5 border border-zinc-100">
                            {['FR', 'EN', 'DE', 'IT'].map((lang, i) => (
                                <React.Fragment key={lang}>
                                    <button 
                                        onClick={() => router.post(route('language.switch'), { locale: lang.toLowerCase() })}
                                        className={`text-[11px] font-black px-2.5 py-1.5 rounded-md transition-all duration-200 ${
                                            usePage().props.locale?.toUpperCase() === lang 
                                                ? 'bg-white text-oflem-terracotta shadow-sm' 
                                                : 'text-zinc-400 hover:text-zinc-600'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                    {i < 3 && <div className="w-px h-3 bg-zinc-200" />}
                                </React.Fragment>
                            ))}
                        </div>

                        {auth.user ? (
                            <div className="flex items-center gap-2.5">
                                <NotificationBell />
                                
                                {/* User Dropdown */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 p-1 pr-3 bg-white border border-zinc-200 rounded-2xl hover:shadow-md hover:border-zinc-300 transition-all duration-200">
                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center text-sm font-black text-oflem-charcoal overflow-hidden border border-zinc-100">
                                                {auth.user.avatar ? (
                                                    <img src={auth.user.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    auth.user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[12px] font-black text-oflem-charcoal hidden md:block">{auth.user.name.split(' ')[0]}</span>
                                                <span className="text-[9px] font-bold text-oflem-terracotta uppercase tracking-wider">{t(userRole)}</span>
                                            </div>
                                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content contentClasses="py-1 bg-white rounded-2xl shadow-2xl border border-zinc-100 w-60 overflow-hidden">
                                        {/* Balance header */}
                                        <div className="px-4 py-3 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">{t('Account Balance')}</div>
                                            <div className="text-xl font-black">
                                                CHF {parseFloat(auth.user.balance || 0).toFixed(2)}
                                            </div>
                                        </div>
                                        
                                        {/* Links */}
                                        <div className="py-1">
                                            {dropdownLinks.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Dropdown.Link key={item.href + item.name} href={item.href}>
                                                        <span className="flex items-center gap-2.5 text-[13px]">
                                                            <Icon size={15} className="text-zinc-400" />
                                                            {item.name}
                                                        </span>
                                                    </Dropdown.Link>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Role Switch */}
                                        {!isAdminRoute && (
                                            <>
                                                <div className="border-t border-zinc-100" />
                                                <button 
                                                    onClick={() => router.post(route('role.switch'), { role: userRole === 'provider' ? 'client' : 'provider' })}
                                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                                                >
                                                    <RefreshCw size={15} className="text-zinc-400" />
                                                    {userRole === 'provider' ? t('Switch to Client') : t('Switch to Provider')}
                                                </button>
                                            </>
                                        )}

                                        <div className="border-t border-zinc-100" />
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            <span className="flex items-center gap-2.5 text-[13px] text-red-500">
                                                <LogOut size={15} />
                                                {t('Log out')}
                                            </span>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>

                                {/* CTA Button */}
                                {cta && (
                                    <Link 
                                        href={cta.href} 
                                        className={`px-5 py-2 rounded-xl text-[13px] font-black text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 ${
                                            cta.style === 'charcoal' 
                                                ? 'bg-oflem-charcoal hover:bg-zinc-800' 
                                                : 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light'
                                        }`}
                                    >
                                        {cta.style === 'charcoal' ? <Compass size={14} /> : <PlusCircle size={14} />}
                                        {cta.label}
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href={route('login')} className="text-[13px] font-black text-zinc-700 bg-white border border-zinc-200 px-5 py-2 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all">
                                    {t('Log in')}
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="text-[13px] font-black text-white bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light px-5 py-2 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-1.5"
                                >
                                    {t('Sign up')}
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile: Notification + Menu */}
                    <div className="flex items-center gap-2 sm:hidden">
                        {auth.user && <NotificationBell />}
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-all"
                        >
                            {showingNavigationDropdown ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden bg-white border-t border-zinc-100`}>
                <div className="px-4 pt-3 pb-5 space-y-1 max-h-[calc(100vh-68px)] overflow-y-auto">
                    {/* Nav Links */}
                    {currentLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.name + link.href}
                                href={link.href}
                                onClick={() => setShowingNavigationDropdown(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all ${
                                    active
                                        ? 'bg-oflem-terracotta/8 text-oflem-terracotta'
                                        : 'text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                <Icon size={18} className={active ? 'text-oflem-terracotta' : 'text-zinc-400'} />
                                {link.name}
                            </Link>
                        );
                    })}
                    
                    {/* CTA for mobile */}
                    {cta && (
                        <Link 
                            href={cta.href}
                            onClick={() => setShowingNavigationDropdown(false)}
                            className={`flex items-center justify-center gap-2 mx-2 mt-2 py-3.5 rounded-xl text-[14px] font-black text-white transition-all ${
                                cta.style === 'charcoal' 
                                    ? 'bg-oflem-charcoal' 
                                    : 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light'
                            }`}
                        >
                            {cta.style === 'charcoal' ? <Compass size={16} /> : <PlusCircle size={16} />}
                            {cta.label}
                        </Link>
                    )}

                    {/* Divider */}
                    <div className="border-t border-zinc-100 my-3" />

                    {/* Language Switcher Mobile */}
                    <div className="flex items-center justify-center gap-1 px-4 py-2">
                        {['FR', 'EN', 'DE', 'IT'].map((lang) => (
                            <button 
                                key={lang}
                                onClick={() => router.post(route('language.switch'), { locale: lang.toLowerCase() })}
                                className={`text-[11px] font-black px-3 py-1.5 rounded-lg transition-all ${
                                    usePage().props.locale?.toUpperCase() === lang 
                                        ? 'bg-oflem-terracotta/10 text-oflem-terracotta' 
                                        : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="border-t border-zinc-100 pt-3 mt-2">
                        {auth.user ? (
                            <div className="space-y-2">
                                {/* User Info Card */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-2xl">
                                    <div className="w-11 h-11 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-base font-black text-oflem-charcoal overflow-hidden shadow-sm">
                                        {auth.user.avatar ? (
                                            <img src={auth.user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            auth.user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-[14px] text-zinc-900 truncate">{auth.user.name}</div>
                                        <div className="text-[10px] font-bold uppercase text-oflem-terracotta tracking-wider">
                                            {t(userRole)} • CHF {parseFloat(auth.user.balance || 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Quick Links */}
                                <div className="space-y-0.5">
                                    {dropdownLinks.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link 
                                                key={item.href + item.name} 
                                                href={item.href}
                                                onClick={() => setShowingNavigationDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                                            >
                                                <Icon size={16} className="text-zinc-400" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Role Switch */}
                                {!isAdminRoute && (
                                    <button 
                                        onClick={() => {
                                            router.post(route('role.switch'), { role: userRole === 'provider' ? 'client' : 'provider' });
                                            setShowingNavigationDropdown(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                                    >
                                        <RefreshCw size={16} className="text-zinc-400" />
                                        {userRole === 'provider' ? t('Switch to Client') : t('Switch to Provider')}
                                    </button>
                                )}
                                
                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Link 
                                        href={route('profile.edit')}
                                        onClick={() => setShowingNavigationDropdown(false)}
                                        className="flex items-center justify-center gap-2 py-3 bg-zinc-100 rounded-xl font-black text-[12px] text-zinc-600 hover:bg-zinc-200 transition-all"
                                    >
                                        <Settings size={14} />
                                        {t('Settings')}
                                    </Link>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="flex items-center justify-center gap-2 py-3 bg-red-50 rounded-xl font-black text-[12px] text-red-500 hover:bg-red-100 transition-all"
                                    >
                                        <LogOut size={14} />
                                        {t('Logout')}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 px-2">
                                <Link 
                                    href={route('login')} 
                                    onClick={() => setShowingNavigationDropdown(false)}
                                    className="flex items-center justify-center py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl font-black text-zinc-900 text-[14px]"
                                >
                                    {t('Log in')}
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    onClick={() => setShowingNavigationDropdown(false)}
                                    className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white rounded-xl font-black text-[14px] shadow-sm"
                                >
                                    {t('Get Started')}
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
