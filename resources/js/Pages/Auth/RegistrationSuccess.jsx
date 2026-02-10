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
            route: route('missions.create'),
            emoji: '🛋️',
        },
        performer: {
            title: t("Welcome. Ready to start earning?"),
            description: t("Explore opportunities around you and start earning by monetizing your time."),
            cta: t("Browse opportunities"),
            route: route('missions.active'),
            emoji: '💪',
        },
        both: {
            title: t("The winning combo. Everything is active!"),
            description: t("You have access to all OFLEM features. Post, browse, and manage like a pro."),
            cta: t("Access dashboard"),
            route: route('dashboard'),
            emoji: '🚀',
        },
    };

    const selectedContent = content[userRole] || content.customer;

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/welcome-hero.svg"
            bgAccentClass="bg-oflem-cream"
        >
            <Head title={t("Welcome!")} />

            <div className="text-center space-y-10">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-[32px] bg-oflem-terracotta/10 flex items-center justify-center rotate-6">
                        <div className="w-16 h-16 rounded-2xl bg-oflem-terracotta flex items-center justify-center -rotate-6 shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Title & Description */}
                <div>
                    <div className="text-5xl mb-6">{selectedContent.emoji}</div>
                    <h1 className="text-4xl lg:text-5xl font-black text-oflem-charcoal tracking-tight mb-4 leading-[0.95]">
                        {selectedContent.title}
                    </h1>
                    <p className="text-gray-muted text-lg font-bold px-4 leading-relaxed tracking-tight">
                        {selectedContent.description}
                    </p>
                </div>

                {/* Next Steps / Quick Guide */}
                <div className="text-left bg-white p-8 rounded-[32px] border border-gray-border shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-oflem-terracotta mb-2">{t('Next Steps')}</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-oflem-cream flex items-center justify-center text-xs font-black">1</div>
                            <p className="text-sm font-bold text-oflem-charcoal">{userRole === 'performer' ? t('Your expertise is now visible on your public profile.') : t('Describe your first task with the "lazy search".')}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-oflem-cream flex items-center justify-center text-xs font-black">2</div>
                            <p className="text-sm font-bold text-oflem-charcoal">{userRole === 'performer' ? t('Configure your discovery radius (currently 5km).') : t('Wait for the "Motivés" to send you their offers.')}</p>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                    <Link href={selectedContent.route}>
                        <PrimaryButton className="w-full py-5 bg-oflem-terracotta hover:bg-oflem-terracotta/90 text-white font-black uppercase tracking-widest rounded-full text-sm">
                            {selectedContent.cta}
                        </PrimaryButton>
                    </Link>
                </div>

                {/* Welcome Message */}
                <div className="text-xs font-bold text-gray-muted">
                    {t('Hello')} <span className="text-oflem-charcoal font-black">{user?.display_name || user?.name}</span> ! 👋 {t('Your profile is complete.')}
                </div>
            </div>
        </AuthSplitLayout>
    );
}
