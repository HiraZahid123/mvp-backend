import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import '../../../css/oflem-home.css';
import '../../../css/oflem-register.css';

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
        <div className="oflem-home-page">
            <Head title={t('onboarding.client_title')} />

            <header className="oflem-header">
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                        <Link href={route('welcome')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                    </nav>
                </div>
            </header>

            <section className="oflem-section" style={{ paddingTop: '50px' }}>
                <div className="oflem-container" style={{ maxWidth: '520px' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div className="progress-bar-wrap">
                            <div className="progress-step-item">
                                <div className="progress-step-circle done">✓</div>
                                <div className="progress-step-label">{t('onboarding.your_request')}</div>
                            </div>
                            <div className="progress-connector done"></div>
                            <div className="progress-step-item">
                                <div className="progress-step-circle active">2</div>
                                <div className="progress-step-label active">{t('onboarding.your_account')}</div>
                            </div>
                            <div className="progress-connector"></div>
                            <div className="progress-step-item">
                                <div className="progress-step-circle">3</div>
                                <div className="progress-step-label">{t('onboarding.verification')}</div>
                            </div>
                        </div>
                        <h2 className="oflem-section-title" style={{ fontSize: '36px' }}>{t('onboarding.create_account')}</h2>
                    </div>

                    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)' }}>

                        {/* Name Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label htmlFor="client-first-name" style={labelStyle}>{t('onboarding.first_name')}</label>
                                <input
                                    type="text"
                                    id="client-first-name"
                                    required
                                    placeholder="Jean"
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
                                    placeholder="Dupont"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.last_name && <span style={errorStyle}>{errors.last_name}</span>}
                            </div>
                        </div>

                        {/* City */}
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="client-city" style={labelStyle}>{t('onboarding.main_city')}</label>
                            <select
                                id="client-city"
                                required
                                value={data.city}
                                onChange={e => setData('city', e.target.value)}
                                style={{ ...inputStyle, background: '#fff' }}
                            >
                                <option value="">{t('onboarding.select')}</option>
                                {swissCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.city && <span style={errorStyle}>{errors.city}</span>}
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="client-email" style={labelStyle}>{t('onboarding.email')}</label>
                            <input 
                                type="email" 
                                id="client-email" 
                                required 
                                placeholder="votre@email.ch" 
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                style={inputStyle}
                            />
                            {errors.email && <span style={errorStyle}>{errors.email}</span>}
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="client-phone" style={labelStyle}>{t('onboarding.phone')}</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ padding: '16px 12px', background: 'var(--g50)', border: '2px solid var(--g300)', borderRight: 'none', borderRadius: 'var(--rs) 0 0 var(--rs)', fontSize: '15px', fontWeight: 700, color: 'var(--g500)', whiteSpace: 'nowrap' }}>🇨🇭 +41</span>
                                <input 
                                    type="tel" 
                                    id="client-phone" 
                                    required 
                                    placeholder="79 123 45 67" 
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    maxLength="14" 
                                    style={{ flex: 1, padding: '16px', border: '2px solid var(--g300)', borderLeft: 'none', borderRadius: '0 var(--rs) var(--rs) 0', fontSize: '16px', minWidth: 0 }} 
                                />
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--g500)', marginTop: '4px' }}>{t('onboarding.phone_hint')}</p>
                            {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                        </div>

                        {/* Password */}
                        {/* Password Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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
                                <label htmlFor="client-password-confirmation" style={labelStyle}>{t('auth.register.confirm_password')}</label>
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
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    id="client-age" 
                                    required 
                                    checked={data.age_confirmed}
                                    onChange={e => setData('age_confirmed', e.target.checked)}
                                    style={{ marginTop: '3px', accentColor: 'var(--o)', width: '18px', height: '18px', flexShrink: 0 }} 
                                />
                                <span style={{ fontSize: '13px', color: 'var(--g700)', lineHeight: 1.5 }}>
                                    {t('onboarding.age_start')} <strong>{t('onboarding.age_confirmed')}</strong> {t('onboarding.age_end')}
                                </span>
                            </label>
                        </div>

                        {errors.general && (
                            <div style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px' }}>
                                {errors.general}
                            </div>
                        )}

                        <button type="submit" className="oflem-btn oflem-btn-primary" style={{ width: '100%', fontSize: '17px', padding: '18px' }} disabled={processing}>
                            {processing ? '...' : t('onboarding.create_account_btn')}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--g500)', marginTop: '14px' }}>
                            {t('onboarding.terms_start')} <a href="#" style={{ color: 'var(--o)', cursor: 'pointer', textDecoration: 'underline' }}>{t('onboarding.cgu')}</a> {t('onboarding.terms_and')} <a href="#" style={{ color: 'var(--o)', cursor: 'pointer', textDecoration: 'underline' }}>{t('onboarding.privacy')}</a>.
                        </p>
                    </form>
                </div>
            </section>
        </div>
    );
}
