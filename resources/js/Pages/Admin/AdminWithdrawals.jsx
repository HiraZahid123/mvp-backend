import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { useForm, router } from '@inertiajs/react';

export default function AdminWithdrawals({ withdrawals, stats, currentStatus }) {
    // ... rest of the component ...
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    const approveForm = useForm({ admin_notes: '' });
    const rejectForm = useForm({ admin_notes: '' });
    const completeForm = useForm({ admin_notes: '' });

    const statusTabs = [
        { key: 'pending', label: 'Pending', count: stats.pending, color: 'yellow' },
        { key: 'approved', label: 'Approved', count: stats.approved, color: 'green' },
        { key: 'completed', label: 'Completed', count: stats.completed, color: 'blue' },
        { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'red' },
        { key: 'all', label: 'All', count: stats.pending + stats.approved + stats.completed + stats.rejected, color: 'gray' },
    ];

    const openModal = (withdrawal, action) => {
        setSelectedWithdrawal(withdrawal);
        setModalAction(action);
        setShowModal(true);
    };

    const handleApprove = () => {
        approveForm.post(`/admin/withdrawals/${selectedWithdrawal.id}/approve`, {
            onSuccess: () => {
                setShowModal(false);
                approveForm.reset();
            },
        });
    };

    const handleReject = () => {
        rejectForm.post(`/admin/withdrawals/${selectedWithdrawal.id}/reject`, {
            onSuccess: () => {
                setShowModal(false);
                rejectForm.reset();
            },
        });
    };

    const handleComplete = () => {
        completeForm.post(`/admin/withdrawals/${selectedWithdrawal.id}/complete`, {
            onSuccess: () => {
                setShowModal(false);
                completeForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header="Withdrawal Management"
            maxWidth="max-w-7xl"
            showFooter={true}
        >
            <div className="space-y-6">
                {/* ... rest of the content ... */}
                {/* Header Section (Remove if redundant with header prop) */}
                {/* Actually, it has h1 and p. I'll keep them for now but maybe wrap them. */}
                <div>
                    <h1 className="text-5xl font-black text-oflem-charcoal">Withdrawal Management</h1>
                    <p className="text-gray-600 mt-2">Review and process withdrawal requests</p>
                </div>

                {/* Status Tabs */}
                <div className="flex space-x-2 overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => router.get('/admin/withdrawals', { status: tab.key })}
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

                {/* Withdrawals Table */}
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
                                    <th className="px-6 py-4 text-left font-black">Amount</th>
                                    <th className="px-6 py-4 text-left font-black">Bank Details</th>
                                    <th className="px-6 py-4 text-left font-black">Status</th>
                                    <th className="px-6 py-4 text-left font-black">Date</th>
                                    <th className="px-6 py-4 text-left font-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.data.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold">{withdrawal.user.name}</p>
                                                <p className="text-sm text-gray-600">{withdrawal.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-2xl font-black text-oflem-terracotta">
                                                CHF {parseFloat(withdrawal.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold">{withdrawal.bank_details?.account_holder}</p>
                                                <p className="text-gray-600">{withdrawal.bank_details?.iban}</p>
                                                {withdrawal.bank_details?.bank_name && (
                                                    <p className="text-gray-500">{withdrawal.bank_details.bank_name}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                withdrawal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {withdrawal.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(withdrawal.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {withdrawal.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => openModal(withdrawal, 'approve')}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(withdrawal, 'reject')}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {withdrawal.status === 'approved' && (
                                                    <button
                                                        onClick={() => openModal(withdrawal, 'complete')}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                                    >
                                                        Mark Completed
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
                    {withdrawals.links && (
                        <div className="px-6 py-4 border-t flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Showing {withdrawals.from} to {withdrawals.to} of {withdrawals.total} results
                            </p>
                            <div className="flex space-x-2">
                                {withdrawals.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                            link.active
                                                ? 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white'
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

            {/* Action Modal */}
            {showModal && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4"
                    >
                        <h3 className="text-2xl font-black mb-4">
                            {modalAction === 'approve' && 'Approve Withdrawal'}
                            {modalAction === 'reject' && 'Reject Withdrawal'}
                            {modalAction === 'complete' && 'Mark as Completed'}
                        </h3>

                        <div className="mb-4 p-4 bg-gray-100 rounded-xl">
                            <p className="font-bold">{selectedWithdrawal.user.name}</p>
                            <p className="text-2xl font-black text-oflem-terracotta">
                                CHF {parseFloat(selectedWithdrawal.amount).toFixed(2)}
                            </p>
                        </div>

                        {modalAction === 'reject' ? (
                            <div className="mb-4">
                                <label className="block font-bold mb-2">Rejection Reason (Required)</label>
                                <textarea
                                    value={rejectForm.data.admin_notes}
                                    onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-oflem-terracotta outline-none"
                                    rows="4"
                                    placeholder="Explain why this withdrawal is being rejected..."
                                />
                                {rejectForm.errors.admin_notes && (
                                    <p className="text-red-600 text-sm mt-1">{rejectForm.errors.admin_notes}</p>
                                )}
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block font-bold mb-2">Admin Notes (Optional)</label>
                                <textarea
                                    value={modalAction === 'approve' ? approveForm.data.admin_notes : completeForm.data.admin_notes}
                                    onChange={(e) => {
                                        if (modalAction === 'approve') {
                                            approveForm.setData('admin_notes', e.target.value);
                                        } else {
                                            completeForm.setData('admin_notes', e.target.value);
                                        }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-oflem-terracotta outline-none"
                                    rows="3"
                                    placeholder="Add any notes..."
                                />
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    approveForm.reset();
                                    rejectForm.reset();
                                    completeForm.reset();
                                }}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (modalAction === 'approve') handleApprove();
                                    else if (modalAction === 'reject') handleReject();
                                    else handleComplete();
                                }}
                                disabled={
                                    (modalAction === 'approve' && approveForm.processing) ||
                                    (modalAction === 'reject' && (rejectForm.processing || !rejectForm.data.admin_notes)) ||
                                    (modalAction === 'complete' && completeForm.processing)
                                }
                                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                                    modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                    modalAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-blue-600 hover:bg-blue-700'
                                } text-white disabled:opacity-50`}
                            >
                                {modalAction === 'approve' && 'Approve'}
                                {modalAction === 'reject' && 'Reject'}
                                {modalAction === 'complete' && 'Mark Completed'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
