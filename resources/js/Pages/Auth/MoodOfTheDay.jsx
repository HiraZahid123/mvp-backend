import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import RoleCard from '@/Components/RoleCard';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';
import useTranslation from '@/Hooks/useTranslation';

export default function MoodOfTheDay({ user, currentRole }) {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(currentRole || null);

    const { data, setData, post, processing } = useForm({
        role: selectedRole,
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData('role', role);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.mood-of-the-day.store'));
    };

    const roles = [
        {
            key: 'client',
            icon: '/images/icons/battery-low.svg',
            title: t('auth.select_role.client_title'),
            description: t('auth.mood_of_the_day.client_desc'),
        },
        {
            key: 'provider',
            icon: '/images/icons/battery-high.svg',
            title: t('auth.select_role.provider_title'),
            description: t('auth.mood_of_the_day.provider_desc'),
        },
        {
            key: 'both',
            icon: '/images/icons/battery-medium.svg',
            title: t('auth.mood_of_the_day.both_title'),
            description: t('auth.mood_of_the_day.both_desc'),
        },
    ];

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/mood-of-the-day.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('auth.mood_of_the_day.title')} />
            
            <div className="flex items-center mb-8">
                <BackButton href="/" className="text-sm">
                    {t('common.back')}
                </BackButton>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t('auth.mood_of_the_day.question')}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t('auth.mood_of_the_day.welcome')}, <span className="font-bold text-oflem-charcoal">{user?.display_name || user?.name}</span> !
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Cards */}
                <div className="space-y-4">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.key}
                            icon={role.icon}
                            title={role.title}
                            description={role.description}
                            selected={selectedRole === role.key}
                            onClick={() => handleRoleSelect(role.key)}
                        />
                    ))}
                </div>

                {/* Submit Button */}
                <PrimaryButton 
                    className="w-full mt-6" 
                    disabled={processing || !selectedRole}
                    processing={processing}
                >
                    {t('auth.mood_of_the_day.button')}
                </PrimaryButton>
            </form>

            <div className="elegant-capsule mt-6">
                <p className="text-xs text-oflem-charcoal font-medium text-center">
                    {t('auth.mood_of_the_day.footer_notice')}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
