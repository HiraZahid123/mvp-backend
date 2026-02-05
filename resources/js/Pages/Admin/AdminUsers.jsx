import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion } from 'framer-motion';
import { router, useForm } from '@inertiajs/react';

export default function AdminUsers({ users, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const suspendForm = useForm({ suspend: false, reason: '' });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/users', { search: searchTerm, role: filters.role });
    };

    const handleSuspend = (user, suspend) => {
        if (confirm(`Are you sure you want to ${suspend ? 'suspend' : 'unsuspend'} this user?`)) {
            suspendForm.setData({ suspend, reason: suspend ? 'Suspended by admin' : '' });
            suspendForm.post(`/admin/users/${user.id}/suspend`);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-5xl font-black text-oflem-charcoal">User Management</h1>
                    <p className="text-gray-600 mt-2">Manage platform users</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow">
                        <p className="text-sm font-bold text-gray-500">Total Users</p>
                        <p className="text-3xl font-black">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow">
                        <p className="text-sm font-bold text-gray-500">Customers</p>
                        <p className="text-3xl font-black text-blue-600">{stats.customers}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow">
                        <p className="text-sm font-bold text-gray-500">Performers</p>
                        <p className="text-3xl font-black text-green-600">{stats.performers}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow">
                        <p className="text-sm font-bold text-gray-500">Admins</p>
                        <p className="text-3xl font-black text-oflem-terracotta">{stats.admins}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <form onSubmit={handleSearch} className="flex space-x-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, username, or phone..."
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-oflem-terracotta outline-none"
                        />
                        <select
                            value={filters.role}
                            onChange={(e) => router.get('/admin/users', { search: searchTerm, role: e.target.value })}
                            className="px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-oflem-terracotta outline-none"
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="performer">Performer</option>
                            <option value="both">Both</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-oflem-terracotta hover:bg-opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-all"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-oflem-charcoal text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-black">User</th>
                                    <th className="px-6 py-4 text-left font-black">Role</th>
                                    <th className="px-6 py-4 text-left font-black">Missions</th>
                                    <th className="px-6 py-4 text-left font-black">Balance</th>
                                    <th className="px-6 py-4 text-left font-black">Joined</th>
                                    <th className="px-6 py-4 text-left font-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                {user.username && (
                                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-oflem-terracotta text-white">
                                                {user.role_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p>Created: {user.missions_created_count || 0}</p>
                                                <p>Assigned: {user.missions_assigned_count || 0}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-green-600">
                                                CHF {parseFloat(user.balance || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {user.chat_suspended_until ? (
                                                    <button
                                                        onClick={() => handleSuspend(user, false)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                                    >
                                                        Unsuspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSuspend(user, true)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links && (
                        <div className="px-6 py-4 border-t flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Showing {users.from} to {users.to} of {users.total} results
                            </p>
                            <div className="flex space-x-2">
                                {users.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                            link.active
                                                ? 'bg-oflem-terracotta text-white'
                                                : link.url
                                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AdminLayout>
    );
}
