import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PhotoUploader from '@/Components/PhotoUploader';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';

export default function CompleteIdentity({ user }) {
    const [photoFile, setPhotoFile] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        username: user?.username || user?.name || '',
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
            <Head title="Profil" />

            <div className="flex items-center mb-8">
                <BackButton href={route('auth.select-role')} className="text-sm">
                    Retour
                </BackButton>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    Enchanté !<br />Presque prêt...
                </h1>
                <p className="text-gray-muted text-base font-medium px-4">
                    Ajoutez une photo et personnalisez votre pseudo si vous le souhaitez.<br />
                    Sinon, on utilisera votre nom.
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
                    <InputLabel htmlFor="username" value="Nom d'affichage (optionnel)" className="text-center lg:text-left" />
                    <TextInput
                        id="username"
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder="Laissez vide pour utiliser votre nom"
                        autoComplete="nickname"
                    />
                    <InputError message={errors.username} />
                </div>

                {/* Submit Button */}
                <PrimaryButton 
                    className="w-full" 
                    disabled={processing}
                    processing={processing}
                >
                    Continuer
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs text-gray-muted text-center">
                    Vos informations restent privées et sécurisées.
                </p>
            </div>
        </AuthSplitLayout>
    );
}
