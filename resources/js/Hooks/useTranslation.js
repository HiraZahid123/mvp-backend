import { usePage } from '@inertiajs/react';

export default function useTranslation() {
    const { translations } = usePage().props;

    const t = (key) => {
        if (!translations) return key;
        
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key;
            }
        }
        
        return value;
    };

    return { t };
}
