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
            heroHeading={t("Your time is a resource.")}
            heroSubtext={t("Manage it like a pro.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Sign Up")} />

            <div className="text-center lg:text-left">
                <h1 className="text-[36px] lg:text-[44px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t("Your time is a resource.")}
                </h1>
                <h2 className="text-lg lg:text-xl text-oflem-charcoal font-serif italic mb-6">
                    {t("Manage it like a pro.")}
                </h2>
                <p className="text-gray-muted text-base font-medium mb-10 leading-relaxed">
                    {t("Delegate your imperatives to breathe, or optimize your schedule to earn.")}
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
                    className="text-base font-bold text-oflem-charcoal hover:text-oflem-terracotta transition-colors duration-200 underline underline-offset-4"
                >
                    {t("Or sign up by email")}
                </Link>
            </div>

            {/* Login Link */}
            <div className="mt-12 text-center">
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
