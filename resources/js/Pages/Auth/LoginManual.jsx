import React from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';
import useTranslation from '@/Hooks/useTranslation';

export default function LoginManual({ canResetPassword, status }) {
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
            heroImage="/images/illustrations/login-screen.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('auth.login.button')} />

            <div className="mb-8 lg:mb-10 relative">
                <BackButton 
                    href={route('login')} 
                    className="absolute -top-12 left-0" 
                />

                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t('auth.login.manual_title')}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t('auth.login.manual_subtitle')}
                </p>
            </div>

            {status && (
                <div className="elegant-capsule-success mb-6">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                {/* Email */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t('auth.login.email_label')} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('auth.login.email_placeholder')}
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t('auth.login.password_label')} />
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('auth.login.password_placeholder')}
                        autoComplete="current-password"
                        required
                    />
                    <InputError message={errors.password} />
                </div>

                {/* Forgot Password Link */}
                {canResetPassword && (
                    <div className="text-right">
                        <Link
                            href={route('password.request')}
                            className="text-sm font-bold text-oflem-charcoal hover:text-oflem-terracotta transition-colors duration-200"
                        >
                            {t('auth.login.forgot_password')}
                        </Link>
                    </div>
                )}

                {/* Submit Button */}
                <PrimaryButton className="w-full mt-4" disabled={processing} processing={processing}>
                    {t('auth.login.button')}
                </PrimaryButton>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-muted font-medium">
                    {t('auth.login.no_account')}{' '}
                    <Link 
                        href={route('register')} 
                        className="text-oflem-charcoal font-black hover:underline"
                    >
                        {t('auth.login.sign_up')}
                    </Link>
                </p>
            </div>

            {/* Forgot Password Modal/Info */}
            <div className="elegant-capsule mt-6">
                <p className="text-xs font-bold text-oflem-charcoal mb-1">
                    {t('auth.login.memory_gap')}
                </p>
                <p className="text-xs text-oflem-charcoal font-medium">
                    {t('auth.login.no_panic')}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
