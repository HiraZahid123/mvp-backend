import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to Oflem" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        {/* Logo/Brand */}
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Oflem
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Connect with performers in your area
                            </p>
                        </div>

                        {/* Main Actions */}
                        <div className="space-y-4">
                            <Link
                                href={route('auth.select-role')}
                                className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Get Started
                            </Link>

                            <Link
                                href={route('login')}
                                className="group relative flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Admin Access */}
                        <div className="text-center">
                            <Link
                                href={route('admin.login')}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Admin Access
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
