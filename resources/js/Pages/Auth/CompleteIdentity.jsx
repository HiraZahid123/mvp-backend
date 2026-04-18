import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PhotoUploader from '@/Components/PhotoUploader';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';
import useTranslation from '@/Hooks/useTranslation';

export default function CompleteIdentity({ user }) {
    const { t } = useTranslation();
    const [photoFile, setPhotoFile] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        username: user?.username || user?.name || '',
        phone: user?.phone || '',
        profile_photo: null,
    });

    const handlePhotoChange = (file) => {
        setPhotoFile(file);
        setData('profile_photo', file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.complete-identity.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/verify-email.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('auth.complete_identity.title')} />

            <div className="flex items-center mb-8">
                <BackButton href={route('auth.select-role')} className="text-sm">
                    {t('common.back')}
                </BackButton>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t('auth.complete_identity.nice_to_meet')}<br />{t('auth.complete_identity.almost_ready')}
                </h1>
                <p className="text-gray-muted text-base font-medium px-4">
                    {t('auth.complete_identity.subtitle')}<br />
                    {t('auth.complete_identity.name_notice')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photo Upload */}
                <div>
                    <PhotoUploader
                        value={photoFile}
                        onChange={handlePhotoChange}
                        previewUrl={user?.profile_photo_url}
                    />
                    <div className="text-center mt-2">
                        <span className="text-xs text-gray-muted italic">({t('common.optional')})</span>
                    </div>
                    <InputError message={errors.profile_photo} className="mt-2 text-center" />
                </div>

                {/* Username/Display Name */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="username" value={`${t('auth.complete_identity.display_name')} (${t('common.optional')})`} className="text-center lg:text-left" />
                    <TextInput
                        id="username"
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder={t('auth.complete_identity.display_name_placeholder')}
                        autoComplete="nickname"
                    />
                    <InputError message={errors.username} />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="phone" value={`${t('auth.complete_identity.phone')} (${t('common.optional')})`} className="text-center lg:text-left" />
                    <TextInput
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder={t('auth.complete_identity.phone_placeholder')}
                        autoComplete="tel"
                    />
                    <InputError message={errors.phone} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <PrimaryButton 
                        className="w-full" 
                        disabled={processing}
                        processing={processing}
                    >
                        {t('auth.select_role.button')}
                    </PrimaryButton>
                    <button 
                        type="button" 
                        onClick={handleSubmit} 
                        className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={processing}
                    >
                        {t('onboarding.skip_for_now') || 'Passer pour l\'instant'}
                    </button>
                </div>
            </form>

            <div className="elegant-capsule mt-6">
                <p className="text-xs text-oflem-charcoal font-medium text-center">
                    {t('auth.complete_identity.privacy_notice')}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
