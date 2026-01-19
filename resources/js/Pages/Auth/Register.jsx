import React from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link } from '@inertiajs/react';
import SocialLoginButton from '@/Components/SocialLoginButton';
import useTranslation from '@/Hooks/useTranslation';

export default function Register() {
    const { t } = useTranslation();

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/register-hero.svg"
            heroHeading={t("Votre temps est une ressource.")}
            heroSubtext={t("Gérez-la comme un pro.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("S'inscrire")} />

            <div className="text-center lg:text-left">
                <h1 className="text-[36px] lg:text-[44px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    {t("Votre temps est une ressource.")}
                </h1>
                <h2 className="text-lg lg:text-xl text-primary-black font-serif italic mb-6">
                    {t("Gérez-la comme un pro.")}
                </h2>
                <p className="text-gray-muted text-base font-medium mb-10 leading-relaxed">
                    {t("Déléguez vos impératifs pour respirer, ou optimisez votre agenda pour encaisser.")}
                </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-10">
                <SocialLoginButton provider="apple" type="register" />
                <SocialLoginButton provider="google" type="register" />
                <SocialLoginButton provider="facebook" type="register" />
            </div>

            {/* Email Registration Link */}
            <div className="text-center">
                <Link 
                    href={route('register.manual')}
                    className="text-base font-bold text-primary-black hover:text-gold-accent transition-colors duration-200 underline underline-offset-4"
                >
                    {t("Ou s'inscrire par e-mail")}
                </Link>
            </div>

            {/* Login Link */}
            <div className="mt-12 text-center">
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
