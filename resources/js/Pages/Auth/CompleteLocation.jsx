import React, { useState, useCallback } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import LocationPicker from '@/Components/LocationPicker';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';
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
        discovery_radius_km: 5,
    });

    const handleLocationSelect = useCallback((locData) => {
        setLocationData(locData);
        setData(prevData => ({
            ...prevData,
            ...locData,
        }));
    }, [setData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.complete-location.store'));
    };

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/login-hero.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Location")} />

            <div className="flex items-center mb-8">
                <BackButton href={route('auth.select-role')} className="text-sm">
                    {t('Back')}
                </BackButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Location Picker */}
                <LocationPicker
                    role={role || user?.role_type}
                    onLocationSelect={handleLocationSelect}
                    defaultRadius={5}
                />

                {errors.location_lat && <InputError message={errors.location_lat} />}
                {errors.zip_code && <InputError message={errors.zip_code} />}

                {/* Submit Button */}
                <PrimaryButton 
                    type="submit"
                    className="w-full" 
                    disabled={processing || !locationData}
                    processing={processing}
                >
                    {t('Confirm my area')}
                </PrimaryButton>
            </form>

            <div className="elegant-capsule mt-6">
                <p className="text-xs text-oflem-charcoal font-medium text-center">
                    {t("Your location is only used to connect you with local opportunities.")}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
