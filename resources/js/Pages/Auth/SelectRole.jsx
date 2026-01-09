import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import BackButton from '@/Components/BackButton';

export default function SelectRole({ intended }) {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        role: '',
        intended: intended || null,
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData('role', role);
    };

    const handleContinue = () => {
        post(route('auth.select-role.store'));
    };

    const roles = [
        {
            id: 'customer',
            title: t("I'm lazy!"),
            description: t('Post your tasks and relax. Let our Motives handle it for you.'),
            icon: (
                <div className="w-12 h-12 bg-off-white-bg rounded-full flex items-center justify-center mb-0 flex-shrink-0 transition-colors group-hover:bg-cream-accent">
                    <svg className="w-6 h-6 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
            )
        },
        {
            id: 'performer',
            title: t("I'm motivated"),
            description: t('Pick tasks that match your skills. Work when you want, earn what you deserve.'),
            icon: (
                <div className="w-12 h-12 bg-off-white-bg rounded-full flex items-center justify-center mb-0 flex-shrink-0 transition-colors group-hover:bg-cream-accent">
                    <svg className="w-6 h-6 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )
        },
        {
            id: 'both',
            title: t("Both"),
            description: t('Enjoy the best of both worlds. Be a Motive and a Task Creator.'),
            icon: (
                <div className="w-12 h-12 bg-off-white-bg rounded-full flex items-center justify-center mb-0 flex-shrink-0 transition-colors group-hover:bg-cream-accent">
                    <svg className="w-6 h-6 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            )
        }
    ];

    return (
        <AuthSplitLayout
            heroImage="/role-selection.svg"
            heroHeading={t('What do you want to do?')}
            heroSubtext={t('Choose what suits you best. You can change later.')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Select Role')} />
            
            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                <BackButton 
                    href={route('register')} 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black tracking-tight mb-2">{t('What do you want to do?')}</h1>
                <p className="text-gray-muted text-sm font-medium">{t('Choose what suits you best. You can change later.')}</p>
            </div>

            <div className="space-y-4">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-5 bg-white border rounded-[24px] cursor-pointer transition-all flex items-center justify-between group ${
                            selectedRole === role.id ? 'border-gold-accent ring-1 ring-gold-accent' : 'border-gray-border hover:border-gold-accent'
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            {role.icon}
                            <div>
                                <h3 className="font-black text-primary-black">{role.title}</h3>
                                <p className="text-xs text-gray-muted font-bold">{role.description}</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedRole === role.id ? 'border-gold-accent' : 'border-gray-border group-hover:border-gold-accent'
                        }`}>
                            <div className={`w-3 h-3 rounded-full transition-colors ${
                                selectedRole === role.id ? 'bg-gold-accent' : 'bg-transparent'
                            }`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {errors.role && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-4">{errors.role}</p>
            )}

            <div className="mt-10">
                <PrimaryButton
                    onClick={handleContinue}
                    disabled={!selectedRole || processing}
                    className="w-full"
                >
                    {t('Join')}
                </PrimaryButton>
            </div>
        </AuthSplitLayout>
    );
}
