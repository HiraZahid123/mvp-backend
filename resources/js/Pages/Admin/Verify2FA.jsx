import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import MinimalAuthenticatedLayout from '@/Layouts/MinimalAuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Verify2FA({ email }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.2fa.verify'));
    };

    return (
        <MinimalAuthenticatedLayout>
            <Head title={t('Admin 2FA Verification')} />

            <div className="max-w-md mx-auto mt-20">
                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-border">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gold-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-accent/20">
                            <span className="text-4xl">🔐</span>
                        </div>
                        <h1 className="text-2xl font-black text-primary-black mb-2">{t('Verification Required')}</h1>
                        <p className="text-sm text-gray-muted font-bold">
                            {t('We\'ve sent a 6-digit code to')} <br />
                            <span className="text-primary-black font-black">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <InputLabel htmlFor="code" value={t('Verification Code')} className="text-xs uppercase tracking-widest font-black mb-3" />
                            <TextInput
                                id="code"
                                type="text"
                                name="code"
                                value={data.code}
                                className="w-full text-center text-3xl font-black tracking-[0.5em] py-5"
                                isFocused={true}
                                onChange={(e) => setData('code', e.target.value)}
                                maxLength={6}
                                required
                            />
                            <InputError message={errors.code} className="mt-2" />
                        </div>

                        <div className="flex flex-col gap-4">
                            <PrimaryButton className="w-full py-5 text-lg" disabled={processing}>
                                {processing ? t('Verifying...') : t('Verify & Continue')}
                            </PrimaryButton>
                            
                            <div className="text-center">
                                <Link
                                    href={route('admin.2fa.resend')}
                                    method="post"
                                    as="button"
                                    className="text-xs font-black text-gold-accent uppercase tracking-widest hover:underline"
                                >
                                    {t('Didn\'t receive the code? Resend')}
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <Link
                        href={route('admin.logout')}
                        method="post"
                        as="button"
                        className="text-sm font-bold text-gray-muted hover:text-primary-black"
                    >
                        ← {t('Back to Login')}
                    </Link>
                </div>
            </div>
        </MinimalAuthenticatedLayout>
    );
}
