import Dropdown from '@/Components/Dropdown';

import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import useTranslation from '@/Hooks/useTranslation';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    
    const userRole = user?.last_selected_role || user?.role_type || 'customer';

    return (
        <div className="min-h-screen bg-oflem-cream font-sans">
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-border/50 sticky top-0 z-50 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <span className="text-xl md:text-2xl font-black tracking-tight text-oflem-charcoal uppercase">OFLEM</span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex h-20">
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-colors ${
                                        route().current('dashboard')
                                            ? 'border-gold-accent text-primary-black'
                                            : 'border-transparent text-gray-muted hover:text-primary-black hover:border-gray-border'
                                    }`}
                                >
                                    {t('Dashboard')}
                                </Link>
                                
                                <Link
                                    href={route('providers.index')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-black transition-colors ${
                                        route().current('providers.index')
                                            ? 'border-gold-accent text-primary-black'
                                            : 'border-transparent text-gray-muted hover:text-primary-black hover:border-gray-border'
                                    }`}
                                >
                                    {t('Find Helpers')}
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6 gap-4">
                            <LanguageSwitcher />
                            
                            {/* Role-Specific Primary Action */}
                            {userRole === 'performer' ? (
                                <Link 
                                    href={route('providers.index')} 
                                    className="bg-oflem-terracotta text-white px-6 py-2.5 rounded-full text-sm font-black hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
                                >
                                    {t('Find Helpers')}
                                </Link>
                            ) : (
                                <Link 
                                    href={route('missions.create')} 
                                    className="bg-oflem-terracotta text-white px-6 py-2.5 rounded-full text-sm font-black hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
                                >
                                    {t('Post a Mission')}
                                </Link>
                            )}

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-4 py-2 border border-gray-border text-sm leading-4 font-black rounded-full text-primary-black bg-white hover:bg-gray-50 focus:outline-none transition ease-in-out duration-150 gap-2 shadow-sm"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-cream-accent flex items-center justify-center text-[10px] text-gold-accent overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            {user.name}
                                            <svg className="-me-0.5 h-4 w-4 text-gray-muted" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="py-2 bg-white rounded-[16px] shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="px-4 py-2 border-b border-gray-border mb-1">
                                            <div className="text-[10px] font-black uppercase text-gray-muted mb-1">{t('Active Role')}</div>
                                            <div className="text-xs font-black text-oflem-terracotta uppercase tracking-wider">
                                                {userRole === 'performer' ? t('Provider') : t('Client')}
                                            </div>
                                        </div>
                                        
                                        <Dropdown.Link href={route('profile.edit')} className="font-bold text-sm">
                                            {t('Profile Settings')}
                                        </Dropdown.Link>
                                        
                                        {user.role_type === 'both' && (
                                            <Dropdown.Link 
                                                href={route('auth.select-role')} 
                                                className="font-bold text-sm text-oflem-charcoal"
                                            >
                                                {t('Switch Role')}
                                            </Dropdown.Link>
                                        )}

                                        <div className="border-t border-gray-border my-1"></div>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="font-bold text-sm text-red-600 w-full text-left"
                                        >
                                            {t('Sign Out')}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((p) => !p)}
                                className="inline-flex items-center justify-center p-2 rounded-full text-gray-muted hover:text-primary-black hover:bg-gray-100 focus:outline-none transition duration-150"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-white border-t border-gray-border'}>
                    <div className="pt-2 pb-3 space-y-1 text-center px-4">
                        {userRole === 'performer' ? (
                            <Link 
                                href={route('providers.index')} 
                                className="block w-full bg-oflem-terracotta text-white px-6 py-3 rounded-full text-sm font-black hover:opacity-90 transition-all shadow-sm mb-4"
                            >
                                {t('Find Helpers')}
                            </Link>
                        ) : (
                            <Link 
                                href={route('missions.create')} 
                                className="block w-full bg-oflem-terracotta text-white px-6 py-3 rounded-full text-sm font-black hover:opacity-90 transition-all shadow-sm mb-4"
                            >
                                {t('Post a Mission')}
                            </Link>
                        )}
                        
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="font-black text-center">
                            {t('Dashboard')}
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink href={route('providers.index')} active={route().current('providers.index')} className="font-black text-center">
                            {t('Find Helpers')}
                        </ResponsiveNavLink>

                        <div className="py-2 flex justify-center border-t border-gray-border mt-2">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-border">
                        <div className="px-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cream-accent flex items-center justify-center text-sm font-black text-gold-accent overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-black text-base text-primary-black">{user.name}</div>
                                <div className="font-bold text-sm text-gray-muted italic flex items-center gap-1">
                                    {userRole === 'performer' ? t('Provider Mode') : t('Client Mode')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 pb-4">
                            <ResponsiveNavLink href={route('profile.edit')} className="font-bold">{t('Profile Settings')}</ResponsiveNavLink>
                            
                            {user.role_type === 'both' && (
                                <ResponsiveNavLink href={route('auth.select-role')} className="font-bold text-oflem-terracotta">
                                    {t('Switch Role')}
                                </ResponsiveNavLink>
                            )}

                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-red-600 font-bold w-full text-left">
                                {t('Sign Out')}
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-gray-border h-16 flex items-center">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                        <div className="text-xl font-black text-primary-black tracking-tight">{header}</div>
                    </div>
                </header>
            )}

            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
