import React from 'react';
import { Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { Facebook, Instagram, Linkedin, Check } from 'lucide-react';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full bg-zinc-50 border-t border-zinc-200 pt-16 pb-8 px-6 overflow-hidden relative">
            <div className="max-w-[1248px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10 mb-12">
                <div className="flex flex-col">
                    <Link href="/" className="logo text-[28px] font-black tracking-[-0.8px] text-zinc-900 flex items-baseline mb-6 hover:scale-[1.02] transition-transform w-fit">
                        Oflem<span className="text-oflem-terracotta">.</span>
                    </Link>
                    <p className="text-zinc-500 text-[14px] font-medium leading-[1.7] mb-8 max-w-[260px]">
                        {t('Someone near you can take care of it. Verified providers, secure payment, French-speaking Switzerland.')}
                    </p>
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-oflem-terracotta transition-colors group cursor-pointer">
                            <Facebook className="w-4 h-4 text-zinc-400 group-hover:text-oflem-terracotta" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-oflem-terracotta transition-colors group cursor-pointer">
                            <Instagram className="w-4 h-4 text-zinc-400 group-hover:text-oflem-terracotta" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-oflem-terracotta transition-colors group cursor-pointer">
                            <Linkedin className="w-4 h-4 text-zinc-400 group-hover:text-oflem-terracotta" />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-[15px] font-black text-zinc-900 mb-6">{t('Discover')}</h4>
                    <ul className="space-y-3">
                        <li><Link href={route('missions.active')} className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('All missions')}</Link></li>
                        <li><Link href={route('providers.index')} className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('Find a provider')}</Link></li>
                        <li><Link href="/#how-it-works" className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('How it works')}</Link></li>
                        <li><Link href="#" className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('FAQ')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[15px] font-black text-zinc-900 mb-6">{t('Help & Legal')}</h4>
                    <ul className="space-y-3">
                        <li><Link href="#" className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('Help Center')}</Link></li>
                        <li><Link href="#" className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('Terms of Service')}</Link></li>
                        <li><Link href="#" className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block">{t('Privacy Policy')}</Link></li>
                        <li><a href="mailto:contact@oflem.ch" className="text-[13.5px] font-medium text-zinc-500 hover:text-oflem-terracotta hover:translate-x-1 transition-all inline-block font-bold">contact@oflem.ch</a></li>
                    </ul>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-[15px] font-black text-zinc-900 mb-2">{t('Trust')}</h4>
                    <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-oflem-green/10 flex items-center justify-center">
                                <Check size={14} className="text-oflem-terracotta" />
                            </div>
                            <span className="text-[12px] font-black text-zinc-900 uppercase tracking-wider">{t('Secure payment')}</span>
                        </div>
                        <p className="text-[12px] text-zinc-500 leading-relaxed italic">
                            "{t('Your satisfaction or your money back.')}"
                        </p>
                    </div>
                    <div className="flex gap-2 opacity-40 grayscale">
                        <div className="h-4 w-7 bg-zinc-300 rounded-sm" />
                        <div className="h-4 w-7 bg-zinc-300 rounded-sm" />
                        <div className="h-4 w-7 bg-zinc-300 rounded-sm" />
                    </div>
                </div>
            </div>
            
            <div className="max-w-[1248px] mx-auto pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
                    <p className="text-[12px] font-bold text-zinc-400">
                        &copy; {new Date().getFullYear()} OFLEM.CH
                    </p>
                    <div className="hidden md:block w-px h-3 bg-zinc-300" />
                    <p className="text-[12px] font-bold text-zinc-400">
                        {t('Powered by the community in Switzerland')}
                    </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-lg p-1.5 px-3">
                    <span className="text-[11px] font-black text-oflem-terracotta cursor-pointer tracking-wider">FR</span>
                    <div className="w-px h-3 bg-zinc-200" />
                    <span className="text-[11px] font-black text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer tracking-wider">DE</span>
                    <div className="w-px h-3 bg-zinc-200" />
                    <span className="text-[11px] font-black text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer tracking-wider">EN</span>
                </div>
            </div>
        </footer>
    );
}
