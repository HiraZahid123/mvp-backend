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
            heroHeading={t("One signup,")}
            heroSubtext={t("without the interrogation.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Sign Up")} />

            <div className="mb-8 lg:mb-10 relative">
                <BackButton 
                    href={route('register')} 
                    className="absolute -top-12 left-0" 
                />

                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t("One signup,")} <br className="hidden lg:block" /> {t("without the interrogation.")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("The bare minimum for a trusted connection.")}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="name" value={t("Full Name")} />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t("Your full name")}
                        autoComplete="name"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t("Email")} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t("your@email.com")}
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t("Password")} />
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t("Choose a password")}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password_confirmation" value={t("Confirm Password")} />
                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder={t("Confirm your password")}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Submit Button */}
                <PrimaryButton className="w-full mt-4" disabled={processing} processing={processing}>
                    {t("Sign Up")}
                </PrimaryButton>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-muted font-medium">
                    {t("Already a member?")}{' '}
                    <Link 
                        href={route('login')} 
                        className="text-oflem-charcoal font-black hover:underline"
                    >
                        {t("Sign In")}
                    </Link>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
