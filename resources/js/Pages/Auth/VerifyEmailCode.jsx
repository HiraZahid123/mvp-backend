import React, { useState, useEffect } from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function VerifyEmailCode({ email }) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
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
            setTimeout(() => {
                handleSubmit(fullCode);
            }, 100);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    };

    const handleSubmit = (codeValue = null) => {
        const finalCode = codeValue || code.join('');
        post(route('auth.verify-email-code.store'), {
            data: {
                email: email,
                code: finalCode,
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
            heroImage="/verify-email-code.svg"
            bgAccentClass="bg-cream-accent"
        >
            <Head title="Vérifier l'email" />

            <div className="text-center mb-8">
                <h1 className="text-[32px] lg:text-[40px] font-serif font-bold text-primary-black tracking-tight mb-3 leading-tight">
                    Vérifiez votre email
                </h1>
                <p className="text-gray-muted text-base font-medium">
                    Nous avons envoyé un code à <span className="font-bold text-primary-black">{email}</span>
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
                                className="
                                    w-12 h-14 lg:w-14 lg:h-16
                                    text-center text-2xl font-bold
                                    bg-input-bg border-2 border-gray-border/50
                                    rounded-[16px]
                                    text-primary-black
                                    focus:outline-none focus:ring-2 focus:ring-gold-accent/30 focus:border-gold-accent
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
                            className="text-sm font-bold text-gold-accent hover:underline disabled:opacity-50"
                        >
                            {resending ? 'Envoi...' : 'Renvoyer le code'}
                        </button>
                    ) : (
                        <p className="text-sm text-gray-muted font-medium">
                            Renvoyer le code dans <span className="font-bold text-primary-black">{timeLeft}s</span>
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <PrimaryButton 
                    className="w-full" 
                    disabled={processing || code.join('').length !== 6}
                >
                    {processing ? 'Vérification...' : 'Vérifier'}
                </PrimaryButton>
            </form>

            <div className="mt-6 p-4 bg-gold-accent/5 rounded-[24px] border border-gold-accent/20">
                <p className="text-xs text-gray-muted text-center">
                    Le code expirera dans <span className="font-bold text-primary-black">10 minutes</span>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
