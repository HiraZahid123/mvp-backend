import React from 'react';
import { Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full bg-off-white-bg border-t border-gray-border py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
                <div className="col-span-2">
                    <h3 className="text-xl font-black text-primary-black mb-6">Oflem</h3>
                    <p className="text-gray-muted text-sm font-bold max-w-xs leading-relaxed">
                        {t('The Swiss help platform for lazy ones and motivated ones.')}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-black text-primary-black uppercase tracking-widest mb-6">{t('About')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('How it works')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('Safety')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-black text-primary-black uppercase tracking-widest mb-6">{t('Terms')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('Privacy')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('Terms')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-black text-primary-black uppercase tracking-widest mb-6">{t('Contact')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('Contact')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-primary-black transition-colors">{t('Social')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-black text-primary-black uppercase tracking-widest mb-6">{t('Language')}</h4>
                    <ul className="space-y-4">
                        <li><span className="text-sm font-bold text-primary-black">EN / FR</span></li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-border flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-bold text-gray-muted uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} OFLEM. ALL RIGHTS RESERVED.
                </p>
            </div>
        </footer>
    );
}
