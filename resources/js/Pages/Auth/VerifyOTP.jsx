import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function VerifyOTP() {
    // Added default values to prevent destructuring errors
    const { email = '', phone = '' } = usePage().props;
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

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

    const sendOTP = (method) => {
        setSelectedMethod(method);
        setOtpSent(true);
        setTimeLeft(300);
        setCanResend(false);

        // Axios handles the CSRF token automatically 
        axios.post(route('auth.verify-otp.send'), { method })
            .then(response => {
                console.log('OTP sent successfully:', response.data.message);
            })
            .catch(error => {
                // Handle the error state if the server fails
                console.error('Error sending OTP:', error.response?.data?.message || error.message);
                setOtpSent(false); // Let them try to click the button again
            });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('auth.verify-otp'), {
            onSuccess: () => reset('code'),
        });
    };

    const handleCodeChange = (field, value) => {
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setData(field, numericValue);
    };

    return (
        <>
            <Head title="Verify Your Account" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-2xl space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Verify Your Account
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Please verify your identity to continue
                            </p>
                        </div>

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

                        <form onSubmit={submit} className="space-y-6">
                            {!otpSent ? (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Choose Verification Method</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Select how you'd like to receive your verification code</p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => sendOTP('email')}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Send code to email: {email}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => sendOTP('phone')}
                                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Send code to phone: {phone}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="text-center mb-4">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${selectedMethod === 'email' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                            {selectedMethod === 'email' ? (
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enter Verification Code</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Sent to: {selectedMethod === 'email' ? email : phone}
                                        </p>
                                    </div>

                                    <div>
                                        <input
                                            id="code"
                                            name="code"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            required
                                            value={data.code}
                                            onChange={(e) => handleCodeChange('code', e.target.value)}
                                            className="block w-full text-center text-2xl font-mono tracking-widest appearance-none rounded-lg border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                            onClick={() => sendOTP(selectedMethod)}
                                            disabled={!canResend}
                                            className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Resend code
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={processing || data.code.length !== 6 || !otpSent}
                                    className="inline-flex items-center px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Verifying...' : 'Verify Account'}
                                </button>
                            </div>

                            {errors.general && (
                                <div className="text-center text-red-600 text-sm">
                                    {errors.general}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </> 
    );
}