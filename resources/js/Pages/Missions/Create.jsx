import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import MissionLocationPicker from '@/Components/MissionLocationPicker';

export default function Create({ prefillTitle = '', aiTitle = null }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [moderationError, setModerationError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: aiTitle || prefillTitle,
        description: '',
        location: '',
        lat: '',
        lng: '',
        exact_address: '',
        date_time: '',
        budget: '',
        price_type: 'fixed', // Default price type
        additional_details: '',
    });

    const checkModeration = async (content) => {
        setIsModerating(true);
        setModerationError('');
        try {
            const response = await axios.post(route('api.moderation.check'), { content });
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
            const response = await axios.post(route('api.missions.ai-rewrite'), { 
                title: data.title, 
                description: data.description 
            });
            setData(prev => ({ 
                ...prev, 
                title: response.data.improved_title || prev.title, 
                description: response.data.improved_description || prev.description
            }));
        } catch (error) {
            console.error('AI Rewrite Error:', error);
        } finally {
            setIsWriting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isClean = await checkModeration(data.title + ' ' + data.description);
        if (!isClean) return;

        if (!auth.user) {
            // Store pending mission in session and redirect to preview (handled by backend)
            router.post(route('api.missions.store'), data);
            return;
        }

        post(route('api.missions.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout 
            header={t('Create Mission')}
            maxWidth="max-w-3xl"
            showFooter={true}
        >
            <Head title={t('Create Mission')} />

            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                <div className="mb-10 text-center">
                    <p className="text-gray-muted font-bold">{t('We take care of the rest.')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <InputLabel htmlFor="title" value={t('Mission title')} className="text-xs uppercase tracking-widest font-black" />
                            {aiTitle && data.title === aiTitle && (
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                    ✨ {t('AI Comprehensive Title')}
                                </span>
                            )}
                        </div>
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
                    <div className="relative group/desc">
                        <div className="flex justify-between items-center mb-3">
                            <InputLabel htmlFor="description" value={t('Description')} className="text-xs uppercase tracking-widest font-black" />
                            {data.description.length > 5 && (
                                <button 
                                    type="button" 
                                    onClick={handleHelpMeWrite}
                                    disabled={isWriting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-accent to-[#D4AF37] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in slide-in-from-right-4"
                                >
                                    {isWriting ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <span className="text-sm">✨</span>
                                    )}
                                    {isWriting ? t('Polishing...') : t('Help me write')}
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                id="description"
                                value={data.description}
                                className="w-full bg-oflem-cream border-gray-border rounded-[24px] p-6 text-sm font-medium focus:border-gold-accent focus:ring-0 min-h-[180px] transition-all placeholder:text-gray-300 group-hover/desc:border-gray-300 shadow-inner"
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t('Provide more details about your mission...')}
                            />
                            {!data.description && (
                                <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('Hint: The better you describe, the better the matches')}</p>
                                </div>
                            )}
                        </div>
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Location (City/General) */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                                <InputLabel value={t('Where will this happen ?')} className="text-xs uppercase tracking-widest font-black" />
                                <span className="px-2 py-0.5 bg-cream-accent text-[9px] font-black uppercase tracking-tighter rounded-full">{t('Publicly Visible')}</span>
                            </div>
                            <MissionLocationPicker 
                                onLocationSelect={(loc) => {
                                    setData(prev => ({
                                        ...prev,
                                        location: loc.city,
                                        lat: loc.lat,
                                        lng: loc.lng,
                                        exact_address: loc.address
                                    }));
                                }}
                                initialAddress={data.exact_address || data.location}
                            />
                            <InputError message={errors.location || errors.lat || errors.lng} className="mt-2" />
                            <p className="mt-2 text-[10px] text-gray-muted font-bold">
                                📍 {t('Pick the exact spot on the map or search for an address.')}
                            </p>
                        </div>

                        {/* Date & Time */}
                        <div className="col-span-2 md:col-span-1">
                            <InputLabel htmlFor="date_time" value={t('Date & Time')} className="text-xs uppercase tracking-widest font-black mb-3" />
                            <TextInput
                                id="date_time"
                                type="datetime-local"
                                value={data.date_time}
                                className="w-full"
                                min={new Date().toISOString().slice(0, 16)}
                                onChange={(e) => setData('date_time', e.target.value)}
                            />
                            <InputError message={errors.date_time} className="mt-2" />
                        </div>
                    </div>
                    <div className="bg-oflem-cream p-8 rounded-[32px] border border-gray-border">
                        <div className="text-center mb-8">
                            <InputLabel value={t('Pricing & Budget')} className="text-xs uppercase tracking-widest font-black mb-2" />
                            <p className="text-[10px] text-gray-muted font-bold uppercase tracking-wider">{t('Choose how you want to pay for this mission')}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => setData('price_type', 'fixed')}
                                className={`p-6 rounded-[24px] border-2 transition-all text-left relative overflow-hidden group ${data.price_type === 'fixed' ? 'border-primary-black bg-white shadow-md' : 'border-transparent bg-gray-100/50 opacity-60 hover:opacity-100'}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-2xl">⚡</div>
                                    {data.price_type === 'fixed' && <div className="w-2 h-2 bg-primary-black rounded-full"></div>}
                                </div>
                                <p className="font-black text-primary-black mb-1">{t('Fixed Price')}</p>
                                <p className="text-[10px] text-gray-muted font-bold leading-tight">{t('Set your budget. Performers will accept it instantly.')}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('price_type', 'open')}
                                className={`p-6 rounded-[24px] border-2 transition-all text-left relative overflow-hidden group ${data.price_type === 'open' ? 'border-primary-black bg-white shadow-md' : 'border-transparent bg-gray-100/50 opacity-60 hover:opacity-100'}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-2xl">🏷️</div>
                                    {data.price_type === 'open' && <div className="w-2 h-2 bg-primary-black rounded-full"></div>}
                                </div>
                                <p className="font-black text-primary-black mb-1">{t('Request Quotes')}</p>
                                <p className="text-[10px] text-gray-muted font-bold leading-tight">{t('Receive offers from performers and negotiate the price.')}</p>
                            </button>
                        </div>

                        <div className="max-w-xs mx-auto text-center">
                            <InputLabel 
                                htmlFor="budget" 
                                value={data.price_type === 'fixed' ? t('Your Price') : t('Expected Budget (Optional)')} 
                                className="text-[10px] uppercase tracking-widest font-black mb-4" 
                            />
                            <div className="relative mb-6">
                                <input
                                    id="budget"
                                    type="number"
                                    value={data.budget}
                                    className="w-full bg-white border-2 border-gray-border rounded-[20px] py-4 pl-16 pr-6 text-xl font-black text-primary-black focus:border-gold-accent focus:ring-0 transition-all text-center"
                                    onChange={(e) => setData('budget', e.target.value)}
                                    placeholder="0"
                                    required={data.price_type === 'fixed'}
                                />
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-muted text-sm">CHF</span>
                            </div>

                            {data.price_type === 'fixed' && (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[20, 50, 100, 200].map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => setData('budget', amount.toString())}
                                            className={`px-4 py-2 rounded-full text-[10px] font-black transition-all border-2 ${data.budget === amount.toString() ? 'border-gold-accent bg-gold-accent text-white' : 'border-gray-border bg-white text-gray-muted hover:border-gold-accent/50'}`}
                                        >
                                            {amount} CHF
                                        </button>
                                    ))}
                                </div>
                            )}
                            <InputError message={errors.budget} className="mt-4" />
                        </div>
                    </div>

                    {/* Exact Address (Strictly confidential) - Simplified as it matches map selection */}
                    <div className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <InputLabel htmlFor="exact_address" value={t('Refine Exact Address')} className="text-xs uppercase tracking-widest font-black" />
                            <span className="px-2 py-0.5 bg-gold-accent text-[9px] font-black uppercase tracking-tighter rounded-full">{t('Private')}</span>
                        </div>
                        <TextInput
                            id="exact_address"
                            type="text"
                            value={data.exact_address}
                            className="w-full"
                            onChange={(e) => setData('exact_address', e.target.value)}
                            placeholder={t('Street name, house number, apartment...')}
                        />
                        <p className="mt-2 text-[10px] text-gray-muted font-bold flex items-center gap-1">
                            🔒 {t('Automatically filled from map. You can add details like room or floor.')}
                        </p>
                        <InputError message={errors.exact_address} className="mt-2" />
                    </div>

                    {/* Submit */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={processing || isModerating || !data.title.trim()}
                            className={`w-full py-5 font-black rounded-full transition-all shadow-xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] ${
                                !data.title.trim() || processing || isModerating
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-primary-black text-white hover:bg-black'
                            }`}
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
        </AuthenticatedLayout>
    );
}
