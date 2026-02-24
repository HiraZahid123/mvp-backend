import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';

export default function VerifyEmail({ status }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthSplitLayout
            heroHeading={t('Verify and Explore!')}
            heroSubtext={t('Check your inbox to confirm your email and unlock all features.')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Email Verification')} />
            
            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                <BackButton 
                    href="/" 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-oflem-charcoal mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-oflem-charcoal tracking-tight mb-2">{t('Check Email')}</h1>
                <p className="text-gray-muted text-sm font-medium italic">{t('Thanks for signing up!')}</p>
            </div>

            <div className="p-8 bg-white border border-gray-border rounded-[24px] mb-8 text-center sm:text-left">
                <div className="w-16 h-16 bg-cream-accent rounded-full flex items-center justify-center mx-auto sm:mx-0 mb-6 shadow-sm">
                    <svg className="w-8 h-8 text-oflem-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-sm text-gray-muted leading-relaxed font-bold">
                    {t('Please verify your email address by clicking the link we just emailed to you. If you didn\'t receive it, we\'ll send another.')}
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-[24px] text-sm font-bold border border-green-100 text-center">
                    {t('A new verification link has been sent to your email.')}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <PrimaryButton className="w-full" disabled={processing}>
                    {t('Resend Verification Email')}
                </PrimaryButton>
                
                <div className="text-center pt-2">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-gray-muted hover:text-oflem-charcoal transition-colors font-bold underline underline-offset-4 decoration-1"
                    >
                        {t('Log Out')}
                    </Link>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
