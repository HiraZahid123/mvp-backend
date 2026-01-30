import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, Filter, MapPin, DollarSign, Calendar, Eye, Trash2, CheckCircle } from 'lucide-react';

export default function MissionsIndex({ missions, filters }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.missions.index'), {
            search: searchTerm,
            status: statusFilter
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDeleteMission = (missionId) => {
        if (confirm(t('Are you sure you want to delete this mission?'))) {
            router.delete(route('admin.missions.destroy', missionId), {
                preserveScroll: true,
                onSuccess: () => alert(t('Mission deleted successfully'))
            });
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            OUVERTE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open' },
            EN_NEGOCIATION: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Negotiating' },
            VERROUILLEE: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Locked' },
            EN_COURS: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'In Progress' },
            EN_VALIDATION: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Validating' },
            TERMINEE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            ANNULEE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
            EN_LITIGE: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Disputed' }
        };
        const badge = badges[status] || badges.OUVERTE;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                {t(badge.label)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Mission Management')} />

            <div className="max-w-7xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-oflem-charcoal mb-2">
                                {t('Mission Management')}
                            </h1>
                            <p className="text-gray-muted font-bold">
                                {t('Monitor and manage all platform missions')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-oflem-cream rounded-full">
                            <CheckCircle className="w-5 h-5 text-oflem-terracotta" />
                            <span className="text-sm font-black text-oflem-charcoal">
                                {missions.total} {t('Missions')}
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
                                    placeholder={t('Search by title, location, or user...')}
                                    className="w-full pl-12 pr-4 py-3 bg-oflem-cream border-0 rounded-2xl font-medium focus:ring-2 focus:ring-oflem-terracotta/20"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-oflem-cream border-0 rounded-2xl font-bold focus:ring-2 focus:ring-oflem-terracotta/20"
                            >
                                <option value="">{t('All Statuses')}</option>
                                <option value="OUVERTE">{t('Open')}</option>
                                <option value="EN_COURS">{t('In Progress')}</option>
                                <option value="TERMINEE">{t('Completed')}</option>
                                <option value="ANNULEE">{t('Cancelled')}</option>
                                <option value="EN_LITIGE">{t('Disputed')}</option>
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

                {/* Missions Grid */}
                <div className="grid gap-6">
                    {missions.data.map((mission) => (
                        <div key={mission.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Mission Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {getStatusBadge(mission.status)}
                                                <span className="text-xs font-bold text-gray-muted">
                                                    ID: #{mission.id}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-oflem-charcoal mb-2">
                                                {mission.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-4">
                                                {mission.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-oflem-terracotta" />
                                            <div>
                                                <p className="text-xs font-black text-gray-muted uppercase">Location</p>
                                                <p className="text-sm font-bold text-oflem-charcoal">{mission.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-oflem-terracotta" />
                                            <div>
                                                <p className="text-xs font-black text-gray-muted uppercase">Budget</p>
                                                <p className="text-sm font-bold text-oflem-charcoal">CHF {mission.budget}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-oflem-terracotta" />
                                            <div>
                                                <p className="text-xs font-black text-gray-muted uppercase">Created</p>
                                                <p className="text-sm font-bold text-oflem-charcoal">
                                                    {new Date(mission.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-muted uppercase">Customer</p>
                                            <p className="text-sm font-bold text-oflem-charcoal">{mission.user?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex lg:flex-col items-center gap-3 lg:border-l lg:pl-6 border-gray-100">
                                    <Link
                                        href={route('admin.missions.show', mission.id)}
                                        className="flex-1 lg:flex-none px-6 py-3 bg-oflem-cream text-oflem-charcoal rounded-xl font-bold text-sm hover:bg-oflem-terracotta hover:text-white transition-colors text-center"
                                    >
                                        <Eye className="w-4 h-4 inline mr-2" />
                                        {t('View')}
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteMission(mission.id)}
                                        className="flex-1 lg:flex-none px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 inline mr-2" />
                                        {t('Delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {missions.links.length > 3 && (
                    <div className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-600">
                                {t('Showing')} {missions.from} {t('to')} {missions.to} {t('of')} {missions.total} {t('missions')}
                            </div>
                            <div className="flex gap-2">
                                {missions.links.map((link, index) => (
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

                {/* Empty State */}
                {missions.data.length === 0 && (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
                        <div className="text-6xl mb-6">🎯</div>
                        <h3 className="text-2xl font-black text-oflem-charcoal mb-4">
                            {t('No missions found')}
                        </h3>
                        <p className="text-gray-muted font-medium mb-8">
                            {t('Try adjusting your search or filters')}
                        </p>
                        <button
                            onClick={() => router.get(route('admin.missions.index'))}
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
