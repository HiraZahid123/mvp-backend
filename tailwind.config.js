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
                serif: ['Playfair Display', 'Georgia', ...defaultTheme.fontFamily.serif],
            },
                colors: {
                    'oflem-terracotta': '#FF6B35',
                    'oflem-terracotta-light': '#ff8c5a',
                    'oflem-terracotta-glow': 'rgba(255, 107, 53, 0.25)',
                    'oflem-charcoal': '#1A1D3F',
                    'oflem-navy': '#1A1D3F',
                    'oflem-navy-light': '#2d3748',
                    'oflem-green': '#10b981',
                    'oflem-cream': '#FDFBF7',
                    'cream-accent': '#F9F4EE',
                    'zinc-50': '#f7fafc',
                    'zinc-100': '#edf2f7',
                    'zinc-200': '#e2e8f0',
                    'zinc-500': '#718096',
                    'zinc-700': '#4a5568',
                    
                    // Legacy Aliases for stability
                    'primary-dark': '#1A1D3F',
                    'primary-accent': '#FF6B35',
                    'charcoal': '#1A1D3F',
                    'gray-muted': '#718096',
                    'gray-border': '#e2e8f0',
                },
                boxShadow: {
                    'sh': '0 8px 30px rgba(0,0,0,0.10)',
                    'sho': '0 8px 30px rgba(255,107,53,0.30)',
                    'elegant': '0 10px 40px -10px rgba(0,0,0,0.12), 0 0 20px rgba(0,0,0,0.03)',
                    'elegant-glow': '0 10px 40px -10px rgba(255,107,53,0.35), 0 0 20px rgba(255,107,53,0.1)',
                    'card': '0 8px 30px rgba(0,0,0,0.10)',
                    'btn-inner': '0 8px 30px rgba(255,107,53,0.30)',
                },
                transitionDuration: {
                    '400': '400ms',
                    '500': '500ms',
                },
                borderRadius: {
                    'r': '14px',
                    'rs': '10px',
                    'rl': '20px',
                }
        },
    },

    plugins: [forms],
};
