import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import axios from 'axios';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

export default function VerifyOTP() {
    const { t } = useTranslation();
    const { email = '', phone = '' } = usePage().props;
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    useEffect(() => {
        if (otpSent && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setCanResend(true);
        }
    }, [otpSent, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const sendOTP = (method) => {
        setSelectedMethod(method);
        setOtpSent(true);
        setTimeLeft(30);
        setCanResend(false);

        axios.post(route('auth.verify-otp.send'), { method })
            .catch(() => setOtpSent(false));
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        
        if (!pastedData) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        
        setOtp(newOtp);
        setData('code', newOtp.join(''));

        const nextIndex = Math.min(pastedData.length, 5);
        const element = document.getElementById(`otp-${nextIndex}`);
        if (element) element.focus();
    };

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setData('code', newOtp.join(''));

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('auth.verify-otp'));
    };

    return (
        <AuthSplitLayout 
            heroImage={!otpSent ? "/images/illustrations/otp-selection.svg" : "/images/illustrations/otp-verify.svg"}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Verify OTP')} />
            
            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                <BackButton 
                    href={otpSent ? "#" : route('login')} 
                    onClick={otpSent ? (e) => { e.preventDefault(); setOtpSent(false); } : undefined}
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black tracking-tight mb-2">
                    {!otpSent ? t("One small code to go") : t("Almost done")}
                </h1>
                <p className="text-gray-muted text-sm font-medium">
                    {!otpSent 
                        ? t("We'll send you a code by email to continue.")
                        : t("Enter the code received by email.")}
                </p>
            </div>

            <div className="space-y-6">
                {!otpSent ? (
                    <div className="space-y-4">
                        <div
                            onClick={() => setSelectedMethod('email')}
                            className={`p-5 bg-white border rounded-[24px] cursor-pointer transition-all flex items-center justify-between group ${
                                selectedMethod === 'email' ? 'border-gold-accent ring-1 ring-gold-accent' : 'border-gray-border hover:border-gold-accent'
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-cream-accent flex items-center justify-center text-gold-accent transition-colors group-hover:bg-gold-accent group-hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-black text-primary-black">{t('Send code to email :')}</h3>
                                    <p className="text-sm text-gray-muted font-bold">{email}</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedMethod === 'email' ? 'border-gold-accent' : 'border-gray-border group-hover:border-gold-accent'
                            }`}>
                                <div className={`w-3 h-3 rounded-full transition-colors ${
                                    selectedMethod === 'email' ? 'bg-gold-accent' : 'bg-transparent'
                                }`}></div>
                            </div>
                        </div>

                        <div
                            onClick={() => setSelectedMethod('phone')}
                            className={`p-5 bg-white border rounded-[24px] cursor-pointer transition-all flex items-center justify-between group ${
                                selectedMethod === 'phone' ? 'border-gold-accent ring-1 ring-gold-accent' : 'border-gray-border hover:border-gold-accent'
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-cream-accent flex items-center justify-center text-gold-accent transition-colors group-hover:bg-gold-accent group-hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-black text-primary-black">{t('Send code to phone number :')}</h3>
                                    <p className="text-sm text-gray-muted font-bold">{phone}</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedMethod === 'phone' ? 'border-gold-accent' : 'border-gray-border group-hover:border-gold-accent'
                            }`}>
                                <div className={`w-3 h-3 rounded-full transition-colors ${
                                    selectedMethod === 'phone' ? 'bg-gold-accent' : 'bg-transparent'
                                }`}></div>
                            </div>
                        </div>

                        <PrimaryButton 
                            onClick={() => sendOTP(selectedMethod)}
                            disabled={!selectedMethod}
                            processing={false}
                            className="w-full mt-6"
                        >
                            {t('Verify Account')}
                        </PrimaryButton>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                             <p className="text-primary-black font-black text-center">{selectedMethod === 'email' ? email : phone}</p>
                        </div>

                        <form onSubmit={submit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-primary-black block text-center">{t('Enter the code received by email.')}</label>
                                <div className="flex justify-between gap-1 sm:gap-2 max-w-sm mx-auto">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target.value, index)}
                                            onPaste={handlePaste}
                                            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-black bg-input-bg border border-gray-border focus:ring-1 focus:ring-gold-accent focus:border-gold-accent rounded-full outline-none transition-all"
                                        />
                                    ))}
                                </div>
                            </div>

                            <InputError message={errors.code} className="text-center ml-0" />

                            <PrimaryButton
                                type="submit"
                                disabled={processing || data.code.length !== 6}
                                processing={processing}
                                className="w-full"
                            >
                                {t('Verify Code')}
                            </PrimaryButton>

                            <div className="text-center space-y-4">
                                <p className="text-sm text-gray-muted font-bold">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-gray-muted">{t("Didn't receive code?")}</span>
                                        <button
                                            type="button"
                                            onClick={() => sendOTP(selectedMethod)}
                                            disabled={timeLeft > 0}
                                            className={`font-black transition-colors ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-black underline hover:text-gold-accent'}`}
                                        >
                                            {timeLeft > 0 ? (
                                                <>
                                                    <span className="hidden lg:inline">{t('Resend Code in')} {formatTime(timeLeft)}</span>
                                                    <span className="lg:hidden">{t('Resend in')} {formatTime(timeLeft)}</span>
                                                </>
                                            ) : (
                                                t('Resend Code')
                                            )}
                                        </button>
                                    </div>
                                </p>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setOtpSent(false)} 
                                    className="text-xs text-gray-muted font-black hover:text-primary-black transition-colors"
                                >
                                    {t('Change Method')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </AuthSplitLayout>
    );
}