import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import DisputeButton from '@/Components/DisputeButton';
import axios from 'axios';
import PaymentModal from '@/Components/Payments/PaymentModal';

export default function Details({ mission, canSeeAddress }) {
    const { t } = useTranslation();
    const { auth, flash } = usePage().props;
    const isOwner = auth.user.id === mission.user_id;
    const isAssigned = auth.user.id === mission.assigned_user_id;

    // Payment state
    const [clientSecret, setClientSecret] = useState(flash?.stripe_client_secret || null);
    const [showPaymentModal, setShowPaymentModal] = useState(!!clientSecret);

    // Watch for flashed client secret (from accept/select offer)
    useEffect(() => {
        if (flash?.stripe_client_secret) {
            setClientSecret(flash.stripe_client_secret);
            setShowPaymentModal(true);
        }
    }, [flash]);


    // Real-time updates
    useEffect(() => {
        window.Echo.private(`mission.${mission.id}`)
            .listen('QuestionPosted', (e) => {
                router.reload({ only: ['mission'] });
            })
            .listen('AnswerPosted', (e) => {
                router.reload({ only: ['mission'] });
            })
            .listen('MissionStatusUpdated', (e) => {
                router.reload({ only: ['mission'] });
            });

        return () => {
            window.Echo.leave(`mission.${mission.id}`);
        };
    }, [mission.id]);

    // Offer Form
    const offerForm = useForm({
        amount: '',
        message: '',
    });

    // Question Form
    const questionForm = useForm({
        question: '',
    });

    const submitOffer = (e) => {
        e.preventDefault();
        offerForm.post(route('missions.submit-offer', mission.id), {
            onSuccess: (page) => {
                offerForm.reset();
                if (page.props.flash?.stripe_client_secret) {
                    setClientSecret(page.props.flash.stripe_client_secret);
                    setShowPaymentModal(true);
                }
            },
        });
    };

    const submitQuestion = (e) => {
        e.preventDefault();
        questionForm.post(route('missions.ask-question', mission.id), {
            onSuccess: () => questionForm.reset(),
        });
    };

    const acceptMission = () => {
        router.post(route('missions.accept', mission.id), {}, {
            onSuccess: (page) => {
                if (page.props.flash?.stripe_client_secret) {
                    setClientSecret(page.props.flash.stripe_client_secret);
                    setShowPaymentModal(true);
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-oflem-cream font-sans">
            <Head title={mission.title} />
            <Header />

            <main className="max-w-6xl mx-auto py-16 px-6">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Mission Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                            <div className="flex flex-wrap items-center gap-3 mb-8">
                                <span className="px-4 py-1.5 bg-cream-accent text-primary-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {t(mission.category || 'General')}
                                </span>
                                {mission.status === 'OUVERTE' ? (
                                    <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        🟢 {t('Open')}
                                    </span>
                                ) : mission.status === 'EN_NEGOCIATION' || mission.status === 'VERROUILLEE' ? (
                                    <span className="px-4 py-1.5 bg-gold-accent text-primary-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                        ✅ {t('Assigned')}
                                    </span>
                                ) : mission.status === 'EN_COURS' ? (
                                    <span className="px-4 py-1.5 bg-yellow-400/20 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        ⏳ {t('In Progress')}
                                    </span>
                                ) : mission.status === 'EN_VALIDATION' ? (
                                    <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        ✅ {t('In Validation')}
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {t(mission.status)}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl font-black text-primary-black mb-6">{mission.title}</h1>
                            
                            <div className="prose prose-sm max-w-none text-gray-muted font-medium mb-12 leading-relaxed">
                                {mission.description.split('\n').map((para, i) => (
                                    <p key={i} className="mb-4">{para}</p>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-border">
                                <div className="space-y-6">
                                    <DetailItem icon="💰" label={t('Budget')} value={mission.budget ? `CHF ${mission.budget}` : t('Open for offers')} />
                                    <DetailItem icon="📅" label={t('Requested Date')} value={mission.date_time ? new Date(mission.date_time).toLocaleString() : t('Flexible')} />
                                </div>
                                <div className="space-y-6">
                                    <DetailItem 
                                        icon="📍" 
                                        label={t('Location')} 
                                        value={canSeeAddress ? (mission.exact_address || mission.location) : mission.location || t('Approximate location')} 
                                        subValue={!canSeeAddress && t('Exact address revealed after assignment')}
                                    />
                                    <DetailItem icon="👤" label={t('Posted by')} value={mission.user.name} />
                                </div>
                            </div>
                        </section>

                        {/* Questions Section */}
                        <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                            <h2 className="text-2xl font-black text-primary-black mb-8">💬 {t('Questions & Answers')}</h2>
                            
                            <div className="space-y-8 mb-10">
                                {mission.questions.length > 0 ? mission.questions.map((q) => (
                                    <div key={q.id} className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-oflem-cream flex items-center justify-center font-black">
                                                {q.user.name.charAt(0)}
                                            </div>
                                            <div className="bg-oflem-cream p-5 rounded-[24px] flex-1">
                                                <p className="text-sm font-bold text-primary-black mb-1">{q.user.name}</p>
                                                <p className="text-sm text-gray-muted font-medium">{q.question}</p>
                                            </div>
                                        </div>
                                        {q.answer ? (
                                            <div className="flex gap-4 ml-12">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cream-accent flex items-center justify-center font-black">
                                                    {mission.user.name.charAt(0)}
                                                </div>
                                                <div className="bg-cream-accent p-5 rounded-[24px] flex-1 border border-gold-accent/20">
                                                    <p className="text-sm font-bold text-primary-black mb-1">{mission.user.name} <span className="text-[10px] uppercase text-gold-accent ml-2">{t('Creator')}</span></p>
                                                    <p className="text-sm text-gray-muted font-medium">{q.answer}</p>
                                                </div>
                                            </div>
                                        ) : isOwner && (
                                            <AnswerForm missionId={mission.id} questionId={q.id} t={t} />
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-gray-muted font-bold text-center py-4">{t('No questions yet.')}</p>
                                )}
                            </div>

                            {!isOwner && mission.status === 'OUVERTE' && (
                                <form onSubmit={submitQuestion} className="space-y-4">
                                    <InputLabel htmlFor="question" value={t('Ask a question')} className="text-xs uppercase tracking-widest font-black" />
                                    <textarea
                                        id="question"
                                        className="w-full bg-oflem-cream border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[100px]"
                                        placeholder={t('Ask for more details about the mission...')}
                                        value={questionForm.data.question}
                                        onChange={e => questionForm.setData('question', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={questionForm.processing}
                                        className="px-8 py-3 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all text-sm disabled:opacity-50"
                                    >
                                        {t('Post Question')}
                                    </button>
                                </form>
                            )}
                        </section>

                        {/* Validation Section - Only shown when mission is EN_VALIDATION */}
                        {mission.status === 'EN_VALIDATION' && isOwner && (
                            <section className="bg-gradient-to-br from-gold-accent/10 to-cream-accent rounded-[40px] p-8 md:p-12 shadow-lg border-2 border-gold-accent">
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">⏳</div>
                                    <h2 className="text-3xl font-black text-primary-black mb-2">Validation Required</h2>
                                    <p className="text-sm text-gray-muted font-bold">
                                        The performer has submitted their work. Please review and validate or dispute.
                                    </p>
                                </div>

                                {/* Proof of Completion */}
                                {mission.completion_proof_path && (
                                    <div className="mb-8 bg-white rounded-[24px] p-6">
                                        <h3 className="text-lg font-black text-primary-black mb-4">📸 Proof of Completion</h3>
                                        <img 
                                            src={`/storage/${mission.completion_proof_path}`} 
                                            alt="Completion Proof" 
                                            className="w-full rounded-[16px] mb-4 shadow-md"
                                        />
                                        {mission.completion_notes && (
                                            <div className="bg-oflem-cream rounded-[16px] p-4">
                                                <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-2">Notes from Performer</p>
                                                <p className="text-sm text-primary-black font-medium">{mission.completion_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to validate this mission? Payment will be released to the performer.')) {
                                                router.post(route('missions.validate', mission.id));
                                            }
                                        }}
                                        className="py-5 bg-green-600 text-white font-black rounded-full hover:bg-green-700 transition-all shadow-xl text-lg flex items-center justify-center gap-2"
                                    >
                                        ✅ {t('Validate & Release Payment')}
                                    </button>
                                    <DisputeButton missionId={mission.id} t={t} />
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={async () => {
                                            const response = await axios.get(route('api.missions.chat', mission.id));
                                            router.visit(route('messages', { chat_id: response.data.id }));
                                        }}
                                        className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-oflem-charcoal transition-all flex items-center justify-center gap-2"
                                    >
                                        💬 {t('Message Performer')}
                                    </button>
                                </div>

                                {/* Auto-complete countdown */}
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-muted font-bold">
                                        ⚠️ Auto-validates in 72 hours if no action is taken
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Proof Upload Section - For Performers when work is in progress */}
                        {mission.status === 'EN_COURS' && isAssigned && (
                            <section className="bg-gradient-to-br from-green-50 to-green-100 rounded-[40px] p-8 md:p-12 shadow-lg border-2 border-green-400">
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">📸</div>
                                    <h2 className="text-3xl font-black text-primary-black mb-2">Submit Proof of Completion</h2>
                                    <p className="text-sm text-gray-muted font-bold">
                                        Upload a photo and notes to show the customer you've completed the mission.
                                    </p>
                                </div>

                                <ProofUploadForm missionId={mission.id} t={t} />
                            </section>
                        )}

                        {/* Performer View - Waiting for Validation */}
                        {mission.status === 'EN_VALIDATION' && isAssigned && (
                            <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[40px] p-8 md:p-12 shadow-lg border-2 border-blue-300">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">⏳</div>
                                    <h2 className="text-3xl font-black text-primary-black mb-2">Awaiting Validation</h2>
                                    <p className="text-sm text-gray-muted font-bold mb-6">
                                        The customer is reviewing your work. You'll be notified once they validate.
                                    </p>
                                    {mission.completion_proof_path && (
                                        <div className="bg-white rounded-[24px] p-6 text-left">
                                            <h3 className="text-lg font-black text-primary-black mb-4">Your Submission</h3>
                                            <img 
                                                src={`/storage/${mission.completion_proof_path}`} 
                                                alt="Your Proof" 
                                                className="w-full rounded-[16px] mb-4 shadow-md"
                                            />
                                            {mission.completion_notes && (
                                                <p className="text-sm text-gray-muted font-medium italic">"{mission.completion_notes}"</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                        {/* Right Column: Actions / Offers */}
                        <div className="space-y-8">
                            {/* Mission Status / Specific Actions Section */}
                            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border sticky top-8">
                                {mission.status === 'EN_NEGOCIATION' ? (
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">🤝</div>
                                        <h2 className="text-xl font-black text-primary-black mb-2">{t('Negotiation Phase')}</h2>
                                        <p className="text-sm text-gray-muted font-bold mb-6">
                                            {isOwner 
                                                ? t('You have selected a performer. Confirm to reveal your address and move forward.') 
                                                : isAssigned 
                                                    ? t('Waiting for creators final confirmation...') 
                                                    : t('This mission is currently in negotiation.')
                                            }
                                        </p>
                                        {isOwner && (
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => router.post(route('missions.confirm-assignment', mission.id))}
                                                    className="w-full py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-xl"
                                                >
                                                    ✅ {t('Confirm Assignment')}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const response = await axios.get(route('api.missions.chat', mission.id));
                                                        router.visit(route('messages', { chat_id: response.data.id }));
                                                    }}
                                                    className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-oflem-charcoal transition-all flex items-center justify-center gap-2"
                                                >
                                                    💬 {t('Message Performer')}
                                                </button>
                                            </div>
                                        )}
                                        {isAssigned && mission.assigned_user_id && (
                                            <button
                                                onClick={async () => {
                                                    const response = await axios.get(route('api.missions.chat', mission.id));
                                                    router.visit(route('messages', { chat_id: response.data.id }));
                                                }}
                                                className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all flex items-center justify-center gap-2"
                                            >
                                                💬 {t('Message Creator')}
                                            </button>
                                        )}
                                    </div>
                                ) : mission.status === 'VERROUILLEE' ? (
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">🎉</div>
                                        <h2 className="text-xl font-black text-primary-black mb-2">
                                            {isAssigned ? t('Mission Assigned to You!') : t('Mission Booked')}
                                        </h2>
                                        <p className="text-sm text-gray-muted font-bold mb-6">
                                            {isAssigned 
                                                ? t('You can now see the exact address and start the mission.') 
                                                : t('This mission has already been assigned.')
                                            }
                                        </p>
                                        {isAssigned && (
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => router.post(route('missions.start-work', mission.id))}
                                                    className="w-full py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-xl"
                                                >
                                                    🔨 {t('Start Work Now')}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const response = await axios.get(route('api.missions.chat', mission.id));
                                                        router.visit(route('messages', { chat_id: response.data.id }));
                                                    }}
                                                    className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-oflem-charcoal transition-all flex items-center justify-center gap-2"
                                                >
                                                    💬 {t('Message Creator')}
                                                </button>
                                            </div>
                                        )}
                                        {isOwner && (
                                            <button
                                                onClick={async () => {
                                                    const response = await axios.get(route('api.missions.chat', mission.id));
                                                    router.visit(route('messages', { chat_id: response.data.id }));
                                                }}
                                                className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-oflem-charcoal transition-all flex items-center justify-center gap-2"
                                            >
                                                💬 {t('Message Performer')}
                                            </button>
                                        )}
                                    </div>
                                ) : mission.status === 'EN_COURS' ? (
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">🚀</div>
                                        <h2 className="text-xl font-black text-primary-black mb-2">{t('Work In Progress')}</h2>
                                        <p className="text-sm text-gray-muted font-bold mb-6">
                                            {isAssigned ? t('Finish the task and upload proof!') : t('The performer is currently working.')}
                                        </p>
                                        <button
                                            onClick={async () => {
                                                const response = await axios.get(route('api.missions.chat', mission.id));
                                                router.visit(route('messages', { chat_id: response.data.id }));
                                            }}
                                            className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-oflem-charcoal transition-all flex items-center justify-center gap-2"
                                        >
                                            💬 {isOwner ? t('Message Performer') : t('Message Creator')}
                                        </button>
                                    </div>
                                ) : isOwner ? (
                                    <>
                                        <h2 className="text-xl font-black text-primary-black mb-6">🤝 {t('Offers')}</h2>
                                        <div className="space-y-6">
                                            {mission.offers.length > 0 ? mission.offers.map(offer => (
                                                <div key={offer.id} className="p-5 bg-oflem-cream rounded-[24px] border border-gray-border">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <p className="font-black text-primary-black">{offer.user.name}</p>
                                                            <p className="text-xs text-gray-muted font-bold">★ 5.0 (New)</p>
                                                        </div>
                                                        <p className="text-lg font-black text-gold-accent">CHF {offer.amount}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-muted font-medium mb-6 line-clamp-2">{offer.message}</p>
                                                    
                                                    {mission.status === 'OUVERTE' && (
                                                        <button
                                                            onClick={() => {
                                                                router.post(route('missions.select-offer', { mission: mission.id, offer: offer.id }), {}, {
                                                                    onSuccess: (page) => {
                                                                        if (page.props.flash?.stripe_client_secret) {
                                                                            setClientSecret(page.props.flash.stripe_client_secret);
                                                                            setShowPaymentModal(true);
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full py-3 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all text-sm shadow-md"
                                                        >
                                                            💼 {t('Hire')} {offer.user.name}
                                                        </button>
                                                    )}
                                                    {offer.status === 'accepted' && (
                                                        <div className="text-center py-2 bg-gold-accent text-primary-black font-black text-[10px] uppercase rounded-full">
                                                            {t('Selected')}
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <p className="text-gray-muted font-bold text-center text-sm">{t('Waiting for offers...')}</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    /* Performer/Guest Section for OUVERTE missions */
                                    mission.status === 'OUVERTE' && (
                                        mission.price_type === 'fixed' ? (
                                            <div className="space-y-6">
                                                <div className="text-center pb-6 border-b border-gray-border">
                                                    <p className="text-xs font-black text-gray-muted uppercase tracking-widest mb-1">{t('Fixed Price')}</p>
                                                    <p className="text-4xl font-black text-primary-black">CHF {mission.budget}</p>
                                                </div>
                                                <button
                                                    onClick={acceptMission}
                                                    className="w-full py-5 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all shadow-xl text-lg"
                                                >
                                                    ⚡ {t('Accept Instantly')}
                                                </button>
                                                <p className="text-[10px] text-gray-muted font-bold text-center leading-relaxed">
                                                    {t('By accepting, you commit to completing this mission for the fixed price shown.')}
                                                </p>
                                            </div>
                                        ) : (
                                            <form onSubmit={submitOffer} className="space-y-6">
                                                <h2 className="text-xl font-black text-primary-black mb-4">🏷️ {t('Submit an Offer')}</h2>
                                                
                                                <div>
                                                    <InputLabel htmlFor="amount" value={t('Your price')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                                    <div className="relative">
                                                        <TextInput
                                                            id="amount"
                                                            type="number"
                                                            className="w-full pl-12"
                                                            placeholder="0.00"
                                                            value={offerForm.data.amount}
                                                            onChange={e => offerForm.setData('amount', e.target.value)}
                                                            required
                                                        />
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-muted">CHF</span>
                                                    </div>
                                                    <InputError message={offerForm.errors.amount} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="message" value={t('Message (Optional)')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                                    <textarea
                                                        id="message"
                                                        className="w-full bg-oflem-cream border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[100px]"
                                                        placeholder={t('Tell the creator why you are a good fit...')}
                                                        value={offerForm.data.message}
                                                        onChange={e => offerForm.setData('message', e.target.value)}
                                                    />
                                                    <InputError message={offerForm.errors.message} className="mt-2" />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={offerForm.processing}
                                                    className="w-full py-5 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-xl text-lg"
                                                >
                                                    🚀 {t('Send Offer')}
                                                </button>
                                            </form>
                                        )
                                    )
                                )}
                            </section>
                        </div>
                </div>
            </main>

            <Footer />

            <PaymentModal 
                show={showPaymentModal}
                clientSecret={clientSecret}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => {
                    setShowPaymentModal(false);
                    router.reload();
                }}
            />
        </div>
    );
}

function ProofUploadForm({ missionId, t }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        completion_proof: null,
        completion_notes: '',
    });

    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('completion_proof', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('missions.submit-validation', missionId), {
            forceFormData: true,
            onSuccess: () => {
                setPreviewUrl(null);
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 bg-white rounded-[24px] p-6">
            {/* Photo Upload */}
            <div>
                <InputLabel htmlFor="completion_proof" value={t('Upload Photo Proof')} className="text-xs uppercase tracking-widest font-black mb-3" />
                <div className="relative">
                    <input
                        type="file"
                        id="completion_proof"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-muted font-medium
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-full file:border-0
                            file:text-sm file:font-black
                            file:bg-primary-black file:text-white
                            hover:file:bg-black file:cursor-pointer
                            cursor-pointer"
                        required
                    />
                </div>
                <InputError message={errors.completion_proof} className="mt-2" />
                
                {/* Image Preview */}
                {previewUrl && (
                    <div className="mt-4">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full max-h-64 object-cover rounded-[16px] shadow-md"
                        />
                    </div>
                )}
            </div>

            {/* Completion Notes */}
            <div>
                <InputLabel htmlFor="completion_notes" value={t('Completion Notes (Optional)')} className="text-xs uppercase tracking-widest font-black mb-3" />
                <textarea
                    id="completion_notes"
                    value={data.completion_notes}
                    onChange={e => setData('completion_notes', e.target.value)}
                    className="w-full bg-oflem-cream border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[120px]"
                    placeholder={t('Describe what you completed, any additional details...')}
                    maxLength={1000}
                />
                <InputError message={errors.completion_notes} className="mt-2" />
                <p className="text-xs text-gray-muted font-bold mt-2">
                    {data.completion_notes.length}/1000 characters
                </p>
            </div>

            {/* Upload Progress */}
            {progress && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress.percentage}%` }}
                    ></div>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={processing || !data.completion_proof}
                className="w-full py-5 bg-green-600 text-white font-black rounded-full hover:bg-green-700 transition-all shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('Uploading...')}
                    </>
                ) : (
                    <>
                        ✅ {t('Submit for Validation')}
                    </>
                )}
            </button>

            <p className="text-xs text-gray-muted font-bold text-center">
                ⚠️ {t('The customer will have 72 hours to validate your work')}
            </p>
        </form>
    );
}

function AnswerForm({ missionId, questionId, t }) {
    const { data, setData, post, processing, reset } = useForm({
        answer: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('missions.answer-question', { mission: missionId, question: questionId }), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="ml-12 mt-2 flex gap-4">
            <TextInput
                value={data.answer}
                onChange={e => setData('answer', e.target.value)}
                placeholder={t('Type your answer...')}
                className="flex-1 !py-2 !px-4 !text-xs"
                required
            />
            <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50"
            >
                {t('Answer')}
            </button>
        </form>
    );
}

function DetailItem({ icon, label, value, subValue }) {
    return (
        <div className="flex items-start gap-4">
            <span className="text-2xl mt-1">{icon}</span>
            <div>
                <p className="text-[10px] font-black text-gray-muted uppercase tracking-widest mb-1">{label}</p>
                <p className="font-black text-primary-black">{value}</p>
                {subValue && <p className="text-[10px] font-bold text-gold-accent mt-1 italic">{subValue}</p>}
            </div>
        </div>
    );
}
