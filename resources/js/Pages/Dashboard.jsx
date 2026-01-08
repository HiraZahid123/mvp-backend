import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import React from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    const getDashboardContent = () => {
        switch (user.role_type) {
            case 'customer':
                return <CustomerDashboard user={user} />;
            case 'performer':
                return <PerformerDashboard user={user} />;
            case 'both':
                return <BothDashboard user={user} />;
            default:
                return <DefaultDashboard user={user} />;
        }
    };

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {getDashboardContent()}
            </div>
        </AuthenticatedLayout>
    );
}

function CustomerDashboard({ user }) {
    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="bg-cream-accent rounded-[32px] p-8 lg:p-12 border border-gold-accent/20 relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-3xl lg:text-4xl font-black text-primary-black mb-4 leading-tight">
                        Hello, {user.name.split(' ')[0]}! 👋
                    </h3>
                    <p className="text-gray-muted text-lg font-bold">
                        Ready to find amazing performers in your area? Let's get things done today.
                    </p>
                    <button className="mt-8 bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 transition-all shadow-md">
                        Find a Motive
                    </button>
                </div>
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gold-accent opacity-10 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard 
                    title="Find Performers" 
                    subtitle="Discover talent in your area"
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                />
                <DashboardCard 
                    title="Book Events" 
                    subtitle="Schedule performances"
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <DashboardCard 
                    title="View Analytics" 
                    subtitle="Track your bookings"
                    icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-border rounded-[32px] p-8">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-black text-primary-black">Recent Activity</h4>
                    <button className="text-sm font-black text-gold-accent hover:underline">View All</button>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-off-white-bg rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-gray-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-muted font-bold">No recent activity yet. Start by finding performers!</p>
                </div>
            </div>
        </div>
    );
}

function PerformerDashboard({ user }) {
    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="bg-primary-black rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">
                        Welcome back, {user.name.split(' ')[0]}! 💼
                    </h3>
                    <p className="text-gray-muted text-lg font-bold">
                        Ready to showcase your talent and get more bookings? Your skills are in demand.
                    </p>
                    <button className="mt-8 bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 transition-all shadow-md">
                        Check Requests
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            </div>

            {/* Performance Stats Overlay Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-border rounded-[24px] p-8 text-center shadow-sm hover:border-gold-accent transition-all">
                    <div className="text-4xl font-black text-primary-black mb-2">0</div>
                    <div className="text-sm text-gray-muted font-black uppercase tracking-widest px-3 py-1 bg-cream-accent inline-block rounded-full">Bookings</div>
                </div>
                <div className="bg-white border border-gray-border rounded-[24px] p-8 text-center shadow-sm hover:border-gold-accent transition-all">
                    <div className="text-4xl font-black text-primary-black mb-2">0</div>
                    <div className="text-sm text-gray-muted font-black uppercase tracking-widest px-3 py-1 bg-cream-accent inline-block rounded-full">Reviews</div>
                </div>
                <div className="bg-white border border-gray-border rounded-[24px] p-8 text-center shadow-sm hover:border-gold-accent transition-all">
                    <div className="text-4xl font-black text-primary-black mb-2">$0</div>
                    <div className="text-sm text-gray-muted font-black uppercase tracking-widest px-3 py-1 bg-cream-accent inline-block rounded-full">Earnings</div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Update Profile" subtitle="Showcase your skills" icon={<LogoIcon />} />
                <DashboardCard title="Manage Schedule" subtitle="View and edit bookings" icon={<ScheduleIcon />} />
                <DashboardCard title="Payment Settings" subtitle="Setup your payouts" icon={<EarningsIcon />} />
            </div>
        </div>
    );
}

function BothDashboard({ user }) {
    return (
        <div className="space-y-10">
            {/* Split Welcome */}
            <div className="bg-gradient-to-br from-cream-accent to-white border border-gold-accent/20 rounded-[32px] p-8 lg:p-12 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-3xl lg:text-4xl font-black text-primary-black mb-4 leading-tight">
                            Hi {user.name.split(' ')[0]}, Dual Power! 🚀
                        </h3>
                        <p className="text-gray-muted text-lg font-bold">
                            Manage your tasks and bookings all in one place. You're set for both worlds.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-primary-black text-white font-black py-3 px-6 rounded-full hover:opacity-90 transition-all text-sm shadow-md">Post Task</button>
                        <button className="bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 transition-all text-sm shadow-md">Available Tasks</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-border rounded-[32px] p-8">
                    <h4 className="text-xl font-black text-primary-black mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center transition-colors group-hover:bg-gold-accent"><svg className="w-4 h-4 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
                        As a Customer
                    </h4>
                    <div className="space-y-4">
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>Find Performers</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>Manage My Tasks</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-border rounded-[32px] p-8">
                    <h4 className="text-xl font-black text-primary-black mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cream-accent flex items-center justify-center transition-colors group-hover:bg-gold-accent"><svg className="w-4 h-4 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                        As a Performer
                    </h4>
                    <div className="space-y-4">
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>Available Tasks</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <div className="p-4 bg-off-white-bg rounded-[20px] font-black text-sm text-primary-black flex justify-between items-center hover:bg-cream-accent cursor-pointer transition-colors border border-transparent hover:border-gold-accent/20">
                            <span>My Earning Overview</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DefaultDashboard({ user }) {
    return (
        <div className="bg-white border border-gray-border rounded-[32px] p-12 text-center max-w-2xl mx-auto mt-20 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-3xl font-black text-primary-black mb-4">Welcome to Oflem!</h3>
            <p className="text-gray-muted text-lg font-bold mb-8">You're logged in as {user.name}. Your account setup is complete.</p>
            <Link href="/" className="bg-gold-accent text-primary-black font-black py-3 px-8 rounded-full hover:opacity-90 inline-block shadow-md">
                Get Started
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
