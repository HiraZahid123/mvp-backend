import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import '../../../css/oflem-home.css';
import '../../../css/oflem-register.css';
import OnboardingProgressBar from '@/Components/OnboardingProgressBar';

export default function ClientRegister() {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        city: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        age_confirmed: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register.client.post'));
    };

    const inputStyle = { width: '100%', padding: '16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '16px', boxSizing: 'border-box' };
    const labelStyle = { fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' };
    const errorStyle = { fontSize: '12px', color: '#e53e3e', marginTop: '6px', display: 'block' };

    const swissCities = ['Genève', 'Lausanne', 'Fribourg', 'Neuchâtel', 'Sion', 'Montreux', 'Nyon', 'Morges', 'Vevey', 'Yverdon-les-Bains'];

    return (
        <div className="oflem-home-page" style={{ background: 'var(--g50)', minHeight: '100vh' }}>
            <Head title={t('onboarding.client_title')} />

            <header className="oflem-header" style={{ background: '#fff' }}>
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                        <Link href={route('welcome')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                    </nav>
                </div>
            </header>

            <section className="oflem-section" style={{ paddingTop: '50px', paddingBottom: '80px' }}>
                <div className="oflem-container animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ maxWidth: '600px' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <OnboardingProgressBar step={2} />
                        <h2 className="section-title" style={{ fontSize: '36px' }}>{t('onboarding.create_account')}</h2>
                        <p style={{ color: 'var(--g500)', fontSize: '15px' }}>{t('onboarding.register_subtitle')}</p>
                    </div>

                    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '40px', boxShadow: 'var(--sh)' }}>

                        {/* Name Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <label htmlFor="client-first-name" style={labelStyle}>{t('onboarding.first_name')}</label>
                                <input
                                    type="text"
                                    id="client-first-name"
                                    required
                                    placeholder={t('onboarding.first_name_placeholder')}
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.first_name && <span style={errorStyle}>{errors.first_name}</span>}
                            </div>
                            <div>
                                <label htmlFor="client-last-name" style={labelStyle}>{t('onboarding.last_name')}</label>
                                <input
                                    type="text"
                                    id="client-last-name"
                                    required
                                    placeholder={t('onboarding.last_name_placeholder')}
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.last_name && <span style={errorStyle}>{errors.last_name}</span>}
                            </div>
                        </div>

                        {/* City */}
                        <div style={{ marginBottom: '24px' }}>
                            <label htmlFor="client-city" style={labelStyle}>{t('onboarding.main_city')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                            <select
                                id="client-city"
                                value={data.city}
                                onChange={e => setData('city', e.target.value)}
                                style={{ ...inputStyle, background: '#fff' }}
                            >
                                <option value="">{t('onboarding.select')}</option>
                                {swissCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.city && <span style={errorStyle}>{errors.city}</span>}
                        </div>

                        {/* Email and Phone - Stacked for better readability */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label htmlFor="client-email" style={labelStyle}>{t('onboarding.email')}</label>
                                <input 
                                    type="email" 
                                    id="client-email" 
                                    required 
                                    placeholder={t('onboarding.email_placeholder')} 
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    style={inputStyle} 
                                />
                                {errors.email && <span style={errorStyle}>{errors.email}</span>}
                            </div>
                            <div>
                                <label htmlFor="client-phone" style={labelStyle}>{t('onboarding.phone')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                    <span style={{ padding: '0 12px', background: 'var(--g50)', border: '2px solid var(--g300)', borderRight: 'none', borderRadius: 'var(--rs) 0 0 var(--rs)', fontSize: '15px', fontWeight: 700, color: 'var(--g500)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>🇨🇭 +41</span>
                                    <input 
                                        type="tel" 
                                        id="client-phone" 
                                        placeholder="79 123 45 67" 
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        maxLength="14" 
                                        style={{ flex: 1, padding: '16px', border: '2px solid var(--g300)', borderLeft: 'none', borderRadius: '0 var(--rs) var(--rs) 0', fontSize: '16px', minWidth: 0 }} 
                                    />
                                </div>
                                {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                            </div>
                        </div>

                        {/* Password Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div>
                                <label htmlFor="client-password" style={labelStyle}>{t('onboarding.password')}</label>
                                <input 
                                    type="password" 
                                    id="client-password" 
                                    required 
                                    minLength="8" 
                                    placeholder={t('onboarding.pass_hint')} 
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.password && <span style={errorStyle}>{errors.password}</span>}
                            </div>
                            <div>
                                <label htmlFor="client-password-confirmation" style={labelStyle}>{t('onboarding.confirm_password')}</label>
                                <input 
                                    type="password" 
                                    id="client-password-confirmation" 
                                    required 
                                    placeholder="••••••••" 
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.password_confirmation && <span style={errorStyle}>{errors.password_confirmation}</span>}
                            </div>
                        </div>

                        {/* Age & Terms */}
                        <div style={{ marginBottom: '32px', background: 'var(--g50)', padding: '20px', borderRadius: '16px', border: '1px solid var(--g100)' }}>
                            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    id="client-age" 
                                    required 
                                    checked={data.age_confirmed}
                                    onChange={e => setData('age_confirmed', e.target.checked)}
                                    style={{ marginTop: '4px', accentColor: 'var(--o)', width: '20px', height: '20px', flexShrink: 0 }} 
                                />
                                <span style={{ fontSize: '13px', color: 'var(--g700)', lineHeight: 1.6 }}>
                                    {t('onboarding.age_start')} <strong>{t('onboarding.age_confirmed')}</strong> {t('onboarding.age_end')}
                                </span>
                            </label>
                        </div>

                        {errors.general && (
                            <div style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '20px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '12px', padding: '12px 16px' }}>
                                {errors.general}
                            </div>
                        )}

                        <button type="submit" className="oflem-btn-primary" style={{ width: '100%', fontSize: '18px', padding: '20px', borderRadius: '999px', fontWeight: 900, border: 'none', cursor: 'pointer', transition: 'all .2s' }} disabled={processing}>
                            {processing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : t('onboarding.create_account_btn')}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--g500)', marginTop: '20px' }}>
                            {t('onboarding.terms_start')} <a href="#" style={{ color: 'var(--o)', fontWeight: 700, textDecoration: 'underline' }}>{t('onboarding.cgu')}</a> {t('onboarding.terms_and')} <a href="#" style={{ color: 'var(--o)', fontWeight: 700, textDecoration: 'underline' }}>{t('onboarding.privacy')}</a>.
                        </p>
                        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--g500)', marginTop: '24px' }}>
                            {t('auth.login.already_have_account') || "Vous avez déjà un compte ?"}{' '}
                            <Link
                                href={route('login')}
                                style={{ color: 'var(--o)', fontWeight: 700, textDecoration: 'none' }}
                            >
                                {t('auth.login.title') || "Se connecter"}
                            </Link>
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
