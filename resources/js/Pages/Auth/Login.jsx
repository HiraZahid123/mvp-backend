import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import '../../../css/oflem-login.css';

export default function Login({ canResetPassword, status }) {
    const { t } = useTranslation();
    const [role, setRole] = useState(null); // 'client' | 'provider' | null

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title={t('auth.login.title')} />

            <div className="login-bg">
                {/* Animated background lines */}
                <div className="login-lines" aria-hidden="true">
                    <div className="login-line" />
                    <div className="login-line" />
                    <div className="login-line" />
                    <div className="login-line" />
                </div>

                <div className="login-card">
                    {/* Logo */}
                    <Link href={route('welcome')} className="login-logo">
                        Oflem<span>.</span>
                    </Link>

                    {/* Status message (e.g. password reset confirmation) */}
                    {status && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '12px 16px',
                            background: 'rgba(52, 211, 153, 0.1)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            borderRadius: '10px',
                            fontSize: '13px',
                            color: '#34d399',
                            fontWeight: 600,
                        }}>
                            {status}
                        </div>
                    )}

                    {/* Greeting */}
                    <div className="login-greeting">{t('auth.login.greeting')}</div>
                    <p className="login-sub">{t('auth.login.subtitle')}</p>

                    {/* Role choice cards */}
                    <div className="login-choice">
                        <button
                            type="button"
                            className={`login-choice-btn client-choice${role === 'client' ? ' active' : ''}`}
                            onClick={() => { setRole('client'); router.visit('/dashboard?role=client'); }}
                        >
                            <div className="login-choice-icon" style={{ background: 'rgba(255,107,53,.15)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,107,53,1)" strokeWidth="2" strokeLinecap="round">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="login-choice-title">{t('auth.login.client_space')}</div>
                            <div className="login-choice-sub">{t('auth.login.client_space_sub')}</div>
                        </button>

                        <button
                            type="button"
                            className={`login-choice-btn provider-choice${role === 'provider' ? ' active' : ''}`}
                            onClick={() => { setRole('provider'); router.visit('/dashboard?role=provider'); }}
                        >
                            <div className="login-choice-icon" style={{ background: 'rgba(102,126,234,.15)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(102,126,234,1)" strokeWidth="2" strokeLinecap="round">
                                    <path d="M14.7 6.3a1 1 0 00 0 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0z"/>
                                    <path d="M5 1v1m0 8v1m4-5h1M9 5H8M7 3L6 4M3 7l-1 1m5-1 1 1"/>
                                    <path d="M2 12a5 5 0 005 5l4 4 4-4a5 5 0 000-7"/>
                                </svg>
                            </div>
                            <div className="login-choice-title">{t('auth.login.provider_space')}</div>
                            <div className="login-choice-sub">{t('auth.login.provider_space_sub')}</div>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="login-divider">
                        <div className="login-divider-line" />
                        <div className="login-divider-text">{t('auth.login.manual_divider')}</div>
                        <div className="login-divider-line" />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit}>
                        <div className="login-field">
                            <label htmlFor="login-email">{t('auth.login.email_label')}</label>
                            <input
                                id="login-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder={t('auth.login.email_placeholder')}
                                autoComplete="email"
                                required
                            />
                            {errors.email && (
                                <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-password">{t('auth.login.password_label')}</label>
                            <input
                                id="login-password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t('auth.login.password_placeholder')}
                                autoComplete="current-password"
                                required
                            />
                            {errors.password && (
                                <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {canResetPassword && (
                            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                                <Link
                                    href={route('password.request')}
                                    style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', fontWeight: 600, textDecoration: 'none' }}
                                    onMouseOver={e => e.target.style.color = 'rgba(255,255,255,.7)'}
                                    onMouseOut={e => e.target.style.color = 'rgba(255,255,255,.4)'}
                                >
                                    {t('auth.login.forgot_password')}
                                </Link>
                            </div>
                        )}

                        <button type="submit" className="login-submit" disabled={processing}>
                            {processing ? '...' : t('auth.login.button')}
                        </button>
                    </form>

                    {/* Back link */}
                    <Link href={route('welcome')} className="login-back">
                        ← {t('auth.login.back_to_home')}
                    </Link>

                    {/* Trust badges */}
                    <div className="login-trust">
                        <div className="login-trust-item">
                            <div className="login-trust-dot" />
                            {t('auth.login.encrypted_connection')}
                        </div>
                        <div className="login-trust-item">
                            <div className="login-trust-dot" />
                            {t('auth.login.data_in_switzerland')}
                        </div>
                        <div className="login-trust-item">
                            <div className="login-trust-dot" />
                            {t('auth.login.nlpd_compliant')}
                        </div>
                    </div>

                    {/* Register link */}
                    <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,.3)', marginTop: '24px' }}>
                        {t('auth.login.no_account')}{' '}
                        <Link
                            href={route('register')}
                            style={{ color: 'rgba(255,107,53,.8)', fontWeight: 700, textDecoration: 'none' }}
                        >
                            {t('auth.login.sign_up')}
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
