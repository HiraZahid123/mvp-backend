import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import '../../../css/oflem-home.css';
import '../../../css/oflem-register.css';

export default function Register() {
    const { t } = useTranslation();
    const [step, setStep] = useState(0); // 0 to 4
    const [mode, setMode] = useState(null); // 'standard' | 'remote'
    const [photoPreview, setPhotoPreview] = useState(null);
    
    const fileInputs = {
        photo: useRef(null),
        id: useRef(null),
        domicile: useRef(null),
        permit: useRef(null)
    };

    const queryParams = new URLSearchParams(window.location.search);
    const role = queryParams.get('role');

    React.useEffect(() => {
        if (role === 'client') {
            router.get(route('register.client'));
        }
    }, [role]);

    const { data, setData, post, processing, errors, reset } = useForm({
        mode: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        city: '',
        category: '',
        experience: 'Moins de 2 ans',
        radius: 15,
        hourly_rate: 30,
        bio: '',
        avs_number: '',
        iban: '',
        password: '',
        password_confirmation: '',
        terms_accepted: false,
        photo: null,
        id_document: null,
        address_proof: null,
        work_permit: null,
    });

    const selectMode = (selectedMode) => {
        setMode(selectedMode);
        setData('mode', selectedMode);
        setStep(1);
    };

    const nextStep = (current) => {
        if (current === 1) {
            if (!data.first_name || !data.last_name || !data.email || !data.phone || !data.city) return;
        } else if (current === 2) {
            if (!data.category || !data.bio || !data.hourly_rate) return;
        } else if (current === 3) {
            // Document validation relaxed for test phase as per user request
            // if (mode === 'standard' && (!data.photo || !data.id_document || !data.address_proof || !data.iban)) return;
            // if (mode === 'remote' && !data.photo) return;
        }
        setStep(current + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = (current) => {
        setStep(current - 1);
        window.scrollTo(0, 0);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register.provider.post'), {
            forceFormData: true,
            onError: () => {
                // Scroll to top to see error messages
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handleFileUpload = (type) => {
        fileInputs[type].current.click();
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const fieldMap = {
                photo: 'photo',
                id: 'id_document',
                domicile: 'address_proof',
                permit: 'work_permit'
            };
            setData(fieldMap[type], file);

            // Create preview if it's the photo
            if (type === 'photo') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const renderDots = () => {
        if (step === 0) return null;
        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                {[1, 2, 3, 4].map(s => (
                    <div 
                        key={s} 
                        className="ps-step-dot" 
                        style={{ 
                            width: s === step ? '28px' : '10px', 
                            height: '10px', 
                            borderRadius: s === step ? '5px' : '50%', 
                            background: s <= step ? 'var(--o)' : 'var(--g300)' 
                        }} 
                    />
                ))}
            </div>
        );
    };

    const swissCities = ['Genève', 'Lausanne', 'Fribourg', 'Neuchâtel', 'Sion', 'Montreux', 'Nyon', 'Morges', 'Vevey', 'Yverdon-les-Bains'];
    const errorStyle = { fontSize: '11px', color: '#e53e3e', marginTop: '4px', fontWeight: 'bold', display: 'block' };

    return (
        <div className="oflem-home-page">
            <Head title={t('onboarding.provider_title')} />

            <header className="oflem-header">
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                        <Link href={route('welcome')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                    </nav>
                </div>
            </header>

            <section className="oflem-section" style={{ paddingTop: '50px', paddingBottom: '80px' }}>
                <div className="oflem-container" style={{ maxWidth: step === 0 && role !== 'provider' ? '1100px' : '720px' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <div className="oflem-section-label">{t('onboarding.inscription_label')}</div>
                        <h2 className="oflem-section-title" style={{ fontSize: '34px' }}>
                            {step === 0 ? (role === 'provider' ? t('onboarding.which_type') : t('onboarding.join_title')) : mode === 'standard' ? t('onboarding.provider_terrain') : t('onboarding.provider_remote')}
                        </h2>
                        <p style={{ color: 'var(--g500)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
                            {step === 0 ? (role === 'provider' ? t('onboarding.mode_impact') : t('onboarding.choose_mode')) 
                              : t('onboarding.complete_dossier')}
                        </p>
                    </div>

                    {renderDots()}

                    <form onSubmit={submit}>
                        {step === 0 && (
                            <div style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)' }}>
                                {role !== 'provider' && (
                                    <>
                                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--n)', marginBottom: '8px', textAlign: 'center' }}>
                                            {t('onboarding.which_type')}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: 'var(--g500)', textAlign: 'center', marginBottom: '28px', lineHeight: 1.6 }}>
                                            {t('onboarding.mode_impact')}
                                        </p>
                                    </>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: role === 'provider' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '16px' }}>
                                    {/* Client Option */}
                                    {role !== 'provider' && (
                                    <div 
                                        onClick={() => router.get(route('register.client'))} 
                                        style={{ border: '2px solid #e2e8f0', borderRadius: '20px', padding: '28px 22px', cursor: 'pointer', transition: 'all .25s', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fff' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--g)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.05)'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--g)" strokeWidth="2" strokeLinecap="round">
                                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M19 8v6m-3-3h6"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.gateway_client_title')}</div>
                                            <div style={{ fontSize: '12.5px', color: 'var(--g500)', lineHeight: 1.65, marginTop: '5px' }}>{t('onboarding.gateway_client_desc')}</div>
                                        </div>
                                        <div style={{ height: '1px', background: 'var(--g100)' }} />
                                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', margin: 0 }}>
                                            <li style={{ fontSize: '12.5px', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--g)', fontWeight: 900, flexShrink: 0 }}>✓</span> {t('onboarding.your_request')}</li>
                                            <li style={{ fontSize: '12.5px', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--g)', fontWeight: 900, flexShrink: 0 }}>✓</span> {t('onboarding.verification')}</li>
                                        </ul>
                                        <button type="button" style={{ background: 'var(--g)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 20px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', width: '100%', marginTop: 'auto' }}>
                                            {t('onboarding.choose_profile')}
                                        </button>
                                    </div>
                                    )}

                                    {/* Standard Provider */}
                                    <div 
                                        onClick={() => selectMode('standard')} 
                                        style={{ border: '2px solid var(--g300)', borderRadius: '20px', padding: '28px 22px', cursor: 'pointer', transition: 'all .25s', display: 'flex', flexDirection: 'column', gap: '14px' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--o)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,53,.12)'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--g300)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#fff5f0,#fed7c3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round">
                                                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0z"/>
                                                <path d="M2 17l7 5 7-7-5-7-9 9z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.prestataire_terrain')}</div>
                                            <div style={{ fontSize: '12.5px', color: 'var(--g500)', lineHeight: 1.65, marginTop: '5px' }}>{t('onboarding.terrain_desc')}</div>
                                        </div>
                                        <div style={{ height: '1px', background: 'var(--g100)' }} />
                                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', margin: 0 }}>
                                            <li style={{ fontSize: '12.5px', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--g)', fontWeight: 900, flexShrink: 0 }}>✓</span> {t('onboarding.all_categories')}</li>
                                            <li style={{ fontSize: '12.5px', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--g)', fontWeight: 900, flexShrink: 0 }}>✓</span> {t('onboarding.local_remote_missions')}</li>
                                        </ul>
                                        <button type="button" style={{ background: 'var(--n)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 20px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', width: '100%', marginTop: 'auto', transition: 'background .2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'var(--o)'} onMouseOut={e => e.currentTarget.style.background = 'var(--n)'}>
                                            {t('onboarding.choose_profile')}
                                        </button>
                                    </div>

                                    {/* Remote Provider */}
                                    <div 
                                        onClick={() => selectMode('remote')} 
                                        style={{ border: '2px solid #bfdbfe', borderRadius: '20px', padding: '28px 22px', cursor: 'pointer', transition: 'all .25s', display: 'flex', flexDirection: 'column', gap: '14px' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,.18)'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#eff6ff,#bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                                <path d="M8 21h8m-4-4v4"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.prestataire_remote')}</div>
                                            <div style={{ fontSize: '12.5px', color: 'var(--g500)', lineHeight: 1.65, marginTop: '5px' }}>{t('onboarding.remote_desc')}</div>
                                        </div>
                                        <div style={{ height: '1px', background: 'var(--g100)' }} />
                                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', margin: 0 }}>
                                            <li style={{ fontSize: '12.5px', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--g)', fontWeight: 900, flexShrink: 0 }}>✓</span> {t('onboarding.simplified_reg')}</li>
                                            <li style={{ fontSize: '12.5px', display: 'flex', gap: '8px' }}><span style={{ color: 'var(--g)', fontWeight: 900, flexShrink: 0 }}>✓</span> {t('onboarding.work_anywhere')}</li>
                                        </ul>
                                        <button type="button" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 20px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', width: '100%', marginTop: 'auto' }}>
                                            {t('onboarding.choose_profile')}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', padding: '14px 16px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.65, margin: 0 }}>
                                        <strong>{t('onboarding.remote_notice_label')}</strong> {t('onboarding.remote_notice_desc')}
                                    </p>
                                </div>

                                <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--g500)', marginTop: '32px' }}>
                                    {t('auth.login.already_have_account') || "Vous avez déjà un compte ?"}{' '}
                                    <Link
                                        href={route('login')}
                                        style={{ color: 'var(--o)', fontWeight: 700, textDecoration: 'none' }}
                                    >
                                        {t('auth.login.title') || "Se connecter"}
                                    </Link>
                                </p>
                            </div>
                        )}

                        {step === 1 && (
                            <div style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)', animation: 'pgIn .3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--o),var(--ol))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, flexShrink: 0 }}>1</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.your_info')}</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.first_name')}</label>
                                        <input type="text" required value={data.first_name} onChange={e => setData('first_name', e.target.value)} placeholder={t('onboarding.first_name')} style={{ width: '100%', padding: '14px', border: errors.first_name ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                        {errors.first_name && <span style={errorStyle}>{errors.first_name}</span>}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.last_name')}</label>
                                        <input type="text" required value={data.last_name} onChange={e => setData('last_name', e.target.value)} placeholder={t('onboarding.last_name')} style={{ width: '100%', padding: '14px', border: errors.last_name ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                        {errors.last_name && <span style={errorStyle}>{errors.last_name}</span>}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.email')}</label>
                                    <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)} placeholder="votre@email.ch" style={{ width: '100%', padding: '14px', border: errors.email ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                    {errors.email && <span style={errorStyle}>{errors.email}</span>}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.phone')}</label>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ padding: '14px 12px', background: 'var(--g50)', border: errors.phone ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRight: 'none', borderRadius: 'var(--rs) 0 0 var(--rs)', fontSize: '15px', fontWeight: 700, color: 'var(--g500)', whiteSpace: 'nowrap' }}>🇨🇭 +41</span>
                                        <input type="tel" required value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="79 123 45 67" style={{ flex: 1, padding: '14px', border: errors.phone ? '2px solid #e53e3e' : '2px solid var(--g300)', borderLeft: 'none', borderRadius: '0 var(--rs) var(--rs) 0', fontSize: '15px', minWidth: 0 }} />
                                    </div>
                                    {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                                    <p style={{ fontSize: '11px', color: 'var(--g500)', marginTop: '4px' }}>{t('onboarding.phone_hint')}</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.main_city')}</label>
                                    <select required value={data.city} onChange={e => setData('city', e.target.value)} style={{ width: '100%', padding: '14px', border: errors.city ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', background: '#fff' }}>
                                        <option value="">{t('onboarding.select')}</option>
                                        {swissCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.city && <span style={errorStyle}>{errors.city}</span>}
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" className="oflem-btn oflem-btn-secondary" style={{ flex: 1, padding: '16px' }} onClick={() => setStep(0)}>← {t('common.back')}</button>
                                    <button type="button" className="oflem-btn oflem-btn-primary" style={{ flex: 2, padding: '16px' }} onClick={() => nextStep(1)}>{t('common.continue')} →</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)', animation: 'pgIn .3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--o),var(--ol))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, flexShrink: 0 }}>2</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.services_skills')}</h3>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.main_category')}</label>
                                    <select required value={data.category} onChange={e => setData('category', e.target.value)} style={{ width: '100%', padding: '14px', border: errors.category ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', background: '#fff' }}>
                                        <option value="">{t('onboarding.select')}</option>
                                        {mode === 'standard' ? (
                                            <>
                                                <optgroup label={t('onboarding.categories.daily_services')}>
                                                    <option>{t('onboarding.categories.delivery')}</option>
                                                    <option>{t('onboarding.categories.pets')}</option>
                                                    <option>{t('onboarding.categories.personal_aid')}</option>
                                                    <option>{t('onboarding.categories.cleaning')}</option>
                                                </optgroup>
                                                <optgroup label={t('onboarding.categories.craft_tech')}>
                                                    <option>{t('onboarding.categories.painting')}</option>
                                                    <option>{t('onboarding.categories.plumbing')}</option>
                                                    <option>{t('onboarding.categories.electricity')}</option>
                                                    <option>{t('onboarding.categories.carpentry')}</option>
                                                    <option>{t('onboarding.categories.gardening')}</option>
                                                    <option>{t('onboarding.categories.renovation')}</option>
                                                </optgroup>
                                                <optgroup label={t('onboarding.categories.logistics')}>
                                                    <option>{t('onboarding.categories.moving')}</option>
                                                    <option>{t('onboarding.categories.furniture')}</option>
                                                    <option>{t('onboarding.categories.transport')}</option>
                                                </optgroup>
                                                <optgroup label={t('onboarding.categories.other')}>
                                                    <option>{t('onboarding.categories.multi_service')}</option>
                                                    <option>{t('onboarding.categories.other_bio')}</option>
                                                </optgroup>
                                            </>
                                        ) : (
                                            <>
                                                <optgroup label={t('onboarding.categories.admin_legal')}>
                                                    <option>{t('onboarding.categories.taxes')}</option>
                                                    <option>{t('onboarding.categories.official_letters')}</option>
                                                    <option>{t('onboarding.categories.online_aid')}</option>
                                                </optgroup>
                                                <optgroup label={t('onboarding.categories.digital_tech')}>
                                                    <option>{t('onboarding.categories.remote_it')}</option>
                                                    <option>{t('onboarding.categories.web_dev')}</option>
                                                </optgroup>
                                            </>
                                        )}
                                    </select>
                                    {errors.category && <span style={errorStyle}>{errors.category}</span>}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.experience')}</label>
                                    <select value={data.experience} onChange={e => setData('experience', e.target.value)} style={{ width: '100%', padding: '14px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', background: '#fff' }}>
                                        <option>{t('onboarding.experience_levels.less_2')}</option>
                                        <option>{t('onboarding.experience_levels.2_5')}</option>
                                        <option>{t('onboarding.experience_levels.5_10')}</option>
                                        <option>{t('onboarding.experience_levels.more_10')}</option>
                                    </select>
                                </div>

                                {mode === 'standard' && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.radius')} ({data.radius} km)</label>
                                        <input type="range" min="5" max="50" step="5" value={data.radius} onChange={e => setData('radius', e.target.value)} style={{ width: '100%', accentColor: 'var(--o)' }} />
                                    </div>
                                )}

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.hourly_rate_label')} (CHF/h)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="number" required min="1" value={data.hourly_rate} onChange={e => setData('hourly_rate', e.target.value)} style={{ width: '100%', padding: '14px', border: errors.hourly_rate ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--g500)' }}>CHF</span>
                                    </div>
                                    {errors.hourly_rate && <span style={errorStyle}>{errors.hourly_rate}</span>}
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.bio_professional')}</label>
                                    <textarea required rows="4" value={data.bio} onChange={e => setData('bio', e.target.value)} placeholder={t('onboarding.bio_placeholder')} style={{ width: '100%', padding: '14px', border: errors.bio ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', resize: 'vertical' }} />
                                    {errors.bio && <span style={errorStyle}>{errors.bio}</span>}
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" className="oflem-btn oflem-btn-secondary" style={{ flex: 1, padding: '16px' }} onClick={() => prevStep(2)}>← {t('common.back')}</button>
                                    <button type="button" className="oflem-btn oflem-btn-primary" style={{ flex: 2, padding: '16px' }} onClick={() => nextStep(2)}>{t('common.continue')} →</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)', animation: 'pgIn .3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--o),var(--ol))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, flexShrink: 0 }}>3</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.id_verification')}</h3>
                                </div>

                                {mode === 'standard' ? (
                                    <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1.5px solid rgba(16,185,129,.2)', borderRadius: '14px', padding: '18px 20px', marginBottom: '28px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#065f46', marginBottom: '8px' }}>{t('onboarding.why_docs')}</div>
                                        <p style={{ fontSize: '13px', color: '#047857', lineHeight: 1.7, margin: 0 }}>{t('onboarding.why_docs_desc')}</p>
                                    </div>
                                ) : (
                                    <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1.5px solid rgba(59,130,246,.2)', borderRadius: '14px', padding: '18px 20px', marginBottom: '28px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e40af', marginBottom: '8px' }}>🖥️ {t('onboarding.simplified_remote_box')}</div>
                                        <p style={{ fontSize: '13px', color: '#1d4ed8', lineHeight: 1.7, margin: 0 }}>{t('onboarding.simplified_remote_desc')}</p>
                                    </div>
                                )}

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.profile_photo')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                                    <input type="file" ref={fileInputs.photo} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--g100)', border: data.photo ? '3px solid var(--g)' : '3px dashed var(--g300)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '24px', color: 'var(--g500)' }}>👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <button type="button" onClick={() => handleFileUpload('photo')} style={{ padding: '10px 20px', background: 'var(--g50)', border: '2px dashed var(--g300)', borderRadius: '10px', color: 'var(--g700)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{data.photo ? t('onboarding.change_photo') : t('onboarding.upload_photo')}</button>
                                        </div>
                                    </div>
                                    {errors.photo && <span style={errorStyle}>{errors.photo}</span>}
                                    {data.photo && <p style={{ fontSize: '11px', color: 'var(--g)', marginTop: '4px' }}>{data.photo.name}</p>}
                                </div>

                                {mode === 'standard' && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.id_piece')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                                            <input type="file" ref={fileInputs.id} style={{ display: 'none' }} accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'id')} />
                                            <div onClick={() => handleFileUpload('id')} style={{ border: errors.id_document ? '2px solid #e53e3e' : data.id_document ? '2px solid var(--g)' : '2px dashed var(--g300)', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: data.id_document ? '#ecfdf5' : '#fff' }}>
                                                {data.id_document ? <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--g)' }}>✓ {data.id_document.name}</div> : <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--g700)' }}>{t('onboarding.id_upload_hint')}</div>}
                                            </div>
                                            {errors.id_document && <span style={errorStyle}>{errors.id_document}</span>}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                            <div>
                                                <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.address_proof')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                                                <input type="file" ref={fileInputs.domicile} style={{ display: 'none' }} accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'domicile')} />
                                                <div onClick={() => handleFileUpload('domicile')} style={{ border: errors.address_proof ? '2px solid #e53e3e' : data.address_proof ? '2px solid var(--g)' : '2px dashed var(--g300)', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: data.address_proof ? '#ecfdf5' : '#fff' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, color: data.address_proof ? 'var(--g)' : 'var(--g700)' }}>{data.address_proof ? '✓ ' + data.address_proof.name : t('onboarding.upload')}</div>
                                                </div>
                                                {errors.address_proof && <span style={errorStyle}>{errors.address_proof}</span>}
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.permit_ch')} <span style={{ fontSize: '11px', color: 'var(--g500)', fontWeight: 600 }}>(option)</span></label>
                                                <input type="file" ref={fileInputs.permit} style={{ display: 'none' }} accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'permit')} />
                                                <div onClick={() => handleFileUpload('permit')} style={{ border: data.work_permit ? '2px solid var(--g)' : '2px dashed var(--g300)', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: data.work_permit ? '#ecfdf5' : '#fff' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, color: data.work_permit ? 'var(--g)' : 'var(--g700)' }}>{data.work_permit ? '✓ ' + data.work_permit.name : t('onboarding.upload')}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.avs_number_label')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                                            <input 
                                                type="text" 
                                                required={mode === 'standard'}
                                                value={data.avs_number} 
                                                onChange={e => setData('avs_number', e.target.value)} 
                                                placeholder="756.1234.5678.90" 
                                                style={{ width: '100%', padding: '14px', border: errors.avs_number ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} 
                                            />
                                            <p style={{ fontSize: '11px', color: 'var(--g500)', marginTop: '4px' }}>{t('onboarding.avs_hint')}</p>
                                            {errors.avs_number && <span style={errorStyle}>{errors.avs_number}</span>}
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.iban_label')} <span style={{ color: 'var(--g500)', fontSize: '11px', fontWeight: 'normal' }}>({t('common.optional')})</span></label>
                                            <input type="text" required value={data.iban} onChange={e => setData('iban', e.target.value)} placeholder="CH56 0483 5012 3456 7800 9" style={{ width: '100%', padding: '14px', border: errors.iban ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                            {errors.iban && <span style={errorStyle}>{errors.iban}</span>}
                                            <p style={{ fontSize: '11px', color: 'var(--g500)', marginTop: '4px' }}>{t('onboarding.iban_hint')}</p>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    <button type="button" className="oflem-btn oflem-btn-secondary" style={{ flex: '1 1 120px', padding: '16px' }} onClick={() => prevStep(3)}>← {t('common.back')}</button>
                                    <button type="button" className="oflem-btn" style={{ flex: '1 1 160px', padding: '16px', background: 'var(--g50)', color: 'var(--g700)', border: '1px solid var(--g300)', fontWeight: 800 }} onClick={() => nextStep(3)}>{t('onboarding.skip_step') || 'Passer pour l\'instant'}</button>
                                    <button type="button" className="oflem-btn oflem-btn-primary" style={{ flex: '2 1 200px', padding: '16px' }} onClick={() => nextStep(3)}>{t('common.continue')} →</button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '36px', boxShadow: 'var(--sh)', animation: 'pgIn .3s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--o),var(--ol))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, flexShrink: 0 }}>4</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--n)' }}>{t('onboarding.finalization')}</h3>
                                </div>

                                <div style={{ background: 'var(--g50)', borderRadius: 'var(--rs)', padding: '20px', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', marginBottom: '10px' }}>{t('onboarding.recap')}</h4>
                                    <div style={{ fontSize: '13px', color: 'var(--g700)', lineHeight: 1.8 }}>
                                        <strong>{data.first_name} {data.last_name}</strong><br />
                                        {t('onboarding.mode_label')}: {mode === 'standard' ? t('onboarding.terrain') : t('onboarding.remote')}<br />
                                        Catégorie: {data.category}<br />
                                        Tarif: {data.hourly_rate} CHF/h<br />
                                        {mode === 'standard' && (
                                            <>
                                                {t('onboarding.main_city')}: {data.city}<br />
                                                AVS: {data.avs_number || "Non fourni"}<br />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.password')}</label>
                                        <input type="password" required minLength="8" value={data.password} onChange={e => setData('password', e.target.value)} placeholder={t('onboarding.pass_hint')} style={{ width: '100%', padding: '14px', border: errors.password ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                        {errors.password && <span style={errorStyle}>{errors.password}</span>}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('auth.register.confirm_password')}</label>
                                        <input type="password" required value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '14px', border: errors.password_confirmation ? '2px solid #e53e3e' : '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} />
                                        {errors.password_confirmation && <span style={errorStyle}>{errors.password_confirmation}</span>}
                                    </div>
                                </div>

                                {errors.general && (
                                    <div style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '10px 14px' }}>
                                        {errors.general}
                                    </div>
                                )}

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                                        <input type="checkbox" required checked={data.terms_accepted} onChange={e => setData('terms_accepted', e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--o)', width: '18px', height: '18px' }} />
                                        <span style={{ fontSize: '13px', color: 'var(--g700)', lineHeight: 1.5 }}>
                                            {t('onboarding.accept_terms_start')} <a href="/terms" target="_blank" style={{ color: 'var(--o)', textDecoration: 'underline' }}>{t('onboarding.cgu')}</a> {t('onboarding.accept_terms_end')} <a href="/privacy" target="_blank" style={{ color: 'var(--o)', textDecoration: 'underline' }}>{t('onboarding.privacy')}</a>. 
                                            {mode === 'standard' && t('onboarding.legal_confirm')}
                                        </span>
                                    </label>
                                </div>

                                <div style={{ background: 'var(--g50)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid var(--g100)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--g500)', lineHeight: 1.6, margin: 0 }}>
                                        Votre profil sera <strong>examiné par notre équipe</strong> sous 24–48h. Vous recevrez un email de confirmation dès la validation. En attendant, vous pouvez déjà explorer la plateforme.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" className="oflem-btn oflem-btn-secondary" style={{ flex: 1, padding: '16px' }} onClick={() => prevStep(4)}>← {t('common.back')}</button>
                                    <button type="submit" className="oflem-btn oflem-btn-primary" style={{ flex: 2, padding: '16px' }} disabled={processing}>
                                        {processing ? '...' : t('onboarding.create_profile_btn')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </section>
        </div>
    );
}
