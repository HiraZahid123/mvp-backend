import React from 'react';
import { usePage, router } from '@inertiajs/react';

export default function LanguageSwitcher() {
    const { locale } = usePage().props;

    const changeLanguage = (newLocale) => {
        router.post(route('language.switch'), { locale: newLocale }, {
            onSuccess: () => {
                window.location.reload();
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('en')}
                className={`text-xs font-black px-2 py-1 rounded transition-colors ${
                    locale === 'en' ? 'bg-gold-accent text-primary-black' : 'text-gray-muted hover:text-primary-black'
                }`}
            >
                EN
            </button>
            <span className="text-gray-border text-xs">|</span>
            <button
                onClick={() => changeLanguage('fr')}
                className={`text-xs font-black px-2 py-1 rounded transition-colors ${
                    locale === 'fr' ? 'bg-gold-accent text-primary-black' : 'text-gray-muted hover:text-primary-black'
                }`}
            >
                FR
            </button>
        </div>
    );
}
