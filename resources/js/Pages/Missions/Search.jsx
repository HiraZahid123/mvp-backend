import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TypewriterEffect from '@/Components/TypewriterEffect';
import axios from 'axios';

export default function Search() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isClean, setIsClean] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const typewriterStrings = [
        t('Cleaning my apartment'),
        t('Walking my dog'),
        t('Assembling IKEA furniture'),
        t('Picking up groceries'),
        t('Helping with a move'),
    ];

    const handleSearchInput = (val) => {
        setSearchTerm(val);
        setIsClean(true); 
        setHasChecked(false);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm || isChecking) return;

        setIsChecking(true);
        setHasChecked(false);
        try {
            const response = await axios.post(route('moderation.check'), { content: searchTerm });
            const clean = response.data.is_clean;
            setIsClean(clean);
            setHasChecked(true);

            if (clean) {
                router.get(route('missions.create'), { title: searchTerm });
            }
        } catch (error) {
            console.error("Moderation check failed", error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <AuthenticatedLayout header={t('Post a Mission')}>
            <Head title={t('Search Mission')} />

            <div className="max-w-4xl mx-auto py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-primary-black tracking-tight leading-tight mb-6">
                    {t('What can we')} <span className="text-gold-accent">{t('do for you?')}</span>
                </h1>
                <p className="text-lg font-bold text-gray-muted mb-12 max-w-xl mx-auto leading-relaxed">
                    {t('Describe your mission in a few words. Our AI will help you find the best match.')}
                </p>

                <div className="max-w-2xl mx-auto relative z-10">
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        <div className={`transition-all duration-300 rounded-[32px] p-0.5 ${
                            !searchTerm ? 'bg-transparent' : 
                            isChecking ? 'bg-gray-200 animate-pulse' :
                            hasChecked && !isClean ? 'bg-red-100' : 
                            hasChecked && isClean ? 'bg-green-100 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-transparent'
                        }`}>
                            <TypewriterEffect 
                                strings={typewriterStrings} 
                                onUserInput={handleSearchInput} 
                                className={`h-16 text-lg ${
                                    !searchTerm ? 'border-gray-border' : 
                                    hasChecked && isClean ? 'border-green-500 shadow-sm' : 
                                    hasChecked && !isClean ? 'border-red-500' : 'border-gray-border'
                                }`}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!searchTerm || isChecking}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 rounded-full font-black transition-all shadow-md active:scale-95 ${
                                searchTerm && !isChecking
                                    ? 'bg-gold-accent text-primary-black hover:opacity-90'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {isChecking ? t('Checking...') : `🚀 ${t('Post Mission')}`}
                        </button>
                    </form>
                    {hasChecked && !isClean && (
                        <p className="text-red-500 text-sm font-bold mt-4 flex items-center justify-center gap-2 animate-bounce">
                            <span>🚫</span> {t('Content violates moderation rules. Please revise.')}
                        </p>
                    )}
                </div>

                {/* Quick categories / Suggestions */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: '🧹', label: t('Cleaning') },
                        { icon: '📦', label: t('Delivery') },
                        { icon: '🛠️', label: t('Repair') },
                        { icon: '🌿', label: t('Garden') }
                    ].map((cat, i) => (
                        <button 
                            key={i}
                            onClick={() => router.get(route('missions.create'), { category: cat.label.toLowerCase() })}
                            className="bg-white border border-gray-border p-6 rounded-[24px] hover:border-gold-accent transition-all group"
                        >
                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <div className="text-xs font-black text-primary-black uppercase tracking-widest">{cat.label}</div>
                        </button>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
