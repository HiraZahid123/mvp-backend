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
            <Head title={t("Se connecter")} />

            <div className="mb-8 lg:mb-10 relative">
                <BackButton 
                    href={route('login')} 
                    className="absolute -top-12 left-0" 
                />

                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    {t("On connaît la chanson.")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("Vos accès, en toute sécurité.")}
                </p>
            </div>

            {status && (
                <div className="mb-6 font-medium text-sm text-green-600 bg-green-50 px-4 py-3 rounded-[24px] border border-green-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
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
                        placeholder={t("Votre mot de passe")}
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
                            className="text-sm font-bold text-primary-black hover:text-gold-accent transition-colors duration-200"
                        >
                            {t("Mot de passe oublié ?")}
                        </Link>
                    </div>
                )}

                {/* Submit Button */}
                <PrimaryButton className="w-full mt-4" disabled={processing}>
                    {processing ? t('Connexion...') : t('Se connecter')}
                </PrimaryButton>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-muted font-medium">
                    {t("Pas encore membre ?")}{' '}
                    <Link 
                        href={route('register')} 
                        className="text-primary-black font-black hover:underline"
                    >
                        {t("S'inscrire")}
                    </Link>
                </p>
            </div>

            {/* Forgot Password Modal/Info */}
            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs font-bold text-primary-black mb-1">
                    {t("Un petit trou de mémoire ?")}
                </p>
                <p className="text-xs text-gray-muted">
                    {t("Pas de panique, on vous envoie un lien de réinitialisation.")}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
