import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function SelectRole({ intended }) {
    const [selectedRole, setSelectedRole] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        role: '',
        intended: intended || null,
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData('role', role);
    };

    const handleContinue = () => {
        post(route('auth.select-role.store'), {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    const roles = [
        {
            id: 'customer',
            title: 'I\'m a Customer',
            description: 'I want to find and book performers for events',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            color: 'blue',
        },
        {
            id: 'performer',
            title: 'I\'m a Performer',
            description: 'I want to showcase my talents and get bookings',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            color: 'purple',
        },
        {
            id: 'both',
            title: 'I\'m Both',
            description: 'I perform and also book performers for events',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'green',
        },
    ];

    const getCardClasses = (roleId) => {
        const isSelected = selectedRole === roleId;
        const baseClasses = "relative p-6 bg-white border-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer";

        if (isSelected) {
            return `${baseClasses} border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200`;
        }

        return `${baseClasses} border-gray-200 hover:border-gray-300`;
    };

    const getIconClasses = (roleId) => {
        const isSelected = selectedRole === roleId;
        return `flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
        }`;
    };

    return (
        <>
            <Head title="Select Your Role" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-2xl space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                How would you like to use Oflem?
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Choose your role to get started
                            </p>
                        </div>

                        {/* Role Selection Cards */}
                        <div className="grid gap-4 md:grid-cols-1">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={getCardClasses(role.id)}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={getIconClasses(role.id)}>
                                            {role.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {role.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {role.description}
                                            </p>
                                        </div>
                                        {selectedRole === role.id && (
                                            <div className="flex-shrink-0">
                                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Continue Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleContinue}
                                disabled={!selectedRole || processing}
                                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Please wait...' : 'Continue'}
                            </button>
                        </div>

                        {/* Back Link */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ← Back to home
                            </Link>
                        </div>

                        {errors.role && (
                            <div className="text-center text-red-600 text-sm">
                                {errors.role}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
