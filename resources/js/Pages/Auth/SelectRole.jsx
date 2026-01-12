import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import RoleCard from '@/Components/RoleCard';
import PrimaryButton from '@/Components/PrimaryButton';
import useTranslation from '@/Hooks/useTranslation';

export default function SelectRole({ user }) {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(user?.role_type || null);

    const { data, setData, post, processing } = useForm({
        role: selectedRole,
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData('role', role);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('auth.select-role.store'));
    };

    const roles = [
        {
            key: 'customer',
            emoji: '🦥',
            title: t('FLEMMARD'),
            description: t('Je délègue. Mon temps est précieux.'),
        },
        {
            key: 'performer',
            emoji: '💪',
            title: t('MOTIVÉ'),
            description: t('Je gère. Prêt à rentabiliser ma disponibilité.'),
        },
        {
            key: 'both',
            emoji: '⚡',
            title: t('LES DEUX'),
            description: t('Les deux ! Parce que je suis multitâche.'),
        },
    ];

    return (
        <AuthSplitLayout 
            heroImage="/register-page-hero.svg"
            heroHeading={t("Choisissez votre rôle")}
            heroSubtext={t("Flemmard, Motivé, ou les deux ?")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Choisir un rôle")} />

            <div className="text-center mb-8 lg:mb-10">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    {t("Choisissez votre rôle")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("Comment souhaitez-vous utiliser OFLEM ?")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Cards */}
                <div className="space-y-4">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.key}
                            emoji={role.emoji}
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
                    {processing ? t('Enregistrement...') : t('Continuer')}
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs text-gray-muted text-center">
                    {t("Vous pourrez toujours changer votre rôle plus tard.")}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
