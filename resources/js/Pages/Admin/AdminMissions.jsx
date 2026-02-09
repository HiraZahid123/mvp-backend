import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';

export default function AdminMissions({ missions, stats, currentStatus }) {
    const statusTabs = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'ouverte', label: 'Open', count: stats.open },
        { key: 'en_cours', label: 'In Progress', count: stats.inProgress },
        { key: 'terminee', label: 'Completed', count: stats.completed },
    ];

    return (
        <AuthenticatedLayout
            header="Mission Oversight"
            maxWidth="max-w-7xl"
            showFooter={true}
        >
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-5xl font-black text-oflem-charcoal">Mission Oversight</h1>
                    <p className="text-gray-600 mt-2">Monitor all platform missions</p>
                </div>

                {/* Status Tabs */}
                <div className="flex space-x-2 overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => router.get('/admin/missions', { status: tab.key })}
                            className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                                currentStatus === tab.key
                                    ? 'bg-oflem-charcoal text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Missions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-oflem-charcoal text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-black">Title</th>
                                    <th className="px-6 py-4 text-left font-black">Client</th>
                                    <th className="px-6 py-4 text-left font-black">Performer</th>
                                    <th className="px-6 py-4 text-left font-black">Budget</th>
                                    <th className="px-6 py-4 text-left font-black">Status</th>
                                    <th className="px-6 py-4 text-left font-black">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {missions.data.map((mission) => (
                                    <tr key={mission.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{mission.title}</p>
                                            <p className="text-sm text-gray-600 line-clamp-1">{mission.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold">{mission.user?.name}</p>
                                                <p className="text-sm text-gray-600">{mission.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {mission.assigned_user ? (
                                                <div>
                                                    <p className="font-bold">{mission.assigned_user.name}</p>
                                                    <p className="text-sm text-gray-600">{mission.assigned_user.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-oflem-terracotta">
                                                CHF {parseFloat(mission.budget).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                mission.status === 'ouverte' ? 'bg-green-100 text-green-800' :
                                                mission.status === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                                                mission.status === 'terminee' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {mission.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(mission.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {missions.links && (
                        <div className="px-6 py-4 border-t flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Showing {missions.from} to {missions.to} of {missions.total} results
                            </p>
                            <div className="flex space-x-2">
                                {missions.links.map((link, index) => (
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
        </AuthenticatedLayout>
    );
}
