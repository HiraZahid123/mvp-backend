import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const currentPath = window.location.pathname;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Withdrawals', href: '/admin/withdrawals', icon: '💰' },
        { name: 'Missions', href: '/admin/missions', icon: '📋' },
    ];

    return (
        <div className="min-h-screen bg-oflem-cream font-sans flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                className="w-64 bg-oflem-charcoal text-white fixed h-full shadow-2xl z-50"
            >
                <div className="p-6">
                    <Link href="/" className="flex items-center space-x-2 mb-8">
                        <span className="text-3xl font-black text-oflem-terracotta">OFLEM</span>
                        <span className="text-xs bg-oflem-terracotta text-white px-2 py-1 rounded-full font-bold">ADMIN</span>
                    </Link>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                    currentPath === item.href
                                        ? 'bg-oflem-terracotta text-white shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="font-bold">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-6 border-t border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-oflem-terracotta flex items-center justify-center text-white font-black">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{auth.user.name}</p>
                            <p className="text-xs text-gray-400">Super Admin</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-all"
                    >
                        Logout
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
