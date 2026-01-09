import { usePage } from '@inertiajs/react';
import React from 'react';

export default function MinimalAuthenticatedLayout({ children }) {
    return (
        <div className="h-screen bg-off-white-bg font-sans flex flex-col">
            {children}
        </div>
    );
}
