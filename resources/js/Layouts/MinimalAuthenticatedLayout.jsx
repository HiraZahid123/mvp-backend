import { usePage, Link } from '@inertiajs/react';
import React from 'react';
import useTranslation from '@/Hooks/useTranslation';

export default function MinimalAuthenticatedLayout({ children }) {
    const { t } = useTranslation();

    return (
        <div className="h-screen bg-oflem-cream font-sans flex flex-col overflow-hidden">
            {/* Minimal Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-border/50 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-black tracking-tight text-oflem-charcoal uppercase">
                    OFLEM
                </Link>
                <Link 
                    href={route('dashboard')} 
                    className="text-[10px] font-black uppercase tracking-widest text-oflem-terracotta hover:text-oflem-charcoal transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    {t('Back to Dashboard')}
                </Link>
            </div>
            
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
