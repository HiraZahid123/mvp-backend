import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import axios from 'axios';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

export default function VerifyLoginOTP() {
    const { t } = useTranslation();
    const { email = '' } = usePage().props;
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const resendOTP = () => {
        setTimeLeft(30);
        setCanResend(false);
        axios.post(route('login.verify-otp.resend'))
            .catch(() => {});
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
        post(route('login.verify-otp.store'));
    };

    return (
        <AuthSplitLayout 
            heroImage="/otp-verify-code.svg"
            heroHeading={t("Security First")}
            heroSubtext={t("Enter the 6-digit code sent to your email to securely log in.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('Verify Login')} />
            
            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                <BackButton 
                    href={route('login')} 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Oflem')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black tracking-tight mb-2">
                    {t("Verify Login")}
                </h1>
                <p className="text-gray-muted text-sm font-medium">
                    {t("Enter the code received by email.")}
                </p>
            </div>

            <div className="space-y-6">
                <div className="mb-6">
                     <p className="text-primary-black font-black text-center">{email}</p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-primary-black block text-center">{t('One-time password')}</label>
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

                    <InputError message={errors.code || errors.general} className="text-center ml-0" />

                    <PrimaryButton
                        type="submit"
                        disabled={processing || data.code.length !== 6}
                        processing={processing}
                        className="w-full"
                    >
                        {t('Log In')}
                    </PrimaryButton>

                    <div className="text-center">
                        <p className="text-sm text-gray-muted font-bold">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-gray-muted">{t("Didn't receive code?")}</span>
                                <button
                                    type="button"
                                    onClick={resendOTP}
                                    disabled={!canResend}
                                    className={`font-black transition-colors ${!canResend ? 'text-gray-400 cursor-not-allowed' : 'text-primary-black underline hover:text-gold-accent'}`}
                                >
                                    {!canResend ? (
                                        <>
                                            <span className="hidden lg:inline">{t('Resend in')} {formatTime(timeLeft)}</span>
                                            <span className="lg:hidden">{t('Resend in')} {formatTime(timeLeft)}</span>
                                        </>
                                    ) : (
                                        t('Resend Code')
                                    )}
                                </button>
                            </div>
                        </p>
                    </div>
                </form>
            </div>
        </AuthSplitLayout>
    );
}
