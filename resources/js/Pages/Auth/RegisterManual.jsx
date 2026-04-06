import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';
import useTranslation from '@/Hooks/useTranslation';

export default function RegisterManual() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/register-hero.svg"
            heroHeading={t('auth.register.manual_hero_title')}
            heroSubtext={t('auth.register.manual_hero_subtitle')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('auth.register.button')} />

            <div className="mb-8 lg:mb-10 relative">
                <BackButton 
                    href={route('register')} 
                    className="absolute -top-12 left-0" 
                />

                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t('auth.register.manual_hero_title')} <br className="hidden lg:block" /> {t('auth.register.manual_hero_subtitle')}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t('auth.register.manual_subtext')}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="name" value={t('auth.register.full_name')} />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('auth.register.full_name_placeholder')}
                        autoComplete="name"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t('auth.register.email')} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('auth.register.email_placeholder')}
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t('auth.register.password')} />
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('auth.register.password_placeholder')}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password_confirmation" value={t('auth.register.confirm_password')} />
                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder={t('auth.register.confirm_password_placeholder')}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Submit Button */}
                <PrimaryButton className="w-full mt-4" disabled={processing} processing={processing}>
                    {t('auth.register.button')}
                </PrimaryButton>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-muted font-medium">
                    {t('auth.register.already_member')}{' '}
                    <Link 
                        href={route('login')} 
                        className="text-oflem-charcoal font-black hover:underline"
                    >
                        {t('auth.register.sign_in')}
                    </Link>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
