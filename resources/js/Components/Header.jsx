import React, { useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import NotificationBell from '@/Components/Header/NotificationBell';
import useNotificationSound from '@/Hooks/useNotificationSound';

export default function Header() {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const userRole = auth.user?.last_selected_role || auth.user?.role_type || 'guest';
    const { playSound } = useNotificationSound();
    
    // Listen for real-time notifications
    useEffect(() => {
        if (auth.user && window.Echo) {
            // Subscribe to user's private notification channel
            const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
            
            // Listen for notification events
            channel.notification((notification) => {
                console.log('New notification received:', notification);
                
                // Play notification sound
                playSound();
                
                // Reload auth data to update unread count
                router.reload({ only: ['auth'] });
            });

            // Cleanup on unmount
            return () => {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            };
        }
    }, [auth.user?.id, playSound]);
    
    
    // Check if current path is an admin route
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    return (
        <nav className="w-full bg-oflem-cream border-b border-gray-border/50 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-oflem-cream/90">
            <div className="flex items-center gap-6 md:gap-12">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg md:text-xl font-black text-oflem-charcoal tracking-tight uppercase">OFLEM</span>
                    {auth.user?.admin_role && isAdminRoute && (
                        <span className="text-xs bg-oflem-terracotta text-white px-2 py-1 rounded-full font-bold">ADMIN</span>
                    )}
                </Link>

                {/* Admin Navigation - Show when on admin routes */}
                {auth.user?.admin_role && isAdminRoute ? (
                    <div className="hidden lg:flex items-center gap-2">
                        <Link 
                            href="/admin/dashboard" 
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                window.location.pathname === '/admin/dashboard'
                                    ? 'bg-oflem-terracotta text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            📊 {t('Dashboard')}
                        </Link>
                        <Link 
                            href="/admin/users" 
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                window.location.pathname.startsWith('/admin/users')
                                    ? 'bg-oflem-terracotta text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            👥 {t('Users')}
                        </Link>
                        <Link 
                            href="/admin/withdrawals" 
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                window.location.pathname.startsWith('/admin/withdrawals')
                                    ? 'bg-oflem-terracotta text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            💰 {t('Withdrawals')}
                        </Link>
                        <Link 
                            href="/admin/missions" 
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                window.location.pathname.startsWith('/admin/missions')
                                    ? 'bg-oflem-terracotta text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            📋 {t('Missions')}
                        </Link>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href={route('providers.index')} className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">
                            {t('Find Helpers')}
                        </Link>
                        <Link href="/#how-it-works" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">
                            {t('How it works')}
                        </Link>
                        {userRole === 'performer' && (
                            <Link href={route('dashboard')} className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">
                                {t('My Work')}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>
                
                {auth.user ? (
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        
                        <Link href={route('messages')} className="p-2 text-gray-muted hover:text-oflem-charcoal transition-colors relative" title={t('Messages')}>
                            <span className="text-xl">✉️</span>
                            {auth.unread_notifications_count > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-oflem-terracotta text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                    {auth.unread_notifications_count}
                                </span>
                            )}
                        </Link>

                        {/* Wallet Link - Routes to performer or client wallet based on role */}
                        <Link 
                            href={auth.user.role_type === 'customer' ? route('wallet.client') : route('wallet.index')} 
                            className="flex items-center gap-2 group" 
                            title={t('Wallet')}
                        >
                            <div className="flex flex-col items-end hidden md:flex">
                                <span className="text-[10px] font-black text-gray-muted uppercase tracking-widest leading-none mb-1">{t('Wallet')}</span>
                                <span className="text-sm font-black text-oflem-charcoal group-hover:text-oflem-terracotta transition-colors leading-none">
                                    {auth.user.role_type === 'customer' 
                                        ? t('Spending')
                                        : `CHF ${parseFloat(auth.user.balance || 0).toFixed(2)}`
                                    }
                                </span>
                            </div>
                            <span className="text-xl p-2 bg-white rounded-xl border border-gray-border shadow-sm group-hover:border-oflem-terracotta transition-all">💰</span>
                        </Link>

                        {/* Admin Panel Link - Only for admins */}
                        {auth.user.admin_role && (
                            <Link 
                                href={isAdminRoute ? route('dashboard') : '/admin/dashboard'}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                                    isAdminRoute 
                                        ? 'bg-gray-700 text-white hover:bg-gray-800' 
                                        : 'bg-oflem-terracotta text-white hover:bg-opacity-90'
                                }`}
                            >
                                <span>{isAdminRoute ? '🏠' : '🔐'}</span>
                                <span className="hidden lg:block">{isAdminRoute ? t('Exit Admin') : t('Admin Panel')}</span>
                            </Link>
                        )}

                        {!isAdminRoute && (
                            <Link href={route('dashboard')} className="hidden lg:block text-sm font-black text-oflem-charcoal hover:text-oflem-terracotta transition-colors ml-2">
                                {t('Dashboard')}
                            </Link>
                        )}

                    </div>
                ) : (
                    <>
                        <Link href={route('login')} className="hidden sm:block text-xs md:text-sm font-black text-oflem-charcoal hover:text-oflem-terracotta transition-colors px-2">
                            {t('Log in')}
                        </Link>
                        <Link 
                            href={route('register')} 
                            className="bg-oflem-terracotta hover:bg-opacity-90 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-sm hover:shadow-md"
                        >
                            {t('Sign up')}
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
