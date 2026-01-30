import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, Filter, UserCheck, UserX, Shield, Mail, Calendar, ChevronRight } from 'lucide-react';

export default function UsersIndex({ users, filters }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role_type || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            search: searchTerm,
            role_type: roleFilter
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleBanUser = (userId) => {
        if (confirm(t('Are you sure you want to ban this user?'))) {
            router.post(route('admin.users.ban', userId), {}, {
                preserveScroll: true,
                onSuccess: () => alert(t('User banned successfully'))
            });
        }
    };

    const getRoleBadge = (roleType) => {
        const badges = {
            customer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Flemmard' },
            performer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Motivé' },
            both: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Both' }
        };
        const badge = badges[roleType] || badges.customer;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('User Management')} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                                {t('User Management')}
                            </h1>
                            <p className="text-gray-muted font-bold">
                                {t('Manage all platform users')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-oflem-cream rounded-full">
                            <UserCheck className="w-5 h-5 text-oflem-terracotta" />
                            <span className="text-sm font-black text-oflem-charcoal">
                                {users.total} {t('Users')}
                            </span>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <form onSubmit={handleSearch} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('Search by name or email...')}
                                    className="w-full pl-12 pr-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-bold focus:ring-2 focus:ring-oflem-terracotta/20"
                            >
                                <option value="">{t('All Roles')}</option>
                                <option value="customer">{t('Flemmard')}</option>
                                <option value="performer">{t('Motivé')}</option>
                                <option value="both">{t('Both')}</option>
                            </select>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-oflem-terracotta text-white rounded-2xl font-black hover:bg-oflem-terracotta/90 transition-colors"
                            >
                                <Filter className="w-5 h-5 inline mr-2" />
                                {t('Filter')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-oflem-cream border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        {t('User')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        {t('Role')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        {t('Status')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-muted">
                                        {t('Joined')}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-gray-muted">
                                        {t('Actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-oflem-cream/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-oflem-terracotta/10 rounded-full flex items-center justify-center font-black text-oflem-terracotta">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-black text-oflem-charcoal">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-muted font-medium flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role_type)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.chat_suspended_until && new Date(user.chat_suspended_until) > new Date() ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">
                                                    {t('Suspended')}
                                                </span>
                                            ) : user.email_verified_at ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-green-700">
                                                    {t('Active')}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-100 text-yellow-700">
                                                    {t('Unverified')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.users.show', user.id)}
                                                    className="px-4 py-2 bg-oflem-cream text-oflem-charcoal rounded-xl font-bold text-sm hover:bg-oflem-terracotta hover:text-white transition-colors"
                                                >
                                                    {t('View')}
                                                </Link>
                                                {!user.chat_suspended_until || new Date(user.chat_suspended_until) < new Date() ? (
                                                    <button
                                                        onClick={() => handleBanUser(user.id)}
                                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
                                                    >
                                                        <UserX className="w-4 h-4 inline mr-1" />
                                                        {t('Ban')}
                                                    </button>
                                                ) : (
                                                    <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed">
                                                        {t('Banned')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="px-6 py-4 bg-oflem-cream/50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-600">
                                    {t('Showing')} {users.from} {t('to')} {users.to} {t('of')} {users.total} {t('users')}
                                </div>
                                <div className="flex gap-2">
                                    {users.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                                                link.active
                                                    ? 'bg-oflem-terracotta text-white'
                                                    : link.url
                                                    ? 'bg-white text-oflem-charcoal hover:bg-oflem-cream'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {users.data.length === 0 && (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
                        <div className="text-6xl mb-6">👥</div>
                        <h3 className="text-2xl font-black text-oflem-charcoal mb-4">
                            {t('No users found')}
                        </h3>
                        <p className="text-gray-muted font-medium mb-8">
                            {t('Try adjusting your search or filters')}
                        </p>
                        <button
                            onClick={() => router.get(route('admin.users.index'))}
                            className="px-8 py-4 bg-oflem-terracotta text-white rounded-full font-black hover:bg-oflem-terracotta/90 transition-colors"
                        >
                            {t('Clear Filters')}
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
