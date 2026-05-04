import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import MissionLocationPicker from '@/Components/MissionLocationPicker';
import ModerationShield from '@/Components/ModerationShield';
import { 
    Sparkles, 
    Rocket, 
    ShieldCheck, 
    Lock, 
    ChevronDown, 
    ChevronRight,
    MapPin,
    Calendar,
    Clock
} from 'lucide-react';
import OnboardingProgressBar from '@/Components/OnboardingProgressBar';

export default function Create({ prefillTitle = '', aiTitle = null, category = null }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [moderationError, setModerationError] = useState('');
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [priceInputMode, setPriceInputMode] = useState('quick'); // 'quick' or 'custom'
    const [aiGenerationError, setAiGenerationError] = useState('');
    const [shieldStatus, setShieldStatus] = useState('idle'); // 'idle'|'scanning'|'verified'|'blocked'
    const [shieldMessage, setShieldMessage] = useState('');
    const debounceTimer = useRef(null);
    const lastCheck = useRef({ content: '', result: null });

    const { data, setData, post, processing, errors, reset } = useForm({
        title: aiTitle || prefillTitle,
        description: '',
        location: auth.user?.location_address || '',
        lat: auth.user?.location_lat || '',
        lng: auth.user?.location_lng || '',
        exact_address: '',
        date_time: '',
        budget: '50',
        price_type: 'fixed',
        first_name: '',
        city: '',
        category: category || '',
    });

    const [totalWithCommission, setTotalWithCommission] = useState(60); // 50 + 20%
    const [commission, setCommission] = useState(10);

    useEffect(() => {
        const b = parseFloat(data.budget) || 0;
        const comm = Math.round(b * 0.20);
        setCommission(comm);
        setTotalWithCommission(b + comm);
    }, [data.budget]);

    // Auto-generate description when title changes (debounced)
    const handleGenerateDescription = async () => {
        if (!data.title) return;
        
        setIsGeneratingDescription(true);
        setAiGenerationError('');
        try {
            const response = await axios.post(route('missions.ai-rewrite'), { 
                title: data.title, 
                description: data.description 
            });
            setData(prev => ({ 
                ...prev, 
                description: response.data.improved_description || ''
            }));
        } catch (error) {
            console.error('AI Description Generation Error:', error);
            setAiGenerationError(t('Could not generate description. Please try again.'));
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const runShieldCheck = async (content) => {
        try {
            const response = await axios.post(route('api.moderation.check'), { content });
            lastCheck.current = { content, result: response.data };
            if (response.data.is_clean) {
                setShieldStatus('verified');
                setShieldMessage('');
            } else {
                setShieldStatus('blocked');
                setShieldMessage(response.data.reason || '');
                setModerationError(response.data.reason || t('Content violates moderation rules.'));
            }
            return response.data;
        } catch {
            setShieldStatus('error');
            setModerationError(t('Unable to verify content. Please try again.'));
            return { is_clean: false }; // fail closed: block submit if we cannot reach the moderation API
        }
    };

    /* 
    // Trigger debounced shield check whenever title or description changes.
    useEffect(() => {
        const content = (data.title + ' ' + data.description).trim();
        if (!content) {
            setShieldStatus('idle');
            clearTimeout(debounceTimer.current);
            return;
        }
        setShieldStatus('scanning');
        setModerationError('');
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => runShieldCheck(content), 1400);
        return () => clearTimeout(debounceTimer.current);
    }, [data.title, data.description]);
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data.location && !data.lat && !data.lng && !data.city) {
            setModerationError(t('Please select a location for your mission.'));
            return;
        }

        if (shieldStatus === 'blocked') return;

        const content = data.title + ' ' + data.description;

        // Use cached result when content matches the last AI check.
        let checkResult = (lastCheck.current.content === content && lastCheck.current.result)
            ? lastCheck.current.result
            : null;

        if (!checkResult) {
            setIsModerating(true);
            clearTimeout(debounceTimer.current);
            setShieldStatus('scanning');
            checkResult = await runShieldCheck(content);
            setIsModerating(false);
        }

        if (!checkResult.is_clean) return;

        if (!auth.user) {
            if (!data.first_name || !data.city) {
                setModerationError(t('Please provide your name and city.'));
                // Trigger browser validation if possible, but also set state
                return;
            }
            router.post(route('api.missions.store'), data, {
                onError: (err) => {
                    console.error('Store Error:', err);
                }
            });
            return;
        }

        post(route('api.missions.store'), {
            onSuccess: () => reset(),
            onError: (err) => {
                console.error('Store Error:', err);
            }
        });
    };

    const swissCities = ['Genève', 'Lausanne', 'Fribourg', 'Neuchâtel', 'Sion', 'Montreux', 'Nyon', 'Morges', 'Vevey', 'Yverdon-les-Bains'];



    const formContent = (
        <div className={auth.user ? "max-w-2xl mx-auto" : "max-w-[720px] mx-auto py-12"}>
            {!auth.user && (
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <OnboardingProgressBar step={1} />
                    <h2 className="section-title" style={{ fontSize: '36px' }}>{t('onboarding.configure_request')}</h2>
                    <p style={{ color: 'var(--g500)', fontSize: '15px' }}>{t('onboarding.precision_hint')}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: auth.user ? '32px' : '36px', boxShadow: 'var(--sh)' }} className="space-y-6">
                {/* Need Title */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' }}>{t('onboarding.your_need')}</label>
                    <input 
                        type="text" 
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '16px', fontWeight: 600, color: 'var(--n)', background: data.title ? 'var(--g50)' : '#fff' }} 
                    />
                    <InputError message={errors.title} className="mt-2" />
                    {moderationError && !errors.title && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                            <Lock size={14} /> {moderationError}
                        </div>
                    )}
                    {shieldStatus !== 'idle' && (
                        <div style={{ marginTop: '8px' }}>
                            <ModerationShield status={shieldStatus} message={shieldMessage} />
                        </div>
                    )}
                </div>

                {/* Guest Details: Name & City */}
                {!auth.user && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' }}>{t('onboarding.first_name')}</label>
                            <input 
                                type="text" 
                                required 
                                placeholder={t('onboarding.first_name_placeholder')} 
                                value={data.first_name}
                                onChange={e => setData('first_name', e.target.value)}
                                style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px' }} 
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' }}>{t('onboarding.main_city')}</label>
                            <select 
                                required 
                                value={data.city}
                                onChange={e => {
                                    setData('city', e.target.value);
                                    setData('location', e.target.value);
                                }}
                                style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', background: '#fff' }}
                            >
                                <option value="">{t('onboarding.select')}</option>
                                {swissCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <InputError message={errors.city} className="mt-2" />
                        </div>
                    </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' }}>{t('onboarding.detailed_description')}</label>
                    <div className="relative">
                        <textarea 
                            rows="4" 
                            placeholder={t('onboarding.desc_placeholder')} 
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} 
                        />
                        <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={isGeneratingDescription || !data.title}
                            className="absolute bottom-3 right-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-2 border border-gray-200"
                        >
                            {isGeneratingDescription ? <span className="w-3 h-3 border-2 border-gray-400 border-t-oflem-charcoal rounded-full animate-spin"></span> : <><Sparkles size={14} className="text-oflem-terracotta" /> {t('Auto-fill')}</>}
                        </button>
                    </div>
                    <InputError message={errors.description} className="mt-2" />
                </div>

                {/* Budget & Commission */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '6px' }}>{t('onboarding.your_budget')} (CHF)</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: 900, color: 'var(--g500)' }}>CHF</span>
                        <input 
                            type="number" 
                            min="10" 
                            step="5" 
                            value={data.budget}
                            onChange={(e) => setData('budget', e.target.value)}
                            style={{ width: '100%', padding: '16px 16px 16px 56px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '18px', fontWeight: 900, color: 'var(--n)' }} 
                        />
                    </div>
                    
                    {/* Commission Preview Card */}
                    <div style={{ marginTop: '12px', padding: '14px 16px', background: '#fff8f5', border: '1px solid rgba(255,107,53,0.15)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--o)', marginBottom: '10px' }}>{t('onboarding.payment_summary')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--g700)' }}><span>{t('onboarding.mission_price')}</span><span style={{ fontWeight: 700 }}>CHF {data.budget}.–</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--o)' }}>
                                <span>+ {t('onboarding.commission')} (20%)</span>
                                <span style={{ fontWeight: 700 }}>+CHF {commission}.–</span>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,107,53,0.1)', margin: '4px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, color: 'var(--n)' }}><span>{t('onboarding.total_to_pay')}</span><span style={{ fontWeight: 900 }}>CHF {totalWithCommission}.–</span></div>
                        </div>
                    </div>
                    <InputError message={errors.budget} className="mt-2" />
                </div>

                {/* Date & Time Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' }}>{t('onboarding.desired_date')}</label>
                        <input 
                            type="date" 
                            value={data.date_time?.split('T')[0] || ''}
                            onChange={(e) => setData('date_time', e.target.value + 'T12:00')}
                            style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', color: 'var(--n)', background: '#fff' }} 
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', display: 'block', marginBottom: '8px' }}>{t('onboarding.desired_time')}</label>
                        <select style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--g300)', borderRadius: 'var(--rs)', fontSize: '15px', background: '#fff', color: 'var(--n)' }}>
                            <option value="">{t('onboarding.flexible')}</option>
                            <option>08:00</option><option>10:00</option><option>12:00</option><option>14:00</option><option>16:00</option><option>18:00</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={processing || isModerating || shieldStatus === 'blocked' || shieldStatus === 'scanning'}
                        className={`w-full py-5 font-black rounded-full transition-all shadow-xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] ${
                            processing || isModerating || shieldStatus === 'blocked' || shieldStatus === 'scanning'
                                ? 'bg-gray-300 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-oflem-charcoal text-white hover:bg-black'
                        }`}
                    >
                        {(processing || isModerating || shieldStatus === 'scanning') ? <span className="w-6 h-6 border-4 border-oflem-terracotta border-t-white rounded-full animate-spin"></span> : <span>{t('onboarding.find_provider')}</span>}
                    </button>
                    <p className="mt-4 text-center text-xs text-zinc-400 font-bold flex items-center justify-center gap-1.5">
                        <ShieldCheck size={14} className="text-oflem-green" /> {t('onboarding.payment_secured')}
                    </p>
                </div>
            </form>
        </div>
    );

    if (!auth.user) {
        return (
            <div className="oflem-home-page" style={{ background: 'var(--g50)', minHeight: '100vh' }}>
                <Head title={t('onboarding.configure_request')} />
                <header className="oflem-header" style={{ background: '#fff' }}>
                    <div className="oflem-container">
                        <nav className="oflem-nav">
                            <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                            <Link href={route('welcome')} className="oflem-nav-btn-login">← {t('common.back')}</Link>
                        </nav>
                    </div>
                </header>
                <div className="oflem-container animate-in fade-in duration-700">
                    {formContent}
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout header={t('Post a Mission')}>
            <Head title={t('Create Mission')} />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {formContent}
            </div>
        </DashboardLayout>
    );
}
