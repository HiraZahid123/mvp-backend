import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function Create({ prefillTitle = '' }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [moderationError, setModerationError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: prefillTitle,
        description: '',
        location: '',
        date_time: '',
        budget: '',
        category: 'general',
        additional_details: '',
    });

    const checkModeration = async (content) => {
        setIsModerating(true);
        setModerationError('');
        try {
            const response = await axios.post(route('moderation.check'), { content });
            if (!response.data.is_clean) {
                setModerationError(t('Content violates moderation rules.'));
                return false;
            }
            return true;
        } catch (error) {
            // Fail check safely if service is down
            return true; // Proceed if service is down, but log error
        } finally {
            setIsModerating(false);
        }
    };

    const [isWriting, setIsWriting] = useState(false);

    const handleHelpMeWrite = async () => {
        if (!data.title) return;
        setIsWriting(true);
        try {
            const response = await axios.post(route('missions.ai-rewrite'), { 
                title: data.title, 
                description: data.description 
            });
            setData(prev => ({ 
                ...prev, 
                title: response.data.improved_title, // AI-refined title
                description: response.data.improved_description 
            }));
        } catch (error) {
            // Fail silently
        } finally {
            setIsWriting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isClean = await checkModeration(data.title + ' ' + data.description);
        if (!isClean) return;

        if (!auth.user) {
            // Store pending mission in session via backend
            router.post(route('missions.store'), data, {
                onSuccess: (page) => {
                    // Check flash message from backend
                    if (page.props.flash?.requires_auth) {
                        setShowAuthModal(true);
                    }
                },
                onError: () => {} 
            });
            return;
        }

        post(route('missions.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="min-h-screen bg-off-white-bg font-sans">
            <Head title={t('Create Mission')} />
            <Header />

            <main className="max-w-3xl mx-auto py-16 px-6">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-primary-black mb-3">{t('Create your mission')}</h1>
                        <p className="text-gray-muted font-bold">{t('We take care of the rest.')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value={t('Mission title')} className="text-xs uppercase tracking-widest font-black mb-3" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                className="w-full"
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder={t('e.g. Need help moving a sofa')}
                                required
                            />
                            <InputError message={errors.title || moderationError} className="mt-2" />
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <InputLabel htmlFor="description" value={t('Description')} className="text-xs uppercase tracking-widest font-black" />
                                <button 
                                    type="button" 
                                    onClick={handleHelpMeWrite}
                                    disabled={isWriting}
                                    className="text-[10px] font-black text-gold-accent uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isWriting && <span className="w-3 h-3 border-2 border-gold-accent border-t-transparent rounded-full animate-spin"></span>}
                                    ✨ {isWriting ? t('Writing...') : t('Help me write')}
                                </button>
                            </div>
                            <textarea
                                id="description"
                                value={data.description}
                                className="w-full bg-off-white-bg border-gray-border rounded-[24px] p-5 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[150px] transition-all"
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t('Provide more details about your mission...')}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Location */}
                            <div>
                                <InputLabel htmlFor="location" value={t('Location')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <TextInput
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    className="w-full"
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder={t('City or ZIP code')}
                                />
                                <InputError message={errors.location} className="mt-2" />
                            </div>

                            {/* Date & Time */}
                            <div>
                                <InputLabel htmlFor="date_time" value={t('Date & Time')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <TextInput
                                    id="date_time"
                                    type="datetime-local"
                                    value={data.date_time}
                                    className="w-full"
                                    onChange={(e) => setData('date_time', e.target.value)}
                                />
                                <InputError message={errors.date_time} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Budget */}
                            <div>
                                <InputLabel htmlFor="budget" value={t('Budget')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <div className="relative">
                                    <TextInput
                                        id="budget"
                                        type="number"
                                        value={data.budget}
                                        className="w-full pl-12"
                                        onChange={(e) => setData('budget', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-muted">CHF</span>
                                </div>
                                <InputError message={errors.budget} className="mt-2" />
                            </div>

                            {/* Category */}
                            <div>
                                <InputLabel htmlFor="category" value={t('Category')} className="text-xs uppercase tracking-widest font-black mb-3" />
                                <select
                                    id="category"
                                    value={data.category}
                                    className="w-full bg-off-white-bg border-gray-border rounded-full px-6 py-3.5 text-sm font-bold text-primary-black focus:border-gold-accent focus:ring-0 appearance-none"
                                    onChange={(e) => setData('category', e.target.value)}
                                >
                                    <option value="general">{t('General Help')}</option>
                                    <option value="home_improvement">{t('Home Improvement & DIY')}</option>
                                    <option value="cleaning">{t('Cleaning & Organization')}</option>
                                    <option value="moving">{t('Moving & Lifting')}</option>
                                    <option value="gardening">{t('Gardening & Outdoor')}</option>
                                    <option value="pets">{t('Pet Care')}</option>
                                    <option value="tech">{t('Tech & IT Support')}</option>
                                    <option value="education">{t('Education & Tutoring')}</option>
                                    <option value="events">{t('Events & Photography')}</option>
                                    <option value="wellness">{t('Wellness & Beauty')}</option>
                                    <option value="admin">{t('Admin & Business')}</option>
                                    <option value="delivery">{t('Delivery & Errands')}</option>
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={processing || isModerating}
                                className="w-full py-5 bg-primary-black text-white font-black rounded-full hover:bg-black transition-all shadow-xl text-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {processing || isModerating ? (
                                    <span className="w-6 h-6 border-4 border-gold-accent border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        🚀 {t('Submit Mission')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />

            {/* Auth Modal */}
            <Modal show={showAuthModal} onClose={() => setShowAuthModal(false)}>
                <div className="p-10 text-center">
                    <div className="w-20 h-20 bg-cream-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h2 className="text-2xl font-black text-primary-black mb-4">{t('One last step')}</h2>
                    <p className="text-gray-muted font-bold mb-10 leading-relaxed">
                        {t('Please log in or sign up to finalize your mission. We have saved your progress!')}
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link 
                            href={route('login')} 
                            className="w-full py-4 bg-gold-accent text-primary-black font-black rounded-full hover:opacity-90 transition-all shadow-md"
                        >
                            {t('Log in')}
                        </Link>
                        <Link 
                            href={route('register')} 
                            className="w-full py-4 bg-white border-2 border-gray-border text-primary-black font-black rounded-full hover:bg-off-white-bg transition-all"
                        >
                            {t('Sign up for free')}
                        </Link>
                    </div>
                    <button 
                        onClick={() => setShowAuthModal(false)}
                        className="mt-8 text-xs font-black text-gray-muted uppercase tracking-widest hover:text-primary-black transition-colors"
                    >
                        {t('Close')}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
