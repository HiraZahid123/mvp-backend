import React, { useState, useEffect } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import useTranslation from '@/Hooks/useTranslation';

export default function VerifyEmailCode({ email }) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const { t } = useTranslation();

    const { data: formData, setData, post, processing, errors } = useForm({
        email: email,
        code: '',
    });

    const { post: resendPost, processing: resending } = useForm({
        email: email,
    });

    // Timer for resend
    useEffect(() => {
        if (timeLeft === 0) {
            setCanResend(true);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleCodeChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Only take last digit
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }

        // Auto-submit when all 6 digits are entered
        const fullCode = newCode.join('');
        if (fullCode.length === 6) {
            setData('code', fullCode);
            // Submit immediately when 6 digits are reached
            handleSubmit(fullCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);

        // Auto-submit if we have 6 digits
        if (pastedData.length === 6) {
            setData('code', pastedData);
            handleSubmit(pastedData);
        } else {
            // Focus the next empty input
            const nextIndex = pastedData.length;
            if (nextIndex < 6) {
                document.getElementById(`code-${nextIndex}`)?.focus();
            }
        }
    };

    const handleSubmit = (codeValue = null) => {
        const finalCode = codeValue || code.join('');
        if (finalCode.length !== 6) return;

        // Use router.post directly to avoid async state issues
        router.post(route('auth.verify-email-code.store'), {
            email: email,
            code: finalCode,
        }, {
            preserveState: false,
            onSuccess: () => {
                // Success redirect handled by Inertia
            },
            onError: (errors) => {
                console.error('Verification failed:', errors);
            },
        });
    };

    const handleResend = () => {
        resendPost(route('auth.verify-email-code.resend'), {
            onSuccess: () => {
                setTimeLeft(30);
                setCanResend(false);
            },
        });
    };

    return (
        <AuthSplitLayout 
            heroImage="/images/illustrations/verify-email.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Verify Email")} />

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-oflem-charcoal tracking-tight mb-3 leading-tight">
                    {t("Verify your email")}
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    {t("We've sent a code to ")}<span className="font-bold text-oflem-charcoal">{email}</span>
                </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
                {/* 6-Digit Code Input */}
                <div>
                    <div className="flex justify-center gap-2 lg:gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="
                                    w-12 h-14 lg:w-14 lg:h-16
                                    text-center text-2xl font-bold
                                    bg-input-bg border-2 border-gray-border/50
                                    rounded-[16px]
                                    text-oflem-charcoal
                                    focus:outline-none focus:ring-2 focus:ring-oflem-terracotta/30 focus:border-oflem-terracotta
                                    transition-all duration-200
                                "
                            />
                        ))}
                    </div>
                    <InputError message={errors.code} className="mt-3 text-center" />
                </div>

                {/* Resend Code */}
                <div className="text-center">
                    {canResend ? (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="text-sm font-bold text-oflem-terracotta hover:underline disabled:opacity-50"
                        >
                            {resending ? t('Sending...') : t('Resend code')}
                        </button>
                    ) : (
                        <p className="text-sm text-gray-muted font-medium">
                            {t("Resend code in ")}<span className="font-bold text-oflem-charcoal">{timeLeft}s</span>
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <PrimaryButton 
                    className="w-full" 
                    disabled={processing || code.join('').length !== 6}
                    processing={processing}
                >
                    {t('Verify')}
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/5 rounded-[24px] border border-oflem-terracotta/20">
                <p className="text-xs text-gray-muted text-center">
                    {t("The code will expire in ")}<span className="font-bold text-oflem-charcoal">{t("10 minutes")}</span>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
