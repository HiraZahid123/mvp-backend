import React, { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

import NotificationBell from '@/Components/Header/NotificationBell';
import useNotificationSound from '@/Hooks/useNotificationSound';
import Dropdown from '@/Components/Dropdown';

export default function Header() {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const { playSound } = useNotificationSound();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    const userRole = auth.user?.last_selected_role || auth.user?.role_type || 'guest';
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    // Listen for real-time notifications
    useEffect(() => {
        if (auth.user && window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
            channel.notification((notification) => {
                playSound();
                router.reload({ only: ['auth'] });
            });
            return () => {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            };
        }
    }, [auth.user?.id, playSound]);

    const navLinks = {
        admin: [
            { name: t('Dashboard'), href: '/admin/dashboard', icon: '📊' },
            { name: t('Users'), href: '/admin/users', icon: '👥' },
            { name: t('Withdrawals'), href: '/admin/withdrawals', icon: '💰' },
            { name: t('Missions'), href: '/admin/missions', icon: '📋' },
        ],
        performer: [
            { name: t('Dashboard'), href: route('dashboard') },
            { name: t('Find Missions'), href: route('missions.active') },
            { name: t('Messages'), href: route('messages') },
        ],
        customer: [
            { name: t('Dashboard'), href: route('dashboard') },
            { name: t('Find Helpers'), href: route('providers.index') },
            { name: t('Messages'), href: route('messages') },
        ],
        guest: [
            { name: t('Find Helpers'), href: route('providers.index') },
            { name: t('How it works'), href: '/#how-it-works' },
        ]
    };

    const currentLinks = isAdminRoute ? navLinks.admin : (userRole === 'performer' ? navLinks.performer : (userRole === 'customer' ? navLinks.customer : navLinks.guest));

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-border/50 sticky top-0 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Brand & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-xl md:text-2xl font-black tracking-tight text-oflem-charcoal uppercase group-hover:text-oflem-terracotta transition-colors">OFLEM</span>
                            {auth.user?.admin_role && isAdminRoute && (
                                <span className="text-[10px] bg-oflem-terracotta text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">ADMIN</span>
                            )}
                        </Link>

                        <div className="hidden lg:flex items-center space-x-1">
                            {currentLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                                        (window.location.pathname === link.href || (link.href !== '/' && window.location.pathname.startsWith(link.href)))
                                            ? 'bg-oflem-cream text-oflem-terracotta'
                                            : 'text-gray-muted hover:text-oflem-charcoal hover:bg-gray-50'
                                    }`}
                                >
                                    {link.icon && <span className="mr-2">{link.icon}</span>}
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden sm:flex items-center gap-4">


                        {auth.user ? (
                            <div className="flex items-center gap-3">
                                <NotificationBell />
                                
                                {/* Wallet Info */}
                                <Link 
                                    href={userRole === 'customer' ? route('wallet.client') : route('wallet.index')} 
                                    className="flex items-center gap-2 px-3 py-1.5 bg-oflem-cream rounded-full border border-gold-accent/20 hover:border-gold-accent transition-all group"
                                >
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-muted uppercase leading-none mb-0.5">{t('Wallet')}</span>
                                        <span className="text-xs font-black text-oflem-charcoal group-hover:text-oflem-terracotta transition-colors leading-none">
                                            {userRole === 'customer' 
                                                ? t('Client')
                                                : `CHF ${parseFloat(auth.user.balance || 0).toFixed(2)}`
                                            }
                                        </span>
                                    </div>
                                    <span className="text-lg">💰</span>
                                </Link>

                                {/* Role Specific Action Button */}
                                {!isAdminRoute && (
                                    userRole === 'performer' ? (
                                        <Link 
                                            href={route('missions.active')} 
                                            className="bg-oflem-charcoal text-white px-5 py-2 rounded-full text-xs font-black hover:bg-oflem-charcoal/90 transition-all shadow-sm"
                                        >
                                            {t('Available Tasks')}
                                        </Link>
                                    ) : (
                                        <Link 
                                            href={route('missions.create')} 
                                            className="bg-oflem-terracotta text-white px-5 py-2 rounded-full text-xs font-black hover:bg-oflem-terracotta/90 transition-all shadow-sm"
                                        >
                                            {t('Post a Mission')}
                                        </Link>
                                    )
                                )}

                                {/* Admin Panel Toggle */}
                                {auth.user.admin_role && (
                                    <Link 
                                        href={isAdminRoute ? route('dashboard') : '/admin/dashboard'}
                                        className={`p-2 rounded-full transition-all ${
                                            isAdminRoute 
                                                ? 'bg-oflem-charcoal text-white' 
                                                : 'bg-oflem-terracotta text-white hover:opacity-90'
                                        }`}
                                        title={isAdminRoute ? t('Exit Admin') : t('Admin Panel')}
                                    >
                                        {isAdminRoute ? '🏠' : '🔐'}
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 p-1 pr-3 bg-white border border-gray-border rounded-full hover:shadow-md transition-all">
                                            <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center text-xs font-black text-gold-accent overflow-hidden border border-gray-border/50">
                                                {auth.user.avatar ? (
                                                    <img src={auth.user.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    auth.user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-sm font-black text-oflem-charcoal hidden md:block">{auth.user.name.split(' ')[0]}</span>
                                            <svg className="w-4 h-4 text-gray-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content contentClasses="py-2 bg-white rounded-[24px] shadow-2xl border border-gray-border/50 w-56">
                                        <div className="px-5 py-3 border-b border-gray-border mb-1">
                                            <div className="text-[10px] font-black uppercase text-gray-muted mb-1">{t('Active Role')}</div>
                                            <div className="text-xs font-black text-oflem-terracotta uppercase tracking-widest">
                                                {isAdminRoute ? t('Administrator') : (userRole === 'performer' ? t('Provider') : t('Client'))}
                                            </div>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>👤 {t('Profile Settings')}</Dropdown.Link>
                                        
                                        {!isAdminRoute && (
                                            userRole === 'performer' ? (
                                                <button 
                                                    onClick={() => router.post(route('role.switch'), { role: 'customer' })}
                                                    className="block w-full px-4 py-2 text-left text-sm font-black text-oflem-charcoal hover:bg-oflem-cream transition-colors"
                                                >
                                                    🔄 {t('Switch to Flemmard')}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => router.post(route('role.switch'), { role: 'performer' })}
                                                    className="block w-full px-4 py-2 text-left text-sm font-black text-oflem-charcoal hover:bg-oflem-cream transition-colors"
                                                >
                                                    🔄 {t('Switch to Motivé')}
                                                </button>
                                            )
                                        )}

                                        <div className="border-t border-gray-border my-1"></div>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600">🚪 {t('Sign Out')}</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href={route('login')} className="text-sm font-black text-oflem-charcoal hover:underline px-2">
                                    {t('Log in')}
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="bg-oflem-terracotta text-white px-6 py-2.5 rounded-full font-black text-sm transition-all shadow-sm hover:shadow-md hover:bg-oflem-terracotta/90"
                                >
                                    {t('Sign up')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                            className="p-2 rounded-full text-gray-muted hover:text-oflem-charcoal hover:bg-gray-100 transition-all"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden bg-white border-t border-gray-border animate-in slide-in-from-top-1 duration-200`}>
                <div className="px-4 pt-4 pb-3 space-y-2">
                    {currentLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-4 py-3 rounded-2xl text-base font-black transition-all ${
                                window.location.pathname === link.href
                                    ? 'bg-oflem-cream text-oflem-terracotta'
                                    : 'text-gray-muted hover:bg-gray-50'
                            }`}
                        >
                            {link.icon && <span className="mr-3">{link.icon}</span>}
                            {link.name}
                        </Link>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-border">
                        {auth.user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="w-10 h-10 rounded-full bg-cream-accent flex items-center justify-center text-sm font-black text-gold-accent overflow-hidden border border-gray-border/50">
                                        {auth.user.avatar ? (
                                            <img src={auth.user.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            auth.user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-black text-base text-oflem-charcoal">{auth.user.name}</div>
                                        <div className="text-xs font-bold text-gray-muted uppercase tracking-widest">
                                            {isAdminRoute ? t('Admin') : (userRole === 'performer' ? t('Provider') : t('Client'))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 px-2">
                                    <Link href={route('profile.edit')} className="flex items-center justify-center py-3 bg-gray-50 rounded-2xl font-black text-sm text-gray-muted hover:bg-gray-100 transition-all">
                                        ⚙️ {t('Settings')}
                                    </Link>
                                    <Link href={route('logout')} method="post" as="button" className="flex items-center justify-center py-3 bg-red-50 rounded-2xl font-black text-sm text-red-600 hover:bg-red-100 transition-all">
                                        🚪 {t('Log out')}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 px-2">
                                <Link href={route('login')} className="flex items-center justify-center py-4 bg-gray-50 rounded-2xl font-black text-oflem-charcoal">
                                    {t('Log in')}
                                </Link>
                                <Link href={route('register')} className="flex items-center justify-center py-4 bg-oflem-terracotta text-white rounded-2xl font-black shadow-lg">
                                    {t('Get Started')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
