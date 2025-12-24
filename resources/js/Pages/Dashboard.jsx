import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    const getDashboardContent = () => {
        switch (user.role_type) {
            case 'customer':
                return <CustomerDashboard user={user} />;
            case 'performer':
                return <PerformerDashboard user={user} />;
            case 'both':
                return <BothDashboard user={user} />;
            default:
                return <DefaultDashboard user={user} />;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {getDashboardContent()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function CustomerDashboard({ user }) {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h3>
                <p className="text-blue-100">Ready to find amazing performers in your area?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Find Performers</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Discover talent in your area</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Book Events</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule performances</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">View Analytics</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Track your bookings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h4>
                    <p className="text-gray-500 dark:text-gray-400">No recent activity yet. Start by finding performers!</p>
                </div>
            </div>
        </div>
    );
}

function PerformerDashboard({ user }) {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h3>
                <p className="text-green-100">Ready to showcase your talent and get more bookings?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Update Profile</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Showcase your skills</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">View Bookings</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your schedule</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Earnings</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Track your income</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Reviews</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">$0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Earnings</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BothDashboard({ user }) {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h3>
                <p className="text-purple-100">Manage your bookings and showcase your talent</p>
            </div>

            {/* Dual Role Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">As a Customer</h4>
                    <div className="space-y-3">
                        <div className="flex items-center text-sm">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find Performers
                        </div>
                        <div className="flex items-center text-sm">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Book Events
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">As a Performer</h4>
                    <div className="space-y-3">
                        <div className="flex items-center text-sm">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Update Profile
                        </div>
                        <div className="flex items-center text-sm">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View Schedule
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Bookings Made</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Performances</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Reviews</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-pink-600">$0</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Spent/Earned</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DefaultDashboard({ user }) {
    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900 dark:text-gray-100">
                <h3 className="text-lg font-medium mb-2">Welcome to Oflem!</h3>
                <p>You're logged in as {user.name}. Your account setup is complete.</p>
            </div>
        </div>
    );
}
