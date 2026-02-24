import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Users, ClipboardList, Clock, ArrowUpRight, ArrowRight } from 'lucide-react';

export default function AdminDashboard({ stats, recentWithdrawals, recentUsers }) {
    const StatCard = ({ title, value, subtitle, icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-3xl p-6 shadow-lg border-l-4 ${color}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                    <h3 className="text-4xl font-black mt-2">{value}</h3>
                    {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                    {icon}
                </div>
            </div>
        </motion.div>
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-5xl font-black text-oflem-charcoal">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Platform overview and statistics</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={stats.users.total}
                        subtitle={`${stats.users.newThisMonth} new this month`}
                        icon={<Users size={24} />}
                        color="border-blue-500"
                    />
                    <StatCard
                        title="Total Missions"
                        value={stats.missions.total}
                        subtitle={`${stats.missions.open} open`}
                        icon={<ClipboardList size={24} />}
                        color="border-green-500"
                    />
                    <StatCard
                        title="Pending Withdrawals"
                        value={stats.withdrawals.pending}
                        subtitle={`CHF ${parseFloat(stats.withdrawals.pendingAmount).toFixed(2)}`}
                        icon={<Clock size={24} />}
                        color="border-yellow-500"
                    />
                    <StatCard
                        title="Total Withdrawn"
                        value={`CHF ${parseFloat(stats.withdrawals.totalWithdrawn).toFixed(0)}`}
                        subtitle={`${stats.withdrawals.pending} pending requests`}
                        icon={<ArrowUpRight size={24} />}
                        color="border-oflem-terracotta"
                    />
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-lg"
                    >
                        <h3 className="text-2xl font-black mb-4">User Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Clients</span>
                                <span className="text-2xl font-black text-blue-600">{stats.users.clients}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Providers</span>
                                <span className="text-2xl font-black text-green-600">{stats.users.providers}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mission Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-lg"
                    >
                        <h3 className="text-2xl font-black mb-4">Mission Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Open</span>
                                <span className="text-2xl font-black text-green-600">{stats.missions.open}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">In Progress</span>
                                <span className="text-2xl font-black text-yellow-600">{stats.missions.inProgress}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Completed</span>
                                <span className="text-2xl font-black text-blue-600">{stats.missions.completed}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Withdrawals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-lg"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-black">Recent Withdrawals</h3>
                            <Link href="/admin/withdrawals" className="text-oflem-terracotta font-bold hover:underline">
                                View All <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentWithdrawals.map((withdrawal) => (
                                <div key={withdrawal.id} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <p className="font-bold">{withdrawal.user.name}</p>
                                        <p className="text-sm text-gray-600">{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg">CHF {parseFloat(withdrawal.amount).toFixed(2)}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            withdrawal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {withdrawal.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-lg"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-black">Recent Users</h3>
                            <Link href="/admin/users" className="text-oflem-terracotta font-bold hover:underline">
                                View All <ArrowRight size={14} className="inline ml-1" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <p className="font-bold">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white">
                                        {user.role_type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
