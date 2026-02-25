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
            title: t('Client'),
            description: t('I want to delegate and rest today.'),
        },
        {
            key: 'provider',
            icon: '/images/icons/battery-high.svg',
            title: t('Provider'),
            description: t("I'm ready to seize opportunities."),
        },
        {
            key: 'both',
            icon: '/images/icons/battery-medium.svg',
            title: t('BOTH'),
            description: t('Both! Multitask mode activated.'),
        },
    ];

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/mood-of-the-day.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Mood of the Day")} />
            
            <div className="flex items-center mb-8">
                <BackButton href="/" className="text-sm">
                    {t('Back')}
                </BackButton>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t("What's the mood of the day?")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("Welcome")}, <span className="font-bold text-oflem-charcoal">{user?.display_name || user?.name}</span> !
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
                    {t("Let's go!")}
                </PrimaryButton>
            </form>

            <div className="elegant-capsule mt-6">
                <p className="text-xs text-oflem-charcoal font-medium text-center">
                    {t('This selection determines your initial dashboard. You can change it at any time.')}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
