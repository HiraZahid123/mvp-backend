import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-off-white-bg font-sans">
            <nav className="bg-white border-b border-gray-border sticky top-0 z-50 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between items-center">
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <span className="text-2xl font-black tracking-tight text-primary-black">OFLEM</span>
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
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <LanguageSwitcher />
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
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
                                        <Dropdown.Link href={route('profile.edit')} className="font-bold text-sm">
                                            Profile Settings
                                        </Dropdown.Link>
                                        <div className="border-t border-gray-border my-1"></div>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="font-bold text-sm text-red-600"
                                        >
                                            Sign Out
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
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="font-black">
                            Dashboard
                        </ResponsiveNavLink>
                        <div className="px-4 py-2">
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
                                <div className="font-bold text-sm text-gray-muted">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 pb-4">
                            <ResponsiveNavLink href={route('profile.edit')} className="font-bold">Profile Settings</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-red-600 font-bold">
                                Sign Out
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
