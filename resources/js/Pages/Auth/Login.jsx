import React from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link } from '@inertiajs/react';
import SocialLoginButton from '@/Components/SocialLoginButton';
import useTranslation from '@/Hooks/useTranslation';

export default function Login({ canResetPassword, status }) {
    const { t } = useTranslation();

    return (
        <AuthSplitLayout
            heroImage="/images/illustrations/login-screen.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Se connecter")} />

            {status && (
                <div className="mb-6 font-medium text-sm text-green-600 bg-green-50 px-4 py-3 rounded-[24px] border border-green-100">
                    {status}
                </div>
            )}

            <div className="text-center lg:text-left">
                <h1 className="text-[36px] lg:text-[44px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    {t("Ravi de vous revoir.")}
                </h1>
                <p className="text-gray-muted text-base font-medium mb-10 leading-relaxed">
                    {t("Le temps est une ressource. Gérez la vôtre comme un pro.")}
                </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-10">
                <SocialLoginButton provider="apple" type="login" />
                <SocialLoginButton provider="google" type="login" />
                <SocialLoginButton provider="facebook" type="login" />
            </div>

            {/* Email Login Link */}
            <div className="text-center">
                <Link 
                    href={route('login.manual')}
                    className="text-base font-bold text-primary-black hover:text-gold-accent transition-colors duration-200 underline underline-offset-4"
                >
                    {t("Ou utiliser mon e-mail")}
                </Link>
            </div>

            {/* Register Link */}
            <div className="mt-12 text-center">
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
        </AuthSplitLayout>
    );
}
