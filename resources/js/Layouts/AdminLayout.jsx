import React from 'react';
import Header from '@/Components/Header';

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-oflem-cream font-sans">
            <Header />
            
            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
