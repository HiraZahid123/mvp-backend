import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import axios from 'axios';
import '../../../css/oflem-home.css';
import '../../../css/oflem-register.css';

export default function VerifyOTP({ email = 'votre@email.ch' }) {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);
    const [resendStatus, setResendStatus] = useState(null); // 'sending', 'sent'

    const { data, setData, post, processing, errors, setError } = useForm({
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
        setResendStatus('sending');
        
        axios.post(route('auth.verify-otp.send'), { method: 'email' })
            .then(response => {
                setResendStatus('sent');
                setTimeout(() => setResendStatus(null), 5000);
            })
            .catch(error => {
                setResendStatus(null);
                const message = error.response?.data?.message || 'Failed to resend code';
                setError('code', message);
            });
    };

    return (
        <div className="oflem-home-page" style={{ background: 'var(--g50)', minHeight: '100vh' }}>
            <Head title={t('onboarding.otp_title')} />

            <header className="oflem-header" style={{ background: '#fff' }}>
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                        <Link href={route('register')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                    </nav>
                </div>
            </header>

            <section className="oflem-section" style={{ paddingTop: '50px', paddingBottom: '80px' }}>
                <div className="oflem-container animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ maxWidth: '540px', textAlign: 'center' }}>
                    
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--o),var(--ol))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 30px var(--og)', border: '4px solid #fff' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <polyline points="22 4 12 13 2 4"/>
                        </svg>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
                            {t('onboarding.otp_sent_to')} <strong style={{ color: 'var(--n)', fontWeight: 800 }}>{email}</strong>
                        </p>
                    </div>

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
                                    style={{ width: '52px', height: '62px', textAlign: 'center', fontPadding: '0', fontSize: '24px', fontWeight: 900, border: '2px solid var(--g300)', borderRadius: 'var(--rs)', transition: 'all .25s', background: '#fff', outline: 'none' }}
                                />
                            ))}
                        </div>

                        {(errors.code || errors.general) && (
                            <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '24px', fontWeight: 'bold', background: '#fff5f5', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '12px 16px' }}>
                                {errors.code || errors.general}
                            </div>
                        )}

                        {resendStatus === 'sent' && (
                            <div style={{ color: '#059669', fontSize: '13px', marginBottom: '24px', fontWeight: 'bold', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '12px 16px' }}>
                                {t('onboarding.otp_resent_alert')}
                            </div>
                        )}

                        <button type="submit" className="oflem-btn-primary" style={{ width: '100%', fontSize: '17px', padding: '18px', borderRadius: '12px', fontWeight: 900, border: 'none', cursor: 'pointer', transition: 'all .25s' }} disabled={processing || data.code.length !== 6}>
                            {processing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : t('onboarding.otp_verify_btn')}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--g500)' }}>
                            {t('onboarding.otp_not_received')} <a onClick={resendCode} style={{ color: 'var(--o)', fontWeight: 800, cursor: 'pointer' }}>{t('onboarding.otp_resend')}</a>
                        </p>
                    </form>

                    {/* Trust Indicators */}
                    <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', opacity: 0.7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--g500)' }}>
                            <span style={{ fontSize: '16px' }}>🇨🇭</span> {t('auth.login.data_in_switzerland')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--g500)' }}>
                            <span style={{ fontSize: '16px' }}>🔒</span> {t('auth.login.encrypted_connection')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--g500)' }}>
                            <span style={{ fontSize: '16px' }}>✓</span> {t('auth.login.nlpd_compliant')}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
