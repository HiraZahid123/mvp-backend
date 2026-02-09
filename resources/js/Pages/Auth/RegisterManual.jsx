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
            heroHeading={t("Une inscription,")}
            heroSubtext={t("sans l'interrogatoire.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("S'inscrire")} />

            <div className="mb-8 lg:mb-10 relative">
                <BackButton 
                    href={route('register')} 
                    className="absolute -top-12 left-0" 
                />

                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    {t("Une inscription,")} <br className="hidden lg:block" /> {t("sans l'interrogatoire.")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("Le strict nécessaire pour une mise en relation de confiance.")}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="name" value={t("Nom complet")} />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t("Votre nom complet")}
                        autoComplete="name"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t("E-mail")} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t("votre@email.com")}
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t("Mot de passe")} />
                    <PasswordInput
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t("Choisissez un mot de passe")}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password_confirmation" value={t("Confirmer le mot de passe")} />
                    <PasswordInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder={t("Confirmez votre mot de passe")}
                        autoComplete="new-password"
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Submit Button */}
                <PrimaryButton className="w-full mt-4" disabled={processing} processing={processing}>
                    {t("S'inscrire")}
                </PrimaryButton>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-muted font-medium">
                    {t("Déjà membre ?")}{' '}
                    <Link 
                        href={route('login')} 
                        className="text-primary-black font-black hover:underline"
                    >
                        {t("Se connecter")}
                    </Link>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
