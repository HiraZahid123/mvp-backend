import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthSplitLayout
            heroHeading={t('No worries!')}
            heroSubtext={t("We'll help you get back into your account in no time.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Forget Password?')} />
            
            <div className="mb-10 lg:mb-12 text-center lg:text-left relative">
                <BackButton 
                    href={route('login')} 
                    className="absolute -top-12 left-0" 
                    children={t('Back to login')}
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black mb-2 tracking-tight">{t('Reset Password')}</h1>
                <p className="text-gray-muted text-sm font-medium">{t("We'll send a password reset link to your email to help you regain access.")}</p>
            </div>

            {status && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-[24px] text-sm font-bold border border-green-100 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t('Email Address')} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t('Enter your email')}
                        required
                        autoFocus
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-6">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {t('Email Reset Link')}
                    </PrimaryButton>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
