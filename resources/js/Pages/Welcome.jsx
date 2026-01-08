import { Head, Link } from '@inertiajs/react';
import React from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';

export default function Welcome() {
    const { t } = useTranslation();
    return (
        <AuthSplitLayout
            heroImage="/login-page-hero.svg"
            heroHeading={t('Bienvenue sur Oflem')}
            heroSubtext={t('La première plateforme des flemmards.')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Welcome')} />
            
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="mb-10 lg:mb-12">
                    <h2 className="text-xl font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                    <h1 className="text-[40px] lg:text-[56px] font-black text-black tracking-tight leading-tight">
                        {t('Life Made')} <span className="text-gold-accent">{t('Easier')}</span>.
                    </h1>
                    <p className="mt-4 text-gray-muted text-base lg:text-lg max-w-md font-bold leading-relaxed">
                        {t('Whether you need a hand or want to lend one, Oflem connects you with the right people at the right time.')}
                    </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <Link
                        href={route('register')}
                        className="flex w-full justify-center items-center py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-sm text-lg"
                    >
                        {t('Get Started')}
                    </Link>

                    <Link
                        href={route('login')}
                        className="flex w-full justify-center items-center py-4 bg-white border border-gray-border text-primary-black font-black rounded-full hover:bg-gray-50 transition-all text-lg shadow-sm"
                    >
                        {t('Sign In')}
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-border w-full">
                    <p className="text-sm text-gray-muted italic font-bold">
                        "{t('Simplifying tasks, empowering performers.')}"
                    </p>
                    
                    <div className="mt-8">
                        <Link
                            href={route('admin.login')}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-muted hover:text-primary-black transition-colors"
                        >
                            {t('Admin Portal')}
                        </Link>
                    </div>
                </div>
            </div>
        </AuthSplitLayout>
    );
}
