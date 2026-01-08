import { Link } from '@inertiajs/react';
import React from 'react';

export default function BackButton({ href, className = '', children = 'Back' }) {
    return (
        <Link
            href={href}
            className={`flex items-center text-gray-muted font-black text-sm hover:text-primary-black transition-colors group ${className}`}
        >
            <svg
                className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                />
            </svg>
            {children}
        </Link>
    );
}
