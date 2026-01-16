import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import LocationPicker from '@/Components/LocationPicker';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import useTranslation from '@/Hooks/useTranslation';

export default function CompleteLocation({ user, role }) {
    const { t } = useTranslation();
    const [locationData, setLocationData] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        method: 'gps',
        location_lat: null,
        location_lng: null,
        zip_code: null,
        location_address: null,
        discovery_radius_km: 10,
    });

    const handleLocationSelect = (locData) => {
        setLocationData(locData);
        setData({
            ...data,
            ...locData,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.complete-location.store'));
    };

    return (
        <AuthSplitLayout 
            heroImage="/login-page-hero.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Localisation")} />

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Location Picker */}
                <LocationPicker
                    role={role || user?.role_type}
                    onLocationSelect={handleLocationSelect}
                    defaultRadius={10}
                />

                {errors.location_lat && <InputError message={errors.location_lat} />}
                {errors.zip_code && <InputError message={errors.zip_code} />}

                {/* Submit Button */}
                <PrimaryButton 
                    className="w-full" 
                    disabled={processing || !locationData}
                >
                    {processing ? t('Enregistrement...') : t('Confirmer ma zone')}
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs text-gray-muted text-center">
                    {t("Votre position est utilisée uniquement pour vous connecter avec des opportunités locales.")}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
