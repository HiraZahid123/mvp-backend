import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import { AlertTriangle } from 'lucide-react';

// Dispute Button Component
function DisputeButton({ missionId, t }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        reason: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('missions.dispute', missionId), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="py-5 bg-red-600 text-white font-black rounded-full hover:bg-red-700 transition-all shadow-xl text-lg flex items-center justify-center gap-2"
            >
                <AlertTriangle size={20} /> {t('Open Dispute')}
            </button>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-oflem-charcoal mb-4">Open a Dispute</h2>
                    <p className="text-sm text-gray-muted font-medium mb-6">
                        Please explain why you're not satisfied with the work. An admin will review your case.
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="reason" value="Reason for Dispute" className="text-xs uppercase tracking-widest font-black mb-3" />
                            <textarea
                                id="reason"
                                className="w-full bg-oflem-cream border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-oflem-terracotta focus:ring-0 min-h-[150px]"
                                placeholder="Describe the issue in detail..."
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-200 text-oflem-charcoal font-black rounded-full hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                Submit Dispute
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}

export default DisputeButton;
