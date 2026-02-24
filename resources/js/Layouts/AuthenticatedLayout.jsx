import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ 
    header, 
    children, 
    maxWidth = 'max-w-7xl', 
    paddingY = 'py-10',
    showFooter = false 
}) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-oflem-cream font-sans flex flex-col">
            <Header />

            {header && (
                <header className="bg-white border-b border-gray-border h-16 flex items-center shrink-0">
                    <div className={`mx-auto ${maxWidth} px-4 sm:px-6 lg:px-8 w-full`}>
                        <div className="text-xl font-black text-oflem-charcoal tracking-tight uppercase">{header}</div>
                    </div>
                </header>
            )}

            <main className={`flex-1 ${paddingY}`}>
                <div className={`mx-auto ${maxWidth} px-4 sm:px-6 lg:px-8`}>
                    {children}
                </div>
            </main>

            {showFooter && <Footer />}
        </div>
    );
}
