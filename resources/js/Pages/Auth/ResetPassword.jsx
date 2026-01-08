import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

export default function ResetPassword({ token, email }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout
            heroHeading={t('Reset Done?')}
            heroSubtext={t('Create a secure new password and jump back into action.')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Reset Password')} />
            
            <div className="mb-10 lg:mb-12 text-center lg:text-left relative">
                <BackButton 
                    href={route('login')} 
                    className="absolute -top-12 left-0" 
                    children={t('Back to login')}
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black mb-2 tracking-tight">{t('New Password')}</h1>
                <p className="text-gray-muted text-sm font-medium">{t('Create a secure new password for your account.')}</p>
            </div>

            <form onSubmit={submit} className="space-y-5 pb-8">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t('Email Address')} />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="opacity-70 cursor-not-allowed"
                        readOnly
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t('New Password')} />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('Enter new password')}
                            required
                            autoFocus
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-6 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5 text-gray-muted hover:text-primary-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-gray-muted hover:text-primary-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="password_confirmation" value={t('Confirm New Password')} />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder={t('Confirm new password')}
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <div className="pt-4">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {t('Reset Password')}
                    </PrimaryButton>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
