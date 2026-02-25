import React from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import useTranslation from '@/Hooks/useTranslation';
import { UserCircle, Briefcase, Rocket, Hand } from 'lucide-react';

export default function RegistrationSuccess({ user }) {
    const { t } = useTranslation();
    const userRole = user?.role_type || 'client';

    const icons = {
        client: <UserCircle size={48} className="text-oflem-terracotta" />,
        provider: <Briefcase size={48} className="text-oflem-terracotta" />,
        both: <Rocket size={48} className="text-oflem-terracotta" />
    };
    const selectedIcon = icons[userRole] || icons.client;

    const content = {
        client: {
            title: t("It's ready. Your freedom starts here."),
            description: t("You can now post your requests and enjoy OFLEM to delegate your tasks."),
            cta: t("Post my first request"),
            route: route('missions.create'),
        },
        provider: {
            title: t("Welcome. Ready to start earning?"),
            description: t("Explore opportunities around you and start earning by monetizing your time."),
            cta: t("Browse opportunities"),
            route: route('missions.active'),
        },
        both: {
            title: t("The winning combo. Everything is active!"),
            description: t("You have access to all OFLEM features. Post, browse, and manage like a pro."),
            cta: t("Access dashboard"),
            route: route('dashboard'),
        },
    };

    const selectedContent = content[userRole] || content.client;

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/welcome-hero.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Welcome!")} />

            <div className="text-center space-y-10">
                {/* Unified Role Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[32px] bg-oflem-terracotta/10 flex items-center justify-center shadow-sm">
                            {selectedIcon}
                        </div>
                        {/* Status Badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-oflem-terracotta flex items-center justify-center shadow-elegant-glow border-2 border-white">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Title & Description */}
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-oflem-charcoal tracking-tight mb-4 leading-[0.95]">
                        {selectedContent.title}
                    </h1>
                    <p className="text-gray-muted text-lg font-bold px-4 leading-relaxed tracking-tight">
                        {selectedContent.description}
                    </p>
                </div>

                {/* Next Steps / Quick Guide */}
                <div className="elegant-capsule !bg-oflem-cream/30 !p-8 !border-oflem-terracotta/10 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-oflem-terracotta mb-2 text-left">{t('Next Steps')}</h3>
                    <div className="space-y-4 text-left">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-oflem-terracotta text-white flex items-center justify-center text-xs font-black shadow-sm">1</div>
                            <p className="text-sm font-bold text-oflem-charcoal">{userRole === 'provider' ? t('Your expertise is now visible on your public profile.') : t('Describe your first task with the "lazy search".')}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-oflem-terracotta text-white flex items-center justify-center text-xs font-black shadow-sm">2</div>
                            <p className="text-sm font-bold text-oflem-charcoal">{userRole === 'provider' ? t('Configure your discovery radius (currently 5km).') : t('Wait for Providers to send you their offers.')}</p>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                    <Link href={selectedContent.route} className="block">
                        <PrimaryButton className="w-full py-5 btn-primary rounded-full text-sm">
                            {selectedContent.cta}
                        </PrimaryButton>
                    </Link>
                </div>

                {/* Welcome Message */}
                <div className="text-xs font-bold text-gray-muted flex items-center justify-center gap-2">
                    {t('Hello')} <span className="text-oflem-charcoal font-black">{user?.display_name || user?.name}</span>! <Hand size={16} className="text-oflem-terracotta" /> {t('Your profile is complete.')}
                </div>
            </div>
        </AuthSplitLayout>
    );
}
