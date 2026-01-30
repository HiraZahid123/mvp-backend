import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import NotificationBell from '@/Components/Header/NotificationBell';

export default function Header() {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const userRole = auth.user?.last_selected_role || auth.user?.role_type || 'guest';

    return (
        <nav className="w-full bg-oflem-cream border-b border-gray-border/50 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-oflem-cream/90">
            <div className="flex items-center gap-6 md:gap-12">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg md:text-xl font-black text-oflem-charcoal tracking-tight uppercase">OFLEM</span>
                </Link>

                <div className="hidden lg:flex items-center gap-8">
                    <Link href={route('missions.search')} className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">
                        {t('Browse Missions')}
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
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>
                
                {auth.user ? (
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        
                        {/* Primary Action Button Based on Role */}
                        {userRole === 'performer' ? (
                            <Link 
                                href={route('missions.search')} 
                                className="bg-oflem-terracotta text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-black hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
                            >
                                {t('Find Work')}
                            </Link>
                        ) : (
                            <Link 
                                href={route('missions.create')} 
                                className="bg-oflem-terracotta text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-black hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
                            >
                                {t('Post a Mission')}
                            </Link>
                        )}

                        <Link href={route('dashboard')} className="hidden md:block text-sm font-black text-oflem-charcoal hover:text-oflem-terracotta transition-colors">
                            {t('Dashboard')}
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link href={route('login')} className="hidden sm:block text-xs md:text-sm font-black text-oflem-charcoal hover:text-oflem-terracotta transition-colors px-2">
                            {t('Log in')}
                        </Link>
                        <Link 
                            href={route('missions.create')} 
                            className="bg-oflem-terracotta text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-black hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
                        >
                            {t('Post a Mission')}
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
