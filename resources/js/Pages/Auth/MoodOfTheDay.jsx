import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import RoleCard from '@/Components/RoleCard';
import PrimaryButton from '@/Components/PrimaryButton';
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
            key: 'customer',
            icon: '/lowBattery.svg',
            title: t('FLEMMARD'),
            description: t('Je veux déléguer et me reposer aujourd\'hui.'),
        },
        {
            key: 'performer',
            icon: '/highBattery.svg',
            title: t('MOTIVÉ'),
            description: t('Je suis prêt à saisir des opportunités.'),
        },
        {
            key: 'both',
            icon: '/mediumBattery.svg',
            title: t('LES DEUX'),
            description: t('Les deux ! Mode multitâche activé.'),
        },
    ];

    return (
        <AuthSplitLayout 
            heroImage="/mood-of-the-day.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Mood of the Day")} />

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    {t("Quelle est l'humeur du jour ?")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("Bienvenue")}, <span className="font-bold text-primary-black">{user?.display_name || user?.name}</span> !
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
                >
                    {processing ? t('Chargement...') : t('C\'est parti !')}
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs text-gray-muted text-center">
                    {t('Cette sélection détermine votre tableau de bord initial. Vous pouvez la changer à tout moment.')}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
