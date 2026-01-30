import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-oflem-cream pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-3xl font-black text-oflem-charcoal tracking-tight uppercase">Oflem</span>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-border/20 sm:max-w-md sm:rounded-[32px]">
                {children}
            </div>
        </div>
    );
}
