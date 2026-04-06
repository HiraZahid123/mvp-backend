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
                    <InputError message={errors.profile_photo} className="mt-2 text-center" />
                </div>

                {/* Username/Display Name */}
                <div className="space-y-1.5">
                    <InputLabel htmlFor="username" value={t('auth.complete_identity.display_name')} className="text-center lg:text-left" />
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
                    <InputLabel htmlFor="phone" value={t('auth.complete_identity.phone')} className="text-center lg:text-left" />
                    <TextInput
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder={t('auth.complete_identity.phone_placeholder')}
                        autoComplete="tel"
                        required
                    />
                    <InputError message={errors.phone} />
                </div>

                {/* Submit Button */}
                <PrimaryButton 
                    className="w-full" 
                    disabled={processing}
                    processing={processing}
                >
                    {t('auth.select_role.button')}
                </PrimaryButton>
            </form>

            <div className="elegant-capsule mt-6">
                <p className="text-xs text-oflem-charcoal font-medium text-center">
                    {t('auth.complete_identity.privacy_notice')}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
