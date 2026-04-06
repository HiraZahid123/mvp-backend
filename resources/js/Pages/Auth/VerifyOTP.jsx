import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import '../../../css/oflem-home.css';
import '../../../css/oflem-register.css';

export default function VerifyOTP({ email = 'votre@email.ch' }) {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setData('code', newOtp.join(''));

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
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
        inputs.current[nextIndex].focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('auth.verify-otp.store'));
    };

    const resendCode = () => {
        router.post(route('auth.verify-otp.send'), {}, {
            onSuccess: () => alert(t('onboarding.otp_resent_alert')),
        });
    };

    return (
        <div className="oflem-home-page">
            <Head title={t('onboarding.otp_title')} />

            <header className="oflem-header">
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                        <Link href={route('register')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                    </nav>
                </div>
            </header>

            <section className="oflem-section" style={{ paddingTop: '50px' }}>
                <div className="oflem-container" style={{ maxWidth: '480px', textAlign: 'center' }}>
                    
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--o),var(--ol))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 30px var(--og)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <polyline points="22 4 12 13 2 4"/>
                        </svg>
                    </div>

                    <div className="progress-bar-wrap" style={{ marginBottom: '16px' }}>
                        <div className="progress-step-item">
                            <div className="progress-step-circle done">✓</div>
                            <div className="progress-step-label">{t('onboarding.your_request')}</div>
                        </div>
                        <div className="progress-connector done"></div>
                        <div className="progress-step-item">
                            <div className="progress-step-circle done">✓</div>
                            <div className="progress-step-label">{t('onboarding.your_account')}</div>
                        </div>
                        <div className="progress-connector done"></div>
                        <div className="progress-step-item">
                            <div className="progress-step-circle active">3</div>
                            <div className="progress-step-label active">{t('onboarding.verification')}</div>
                        </div>
                    </div>

                    <h2 className="oflem-section-title" style={{ fontSize: '32px' }}>{t('onboarding.otp_verify_email')}</h2>
                    <p style={{ color: 'var(--g500)', fontSize: '15px', marginBottom: '30px' }}>
                        {t('onboarding.otp_sent_to')} <strong style={{ color: 'var(--n)' }}>{email}</strong>
                    </p>

                    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    inputMode="numeric"
                                    className="otp-digit"
                                    value={digit}
                                    ref={el => inputs.current[index] = el}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onPaste={handlePaste}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    style={{ width: '52px', height: '62px', textAlign: 'center', fontSize: '24px', fontWeight: 900, border: '2px solid var(--g300)', borderRadius: 'var(--rs)', transition: 'all .25s' }}
                                />
                            ))}
                        </div>

                        {(errors.code || errors.general) && (
                            <div style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px' }}>
                                {errors.code || errors.general}
                            </div>
                        )}

                        <button type="submit" className="oflem-btn oflem-btn-primary" style={{ width: '100%', fontSize: '17px', padding: '18px' }} disabled={processing || data.code.length !== 6}>
                            {processing ? '...' : t('onboarding.otp_verify_btn')}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--g500)' }}>
                            {t('onboarding.otp_not_received')} <a onClick={resendCode} style={{ color: 'var(--o)', fontWeight: 700, cursor: 'pointer' }}>{t('onboarding.otp_resend')}</a>
                        </p>
                    </form>

                </div>
            </section>
        </div>
    );
}
