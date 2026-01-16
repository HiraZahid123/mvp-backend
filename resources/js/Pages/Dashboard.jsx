import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MinimalAuthenticatedLayout from '@/Layouts/MinimalAuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import React from 'react';
import useTranslation from '@/Hooks/useTranslation';

export default function Dashboard({ tasks }) { // Receive tasks prop
    const { t } = useTranslation();
    const { auth, ziggy } = usePage().props;
    const user = auth.user;
    const urlParams = new URLSearchParams(window.location.search);
    const chatWith = urlParams.get('chat_with');
    const helperName = urlParams.get('helper_name');
    const missionId = urlParams.get('mission_id');
    const missionTitle = urlParams.get('mission_title');

    const getDashboardContent = () => {
        switch (user.role_type) {
            case 'customer':
                return (
                    <AuthenticatedLayout header={t('Dashboard')}>
                        <Head title={t('Dashboard')} />
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <CustomerDashboard user={user} tasks={tasks} t={t} />
                        </div>
                    </AuthenticatedLayout>
                );
            case 'performer':
                return (
                    <AuthenticatedLayout header={t('Dashboard')}>
                        <Head title={t('Dashboard')} />
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <PerformerDashboard user={user} t={t} />
                        </div>
                    </AuthenticatedLayout>
                );
            case 'both':
                return (
                     <AuthenticatedLayout header={t('Dashboard')}>
                        <Head title={t('Dashboard')} />
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <BothDashboard user={user} t={t} />
                        </div>
                    </AuthenticatedLayout>
                );
            default:
                return (
                     <AuthenticatedLayout header={t('Dashboard')}>
                        <Head title={t('Dashboard')} />
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <DefaultDashboard user={user} t={t} />
                        </div>
                    </AuthenticatedLayout>
                );
        }
    };

    return getDashboardContent();
}

function CustomerDashboard({ user, tasks, t }) {
    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="bg-gold-accent rounded-[32px] p-8 lg:p-12 text-primary-black relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">
                        {t('Need a hand')}, {user.name.split(' ')[0]}? 🤝
                    </h3>
                    <p className="text-primary-black/70 text-lg font-bold">
                        {t('Describe your mission and let our smart matching find the perfect helper for you.')}
                    </p>
                    <Link href={route('missions.search')} className="mt-8 bg-primary-black text-white font-black py-4 px-10 rounded-full hover:opacity-90 transition-all shadow-xl inline-block text-lg">
                        🚀 {t('Post a Mission')}
                    </Link>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white opacity-20 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            </div>

            {/* Recent Missions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-xl font-black text-primary-black uppercase tracking-tight">{t('Your Recent Missions')}</h4>
                    <Link href="/" className="text-xs font-black text-gold-accent uppercase tracking-widest hover:underline">{t('See all')}</Link>
                </div>
                
                {tasks && tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="bg-white border border-gray-border rounded-[28px] p-6 hover:shadow-lg transition-all border-b-4 border-b-gold-accent/30 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-cream-accent rounded-xl flex items-center justify-center text-xl">
                                        ✨
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-off-white-bg px-3 py-1 rounded-full text-gray-muted">
                                        {task.status || 'open'}
                                    </span>
                                </div>
                                <h5 className="font-black text-primary-black mb-2 line-clamp-1">{task.content}</h5>
                                <p className="text-sm text-gray-muted font-bold line-clamp-2 mb-6">
                                    {task.metadata?.summary || t('Awaiting AI analysis...')}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-border/50">
                                    <span className="text-[10px] font-black text-gray-muted/50 uppercase">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </span>
                                    <button className="text-gold-accent font-black text-xs group-hover:translate-x-1 transition-transform">
                                        {t('View Details')} →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-gray-border rounded-[32px] p-16 text-center">
                        <div className="w-16 h-16 bg-off-white-bg rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl">📝</span>
                        </div>
                        <p className="text-gray-muted font-bold mb-6">{t('You haven\'t posted any missions yet.')}</p>
                        <Link href={route('missions.create')} className="text-sm font-black text-primary-black underline hover:text-gold-accent transition-colors">
                            {t('Start by posting your first mission')}
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-border rounded-[32px] p-8 flex items-center gap-6 group hover:border-gold-accent transition-all">
                    <div className="w-16 h-16 bg-cream-accent rounded-2xl flex items-center justify-center text-2xl group-hover:bg-gold-accent transition-colors">🔍</div>
                    <div>
                        <h5 className="font-black text-primary-black mb-1">{t('How it works')}</h5>
                        <p className="text-sm text-gray-muted font-bold">{t('Learn how to get the most out of Oflem')}</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-border rounded-[32px] p-8 flex items-center gap-6 group hover:border-gold-accent transition-all">
                    <div className="w-16 h-16 bg-cream-accent rounded-2xl flex items-center justify-center text-2xl group-hover:bg-gold-accent transition-colors">🛡️</div>
                    <div>
                        <h5 className="font-black text-primary-black mb-1">{t('Trust & Safety')}</h5>
                        <p className="text-sm text-gray-muted font-bold">{t('Your security is our top priority')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PerformerDashboard({ user, t }) {
    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="bg-primary-black rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">
                        {t('Welcome back')}, {user.name.split(' ')[0]}! 💼
                    </h3>
                    <p className="text-gray-muted text-lg font-bold">
                        {t('Ready to showcase your talent and get more bookings? Your skills are in demand.')}
                    </p>
                    <button className="mt-8 bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 transition-all shadow-md">
                        {t('Check Requests')}
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            </div>

            {/* Performance Stats Overlay Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-border rounded-[24px] p-8 text-center shadow-sm hover:border-gold-accent transition-all">
                    <div className="text-4xl font-black text-primary-black mb-2">0</div>
                    <div className="text-sm text-gray-muted font-black uppercase tracking-widest px-3 py-1 bg-cream-accent inline-block rounded-full">{t('Bookings')}</div>
                </div>
                <div className="bg-white border border-gray-border rounded-[24px] p-8 text-center shadow-sm hover:border-gold-accent transition-all">
                    <div className="text-4xl font-black text-primary-black mb-2">0</div>
                    <div className="text-sm text-gray-muted font-black uppercase tracking-widest px-3 py-1 bg-cream-accent inline-block rounded-full">{t('Reviews')}</div>
                </div>
                <div className="bg-white border border-gray-border rounded-[24px] p-8 text-center shadow-sm hover:border-gold-accent transition-all">
                    <div className="text-4xl font-black text-primary-black mb-2">$0</div>
                    <div className="text-sm text-gray-muted font-black uppercase tracking-widest px-3 py-1 bg-cream-accent inline-block rounded-full">{t('Earnings')}</div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title={t('Update Profile')} subtitle={t('Showcase your skills')} icon={<LogoIcon />} />
                <DashboardCard title={t('Manage Schedule')} subtitle={t('View and edit bookings')} icon={<ScheduleIcon />} />
                <DashboardCard title={t('Payment Settings')} subtitle={t('Setup your payouts')} icon={<EarningsIcon />} />
            </div>
        </div>
    );
}

function BothDashboard({ user, t }) {
    return (
        <div className="space-y-10">
            {/* Split Welcome */}
            <div className="bg-gradient-to-br from-cream-accent to-white border border-gold-accent/20 rounded-[32px] p-8 lg:p-12 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-3xl lg:text-4xl font-black text-primary-black mb-4 leading-tight">
                            {t('Hi')} {user.name.split(' ')[0]}, {t('Dual Power!')} 🚀
                        </h3>
                        <p className="text-gray-muted text-lg font-bold">
                            {t('Manage your tasks and bookings all in one place. You\'re set for both worlds.')}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href={route('missions.search')} className="bg-primary-black text-white font-black py-3 px-6 rounded-full hover:opacity-90 transition-all text-sm shadow-md">{t('Post Task')}</Link>
                        <button className="bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 transition-all text-sm shadow-md">{t('Available Tasks')}</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-border rounded-[32px] p-8">
                    <h4 className="text-xl font-black text-primary-black mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center transition-colors group-hover:bg-gold-accent"><svg className="w-4 h-4 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
                        {t('As a Customer')}
                    </h4>
                    <div className="space-y-4">
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>{t('Find Performers')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>{t('Manage My Tasks')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-border rounded-[32px] p-8">
                    <h4 className="text-xl font-black text-primary-black mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center transition-colors group-hover:bg-gold-accent"><svg className="w-4 h-4 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                        {t('As a Performer')}
                    </h4>
                    <div className="space-y-4">
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>{t('Available Tasks')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>{t('My Earning Overview')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DefaultDashboard({ user, t }) {
    return (
        <div className="bg-white border border-gray-border rounded-[32px] p-12 text-center max-w-2xl mx-auto mt-20 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-3xl font-black text-primary-black mb-4">{t('Welcome to Oflem!')}</h3>
            <p className="text-gray-muted text-lg font-bold mb-8">{t('You\'re logged in as')} {user.name}. {t('Your account setup is complete.')}</p>
            <Link href="/" className="bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 inline-block shadow-md">
                {t('Get Started')}
            </Link>
        </div>
    );
}

/* Internal Components */
function DashboardCard({ title, subtitle, icon }) {
    return (
        <div className="bg-white border border-gray-border rounded-[24px] p-10 hover:shadow-xl hover:border-gold-accent transition-all group cursor-pointer">
            <div className="w-14 h-14 bg-cream-accent rounded-full flex items-center justify-center mb-6 text-gold-accent group-hover:bg-gold-accent group-hover:text-primary-black transition-colors shadow-sm">
                {icon}
            </div>
            <h5 className="text-lg font-black text-primary-black mb-1">{title}</h5>
            <p className="text-sm text-gray-muted font-bold">{subtitle}</p>
        </div>
    );
}

function LogoIcon() { return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function ScheduleIcon() { return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function EarningsIcon() { return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>; }
