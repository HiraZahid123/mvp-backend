import React from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

export default function Login({ canResetPassword, status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout
            heroHeading={t('Welcome Back')}
            heroSubtext={t('Log in and choose to relax or take action.')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Sign In')} />
            
            <div className="mb-10 lg:mb-12 text-center lg:text-left relative">
                <BackButton 
                    href="/" 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black mb-2 tracking-tight">{t('Sign In')}</h1>
                <p className="text-gray-muted text-sm font-medium">{t('Sign in to continue where you left off and manage your tasks easily.')}</p>
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100">{status}</div>}

            <form onSubmit={submit} className="space-y-8">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t('Email Address')} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('Enter your email')}
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t('Password')} />
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('Enter your password')}
                        autoComplete="current-password"
                        required
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <label htmlFor="remember" className="text-sm text-gray-muted cursor-pointer font-medium">{t('Remember me')}</label>
                    </div>


                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-bold text-primary-black hover:underline"
                        >
                            {t('Forget Password?')}
                        </Link>
                    )}
                </div>

                <PrimaryButton className="w-full mt-2" disabled={processing}>
                    {t('Sign In')}
                </PrimaryButton>
            </form>

            <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-border/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-off-white-bg px-6 text-gray-muted font-bold uppercase tracking-wider text-xs">
                        <span className="hidden lg:inline">{t('Or Login with')}</span>
                        <span className="lg:hidden">{t('Or Login with')}</span>
                    </span>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <SocialLink provider="google" type="login" />
                <SocialLink provider="facebook" type="login" />
                <SocialLink provider="apple" type="login" />
            </div>

            <p className="text-center text-sm text-gray-muted mt-12 font-medium">
                {t("Don't have an account?")} <Link href={route('register')} className="text-primary-black font-black hover:underline">{t('Sign up')}</Link>
            </p>
        </AuthSplitLayout>
    );
}

function SocialLink({ provider, type }) {
    const icons = {
        google: (
            <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
        ),
        facebook: (
            <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z" />
            </svg>
        ),
        apple: (
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.47-1.09-.42-2.09-.44-3.23.05-.83.39-1.79.4-2.82-.4-5.32-4.33-4.47-12.78 1.87-12.83 1.63-.03 2.76.71 3.65.73.95.03 2.52-1.03 4.14-.64 1.74.45 2.56 1.48 2.07 2.22-.57.85-2.07 2.09-2.05 4.35 0 2.63 2.06 3.64 2.15 3.73-1.89 4.39-3.72 4.79-2.7 2.32zm-3.08-15.17c1.32-1.6 2.09-3.5 1.83-5.11-1.68.17-3.75 1.13-4.8 2.37-1.06 1.15-1.92 2.92-1.62 4.54 1.77.16 3.49-1.04 4.59-1.8z" />
            </svg>
        ),
    };

    return (
        <a 
            href={route('social.redirect', { provider, type })} 
            className="w-14 h-14 flex items-center justify-center bg-white border border-gray-border/50 rounded-full transition-all duration-300 hover:shadow-lg hover:border-gold-accent hover:-translate-y-1 group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gold-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="group-hover:scale-110 transition-transform duration-300 relative z-10">
                {icons[provider]}
            </div>
        </a>
    );
}
