import React, { useState } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import RoleCard from '@/Components/RoleCard';
import PrimaryButton from '@/Components/PrimaryButton';
import useTranslation from '@/Hooks/useTranslation';
import BackButton from '@/Components/BackButton';
import ProgressIndicator from '@/Components/ProgressIndicator';

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
            icon: '/images/icons/battery-low.svg',
            title: t('FLEMMARD'),
            description: t('Je délègue. Mon temps est précieux.'),
        },
        {
            key: 'performer',
            icon: '/images/icons/battery-high.svg',
            title: t('MOTIVÉ'),
            description: t('Je gère. Prêt à rentabiliser ma disponibilité.'),
        },
    ];

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/role-selection.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Choisir un rôle")} />

            {/* Back Button & Progress */}
            <div className="flex items-center justify-between mb-8">
                <BackButton href={route('register')} className="text-sm">
                    {t('Back')}
                </BackButton>
                <ProgressIndicator currentStep={2} totalSteps={5} />
            </div>

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
                    {t('Continuer')}
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs text-gray-muted text-center">
                    {t("You can switch roles anytime. Motivés can also post missions as Flemmards.")}
                </p>
            </div>
        </AuthSplitLayout>
    );
}
