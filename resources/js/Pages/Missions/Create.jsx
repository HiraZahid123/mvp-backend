import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import MissionLocationPicker from '@/Components/MissionLocationPicker';
import { 
    Sparkles, 
    Rocket, 
    ShieldCheck, 
    Lock, 
    ChevronDown, 
    ChevronRight,
    MapPin,
    Calendar,
    Clock
} from 'lucide-react';

export default function Create({ prefillTitle = '', aiTitle = null }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [moderationError, setModerationError] = useState('');
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [priceInputMode, setPriceInputMode] = useState('quick'); // 'quick' or 'custom'
    const [aiGenerationError, setAiGenerationError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: aiTitle || prefillTitle,
        description: '',
        location: auth.user?.location_address || '',
        lat: auth.user?.location_lat || '',
        lng: auth.user?.location_lng || '',
        exact_address: '',
        date_time: '',
        budget: '',
        price_type: 'fixed', // Default price type
        additional_details: '',
    });

    // Auto-generate description when title changes (debounced)
    // Manual description generation
    const handleGenerateDescription = async () => {
        if (!data.title) return;
        
        setIsGeneratingDescription(true);
        setAiGenerationError('');
        try {
            const response = await axios.post(route('api.missions.ai-rewrite'), { 
                title: data.title, 
                description: data.description 
            });
            setData(prev => ({ 
                ...prev, 
                description: response.data.improved_description || ''
            }));
        } catch (error) {
            console.error('AI Description Generation Error:', error);
            setAiGenerationError(t('Could not generate description. Please try again.'));
        } finally {
            setIsGeneratingDescription(false);
        }
    };

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
            return true;
        } finally {
            setIsModerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate location is provided
        if (!data.location && !data.lat && !data.lng) {
            setModerationError(t('Please select a location for your mission.'));
            return;
        }
        
        const isClean = await checkModeration(data.title + ' ' + data.description);
        if (!isClean) return;

        if (!auth.user) {
            router.post(route('api.missions.store'), data);
            return;
        }

        post(route('api.missions.store'), {
            onSuccess: () => reset(),
        });
    };

    const quickPrices = [10, 20, 30];

    return (
        <AuthenticatedLayout 
            header={t('Post a Mission')}
            maxWidth="max-w-2xl"
            showFooter={true}
        >
            <Head title={t('Create Mission')} />

            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                <div className="mb-8 text-center">
                    <p className="text-gray-muted font-medium">{t('Quick and simple.')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <InputLabel htmlFor="title" value={t('What do you need help with?')} className="text-sm font-bold mb-3" />
                        <TextInput
                            id="title"
                            type="text"
                            value={data.title}
                            className="w-full text-lg"
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('e.g. Take out my trash')}
                            required
                        />
                        <InputError message={errors.title || moderationError} className="mt-2" />
                    </div>

                    {/* Quick Price Buttons */}
                    <div>
                        <InputLabel value={t('How much are you offering?')} className="text-sm font-bold mb-3" />
                        <div className="flex flex-wrap gap-3 mb-4">
                            {quickPrices.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => {
                                        setData('budget', amount.toString());
                                        setPriceInputMode('quick');
                                    }}
                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all border-2 ${
                                        data.budget === amount.toString() && priceInputMode === 'quick'
                                            ? 'border-oflem-charcoal bg-oflem-charcoal text-white shadow-md scale-105'
                                            : 'border-gray-border bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {amount} CHF
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setPriceInputMode('custom');
                                    // Don't clear budget if it's already a custom value
                                }}
                                className={`px-6 py-3 rounded-full text-sm font-bold transition-all border-2 ${
                                    priceInputMode === 'custom'
                                        ? 'border-oflem-charcoal bg-oflem-charcoal text-white shadow-md scale-105'
                                        : 'border-gray-border bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {t('Other')}
                            </button>
                        </div>

                        {priceInputMode === 'custom' && (
                            <div className="relative max-w-xs">
                                <input
                                    id="budget"
                                    type="number"
                                    value={data.budget}
                                    className="w-full bg-white border-2 border-gray-border rounded-2xl py-3 pl-14 pr-6 text-lg font-bold text-oflem-charcoal focus:border-oflem-charcoal focus:ring-0 transition-all"
                                    onChange={(e) => setData('budget', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-muted text-sm">CHF</span>
                            </div>
                        )}
                        <InputError message={errors.budget} className="mt-2" />
                    </div>

                    {/* Location (Auto-filled) */}
                    <div>
                        <InputLabel value={t('Where?')} className="text-sm font-bold mb-3" />
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
                    </div>

                    {/* More Options (Collapsible) */}
                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={() => setShowMoreOptions(!showMoreOptions)}
                            className="text-sm font-bold text-zinc-500 hover:text-oflem-charcoal transition-colors flex items-center gap-2 group"
                        >
                            <span className="group-hover:translate-y-0.5 transition-transform">
                                {showMoreOptions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                            {t('More options')}
                        </button>

                        {showMoreOptions && (
                            <div className="mt-6 space-y-6 p-6 bg-gray-50 rounded-3xl">
                                {/* Description */}
                                <div>
                                    <InputLabel htmlFor="description" value={t('Description (optional)')} className="text-sm font-bold mb-3" />
                                    <div className="relative">
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            className="w-full bg-white border-gray-border rounded-2xl p-4 text-sm font-medium focus:border-oflem-charcoal focus:ring-0 min-h-[120px] transition-all"
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder={t('Add more details if needed...')}
                                        />
                                        
                                        {/* AI Generation Button inside textarea */}
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingDescription || !data.title}
                                            className="absolute bottom-3 right-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-2 border border-gray-200"
                                            title={t('Generate description with AI')}
                                        >
                                            {isGeneratingDescription ? (
                                                <>
                                                    <span className="w-3 h-3 border-2 border-gray-400 border-t-oflem-charcoal rounded-full animate-spin"></span>
                                                    {t('Generating...')}
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} className="text-oflem-terracotta" /> {t('Auto-fill')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Date & Time */}
                                <div>
                                    <InputLabel htmlFor="date_time" value={t('When? (optional)')} className="text-sm font-bold mb-3" />
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

                                {/* Exact Address */}
                                <div>
                                    <InputLabel htmlFor="exact_address" value={t('Exact address (optional)')} className="text-sm font-bold mb-3" />
                                    <TextInput
                                        id="exact_address"
                                        type="text"
                                        value={data.exact_address}
                                        className="w-full"
                                        onChange={(e) => setData('exact_address', e.target.value)}
                                        placeholder={t('Street, number, apartment...')}
                                    />
                                    <p className="mt-2 text-xs text-zinc-400 font-bold flex items-center gap-1.5">
                                        <Lock size={12} className="text-oflem-terracotta" /> {t('Only shared with your Provider after confirmation')}
                                    </p>
                                    <InputError message={errors.exact_address} className="mt-2" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={processing || isModerating || !data.title.trim() || !data.budget}
                            className={`w-full py-5 font-black rounded-full transition-all shadow-xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] ${
                                !data.title.trim() || !data.budget || processing || isModerating
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-oflem-charcoal text-white hover:bg-black'
                            }`}
                        >
                            {processing || isModerating ? (
                                <span className="w-6 h-6 border-4 border-oflem-terracotta border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>{t('Find a Provider')}</span>
                                    <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        {/* Reassurance Text */}
                        <p className="mt-4 text-center text-xs text-zinc-400 font-bold flex items-center justify-center gap-1.5">
                            <ShieldCheck size={14} className="text-oflem-green" /> {t('Your payment is protected. You only pay when the job is done.')}
                        </p>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
