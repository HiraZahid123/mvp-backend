import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function VerifyLoginOTP() {
    const { email } = usePage().props;
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);
    const [otpSent, setOtpSent] = useState(true); // OTP is sent automatically when page loads

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const sendOTP = () => {
        setOtpSent(true);
        setTimeLeft(300);
        setCanResend(false);

        // Make AJAX call to resend OTP
        fetch(route('auth.verify-login-otp.send'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // OTP sent successfully
            }
        })
        .catch(error => {
            console.error('Error sending OTP:', error);
        });
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('auth.verify-login-otp'), {
            onSuccess: () => {
                // Redirect will be handled by controller
            },
        });
    };

    const handleCodeChange = (field, value) => {
        // Only allow numeric input and limit to 6 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setData(field, numericValue);
    };

    return (
        <>
            <Head title="Verify Login" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-2xl space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Verify Your Login
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                We've sent a verification code to confirm your identity
                            </p>
                        </div>

                        {/* Timer */}
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                    Time remaining: {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enter Verification Code</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Sent to: {email}
                                </p>
                            </div>

                                <div>
                                    <label htmlFor="code" className="sr-only">
                                        Verification code
                                    </label>
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        value={data.code}
                                        onChange={(e) => handleCodeChange('code', e.target.value)}
                                        className="block w-full text-center text-2xl font-mono tracking-widest appearance-none rounded-lg border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                    {errors.code && (
                                        <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                                    )}
                                </div>

                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => sendOTP()}
                                        disabled={!canResend}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Resend code
                                    </button>
                                </div>
                            </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                onClick={submit}
                                disabled={processing || data.code.length !== 6}
                                className="inline-flex items-center px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="text-center text-red-600 text-sm">
                                {errors.general}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Wrong account?{' '}
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className="text-indigo-600 hover:text-indigo-500"
                                >
                                    Sign out and try again
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
