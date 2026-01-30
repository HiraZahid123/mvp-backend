import React from 'react';
import { Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full bg-oflem-cream border-t border-gray-border py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-xl font-black text-oflem-charcoal mb-6">Oflem</h3>
                    <p className="text-gray-muted text-sm font-bold max-w-xs leading-relaxed">
                        {t('Oflem: the Swiss mutual aid platform for lazy people and the motivated')}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-black text-oflem-charcoal uppercase tracking-widest mb-6">{t('Oflem')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">{t('About')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">{t('How it works')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">{t('Security & trust')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">{t('FAQ')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-black text-oflem-charcoal uppercase tracking-widest mb-6">{t('Get in Touch')}</h4>
                    <ul className="space-y-4">
                        <li><a href="mailto:hello@oflem.com" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">hello@oflem.com</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-black text-oflem-charcoal uppercase tracking-widest mb-6">{t('Terms')}</h4>
                    <ul className="space-y-4">
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">{t('Privacy')}</Link></li>
                        <li><Link href="#" className="text-sm font-bold text-gray-muted hover:text-oflem-charcoal transition-colors">{t('Terms')}</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-border flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-bold text-gray-muted uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} OFLEM. ALL RIGHTS RESERVED.
                </p>
                <div className="flex gap-6">
                    <span className="text-[10px] font-bold text-oflem-charcoal uppercase tracking-widest cursor-pointer">EN</span>
                    <span className="text-[10px] font-bold text-gray-muted uppercase tracking-widest cursor-pointer">FR</span>
                </div>
            </div>
        </footer>
    );
}
