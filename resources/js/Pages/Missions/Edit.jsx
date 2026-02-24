import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import { 
    ArrowLeft, 
    AlertTriangle, 
    Sparkles, 
    Info, 
    CheckCircle,
    Save
} from 'lucide-react';

export default function Edit({ mission }) {
    const { t } = useTranslation();
    const [isModerating, setIsModerating] = useState(false);
    const [moderationError, setModerationError] = useState('');

    const { data, setData, patch, processing, errors } = useForm({
        title: mission.title || '',
        description: mission.description || '',
        budget: mission.budget || '',
        date_time: mission.date_time ? mission.date_time.slice(0, 16) : '', // Format for datetime-local
        category: mission.category || '',
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
            return true; // Proceed if service is down
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

        patch(route('missions.update', mission.id));
    };

    return (
        <AuthenticatedLayout 
            header={t('Edit Mission')}
            maxWidth="max-w-3xl"
            showFooter={true}
        >
            <Head title={t('Edit Mission')} />

            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-border">
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-oflem-charcoal">{t('Edit Your Mission')}</h2>
                        <Link
                            href={route('missions.show', mission.id)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> {t('Back to Details')}
                        </Link>
                    </div>
                    {mission.offers && mission.offers.length > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="text-yellow-600 shrink-0" size={18} />
                            <p className="text-sm font-bold text-yellow-800">
                                {t('This mission has received offers. Editing may affect existing offers.')}
                            </p>
                        </div>
                    )}
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
                    <div className="relative group/desc">
                        <div className="flex justify-between items-center mb-3">
                            <InputLabel htmlFor="description" value={t('Description')} className="text-xs uppercase tracking-widest font-black" />
                            {data.description && data.description.length > 5 && (
                                <button 
                                    type="button" 
                                    onClick={handleHelpMeWrite}
                                    disabled={isWriting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-oflem-terracotta to-[#D4AF37] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    {isWriting ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    {isWriting ? t('Polishing...') : t('Help me write')}
                                </button>
                            )}
                        </div>
                        <textarea
                            id="description"
                            value={data.description}
                            className="w-full bg-oflem-cream border-gray-border rounded-[24px] p-6 text-sm font-medium focus:border-oflem-terracotta focus:ring-0 min-h-[180px] transition-all"
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('Provide more details about your mission...')}
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Budget */}
                        <div>
                            <InputLabel htmlFor="budget" value={t('Budget (CHF)')} className="text-xs uppercase tracking-widest font-black mb-3" />
                            <div className="relative">
                                <input
                                    id="budget"
                                    type="number"
                                    value={data.budget}
                                    className="w-full bg-white border-2 border-gray-border rounded-[20px] py-4 pl-16 pr-6 text-xl font-black text-oflem-charcoal focus:border-oflem-terracotta focus:ring-0 transition-all"
                                    onChange={(e) => setData('budget', e.target.value)}
                                    placeholder="0"
                                />
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-muted text-sm">CHF</span>
                            </div>
                            <InputError message={errors.budget} className="mt-2" />
                        </div>

                        {/* Date & Time */}
                        <div>
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

                    {/* Info Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg flex items-start gap-3">
                        <Info className="text-blue-600 shrink-0" size={18} />
                        <p className="text-xs font-bold text-blue-800">
                            {t('Location and price type cannot be changed after mission creation.')}
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-6">
                        <Link
                            href={route('missions.show', mission.id)}
                            className="flex-1 py-5 bg-gray-100 text-gray-700 font-black rounded-full hover:bg-gray-200 transition-all text-center"
                        >
                            {t('Cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || isModerating || !data.title.trim()}
                            className={`flex-1 py-5 font-black rounded-full transition-all shadow-xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] ${
                                !data.title.trim() || processing || isModerating
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-oflem-charcoal text-white hover:bg-black'
                            }`}
                        >
                            {processing || isModerating ? (
                                <span className="w-6 h-6 border-4 border-oflem-terracotta border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <CheckCircle size={20} /> {t('Save Changes')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
