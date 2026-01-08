import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats, recentUsers }) {
    return (
        <AuthenticatedLayout header="Admin Control Center">
            <Head title="Admin Dashboard" />

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Users" 
                        value={stats.total_users} 
                        icon={<UsersIcon />}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <StatCard 
                        title="Customers" 
                        value={stats.customers} 
                        icon={<CustomerIcon />}
                        color="text-green-600"
                        bg="bg-green-50"
                    />
                    <StatCard 
                        title="Performers" 
                        value={stats.performers} 
                        icon={<PerformerIcon />}
                        color="text-purple-600"
                        bg="bg-purple-50"
                    />
                    <StatCard 
                        title="Admins" 
                        value={stats.admins} 
                        icon={<AdminIcon />}
                        color="text-red-600"
                        bg="bg-red-50"
                    />
                </div>

                {/* Recent Users Table */}
                <div className="bg-white border border-gray-border rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-gray-border flex justify-between items-center bg-white">
                        <h3 className="text-xl font-bold text-primary-black tracking-tight">Recent User Onboarding</h3>
                        <button className="text-sm font-bold text-gold-accent hover:underline">Manage All Users</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-off-white-bg">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-muted uppercase tracking-[0.2em]">Name & Email</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-muted uppercase tracking-[0.2em]">Role Type</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-gray-muted uppercase tracking-[0.2em]">Joined Date</th>
                                    <th className="px-8 py-4 text-right text-xs font-black text-gray-muted uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-cream-accent/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-primary-black">{user.name}</div>
                                            <div className="text-xs text-gray-muted font-medium">{user.email}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                                user.role_type === 'admin' ? 'bg-red-50 text-red-600' :
                                                user.role_type === 'performer' ? 'bg-purple-50 text-purple-600' :
                                                user.role_type === 'both' ? 'bg-green-50 text-green-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {user.role_type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-muted font-medium">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                                            <button className="text-gold-accent font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, icon, color, bg }) {
    return (
        <div className="bg-white border border-gray-border rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div className="text-3xl font-black text-primary-black tracking-tight">{value}</div>
            </div>
            <div className="text-xs font-black uppercase tracking-[0.15em] text-gray-muted">{title}</div>
        </div>
    );
}

function UsersIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>; }
function CustomerIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function PerformerIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>; }
function AdminIcon() { return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }

