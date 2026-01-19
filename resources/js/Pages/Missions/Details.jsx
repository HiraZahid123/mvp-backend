import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

export default function Details({ mission, canSeeAddress }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const isOwner = auth.user.id === mission.user_id;
    const isAssigned = auth.user.id === mission.assigned_user_id;

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
            onSuccess: () => offerForm.reset(),
        });
    };

    const submitQuestion = (e) => {
        e.preventDefault();
        questionForm.post(route('missions.ask-question', mission.id), {
            onSuccess: () => questionForm.reset(),
        });
    };

    const acceptMission = () => {
        useForm().post(route('missions.accept', mission.id));
    };

    return (
        <div className="min-h-screen bg-off-white-bg font-sans">
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
                                {mission.status === 'assigned' ? (
                                    <span className="px-4 py-1.5 bg-gold-accent text-primary-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                        ✅ {t('Assigned')}
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        🟢 {t('Open')}
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
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-off-white-bg flex items-center justify-center font-black">
                                                {q.user.name.charAt(0)}
                                            </div>
                                            <div className="bg-off-white-bg p-5 rounded-[24px] flex-1">
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

                            {!isOwner && mission.status === 'open' && (
                                <form onSubmit={submitQuestion} className="space-y-4">
                                    <InputLabel htmlFor="question" value={t('Ask a question')} className="text-xs uppercase tracking-widest font-black" />
                                    <textarea
                                        id="question"
                                        className="w-full bg-off-white-bg border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[100px]"
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
                    </div>

                    {/* Right Column: Actions / Offers */}
                    <div className="space-y-8">
                        {isOwner ? (
                            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border sticky top-8">
                                <h2 className="text-xl font-black text-primary-black mb-6">🤝 {t('Offers')}</h2>
                                <div className="space-y-6">
                                    {mission.offers.length > 0 ? mission.offers.map(offer => (
                                        <div key={offer.id} className="p-5 bg-off-white-bg rounded-[24px] border border-gray-border">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-black text-primary-black">{offer.user.name}</p>
                                                    <p className="text-xs text-gray-muted font-bold">★ 5.0 (New)</p>
                                                </div>
                                                <p className="text-lg font-black text-gold-accent">CHF {offer.amount}</p>
                                            </div>
                                            <p className="text-xs text-gray-muted font-medium mb-6 line-clamp-2">{offer.message}</p>
                                            
                                            {mission.status === 'open' && (
                                                <button
                                                    onClick={() => useForm().post(route('missions.select-offer', { mission: mission.id, offer: offer.id }))}
                                                    className="w-full py-3 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all text-sm shadow-md"
                                                >
                                                    {t('Accept Offer')}
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
                            </section>
                        ) : (
                            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-border sticky top-8">
                                {mission.status === 'assigned' ? (
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">🎉</div>
                                        <h2 className="text-xl font-black text-primary-black mb-2">
                                            {isAssigned ? t('Mission Assigned to You!') : t('Mission Booked')}
                                        </h2>
                                        <p className="text-sm text-gray-muted font-bold mb-6">
                                            {isAssigned 
                                                ? t('You can now communicate with the creator and see the exact address.') 
                                                : t('This mission has already been assigned to another performer.')
                                            }
                                        </p>
                                        {isAssigned && (
                                            <Link
                                                href={route('dashboard', { chat_with: mission.user_id })}
                                                className="w-full py-4 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all flex items-center justify-center gap-2"
                                            >
                                                💬 {t('Message Creator')}
                                            </Link>
                                        )}
                                    </div>
                                ) : mission.price_type === 'fixed' ? (
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
                                                className="w-full bg-off-white-bg border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[100px]"
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
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
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
