import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Header() {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    return (
        <nav className="w-full bg-white border-b border-gray-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-2">
                    <ApplicationLogo className="w-8 h-8 text-gold-accent" />
                    <span className="text-xl font-black text-primary-black tracking-tight">Oflem</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('About')}</Link>
                    <Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('How it works')}</Link>
                    <Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('Security & trust')}</Link>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <LanguageSwitcher />
                
                {auth.user ? (
                    <Link href={route('dashboard')} className="text-sm font-black text-primary-black hover:text-gold-accent transition-colors">
                        {t('Dashboard')}
                    </Link>
                ) : (
                    <>
                        <Link href={route('login')} className="text-sm font-black text-primary-black hover:text-gold-accent transition-colors">
                            {t('Log in')}
                        </Link>
                        <Link 
                            href={route('register')} 
                            className="bg-gold-accent text-primary-black px-6 py-2.5 rounded-full text-sm font-black hover:opacity-90 transition-all shadow-sm"
                        >
                            {t('Sign up for free')}
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
