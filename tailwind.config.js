import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'primary-dark': '#001F3F',
                'primary-accent': '#BFE7FE',
                'secondary-gray': '#666666',
                'surface': '#FFFFFF',
                'border-light': '#F5F5F5',
                'beige-bg': '#EAE2D1',
                'off-white-bg': '#F3F3F1',
                'charcoal': '#1A1A1A',
                'gray-border': '#D1D1D1',
                'primary-black': '#000000',
                'gray-muted': '#A1A1A1',
                'gold-accent': '#D4B062',
                'input-bg': '#F9F9F9',
                'cream-accent': '#EEE9D5',
            },
            boxShadow: {
                'card': '0px 4px 10px 3px rgba(0, 0, 0, 0.11)',
                'btn-inner': '0px 4px 15px rgba(0, 0, 0, 0.15), inset 0px 2px 2px #BFE7FE, inset 0px -4px 4px rgba(0, 0, 0, 0.3), inset 0px 4px 4px rgba(255, 255, 255, 0.5)',
            },
            borderRadius: {
                'px-24': '24px',
                'px-8': '8px',
            }
        },
    },

    plugins: [forms],
};
