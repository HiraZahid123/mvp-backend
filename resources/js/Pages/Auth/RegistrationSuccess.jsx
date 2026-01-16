import React from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import useTranslation from '@/Hooks/useTranslation';

export default function RegistrationSuccess({ user }) {
    const { t } = useTranslation();
    const userRole = user?.role_type || 'customer';

    const content = {
        customer: {
            title: t("It's ready. Your freedom starts here."),
            description: t("You can now post your requests and enjoy OFLEM to delegate your tasks."),
            cta: t("Post my first request"),
            route: 'missions.search',
            emoji: '',
        },
        performer: {
            title: t("Welcome. Ready to heat up the meter?"),
            description: t("Explore opportunities around you and start earning by monetizing your time."),
            cta: t("Browse opportunities"),
            route: 'missions.search',
            emoji: '',
        },
        both: {
            title: t("The winning combo. Everything is active!"),
            description: t("You have access to all OFLEM features. Post, browse, and manage like a pro."),
            cta: t("Access dashboard"),
            route: 'missions.search',
            emoji: '',
        },
    };

    const selectedContent = content[userRole] || content.customer;

    return (
        <AuthSplitLayout 
            heroImage="/welcome-page-illustration.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Welcome!")} />

            <div className="text-center space-y-8">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-accent/20 to-gold-accent/5 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gold-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* Title & Description */}
                <div>
                    <div className="text-5xl mb-4">{selectedContent.emoji}</div>
                    <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-4 leading-tight">
                        {selectedContent.title}
                    </h1>
                    <p className="text-gray-muted text-base font-medium px-4 leading-relaxed">
                        {selectedContent.description}
                    </p>
                </div>

                {/* CTA Button */}
                <Link href={route(selectedContent.route)}>
                    <PrimaryButton className="w-full">
                        {selectedContent.cta}
                    </PrimaryButton>
                </Link>

                {/* Welcome Message */}
                <div className="p-6 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                    <p className="text-sm font-medium text-primary-black">
                        {t('Hello')} <span className="font-black">{user?.display_name || user?.name}</span> ! 👋
                    </p>
                    <p className="text-xs text-gray-muted mt-2">
                        {t('Your profile is complete and your account is active.')}
                    </p>
                </div>
            </div>
        </AuthSplitLayout>
    );
}
