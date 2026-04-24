import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import MapMock from '@/Components/Welcome/MapMock';
import axios from 'axios';
import { 
    CheckCircle2,
    ShieldCheck,
    Coins,
    Gem,
    ArrowRight,
    Search,
    ChevronDown,
    PlusCircle,
    Star,
    Shield,
    Users,
    Zap,
    Briefcase,
    HeartPulse,
    Clock,
    Wrench,
    Truck,
    BookOpen,
    Eraser,
    Paintbrush,
    Sprout,
    Mail,
    Smartphone,
    MapPin,
    Lock
} from 'lucide-react';

// Import pixel-perfect styles
import '../../css/oflem-home.css';

const useIntersectionObserver = (options) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    return [containerRef, isVisible];
};

const AnimatedSection = ({ children, className = "", delay = "0ms" }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    return (
        <div 
            ref={ref} 
            style={{ transitionDelay: delay }}
            className={`${className} reveal ${isVisible ? 'visible' : ''}`}
        >
            {children}
        </div>
    );
};

const FAQSection = ({ t }) => {
    const [openIndices, setOpenIndices] = useState(new Set());

    const toggleFaq = (index) => {
        const newSet = new Set(openIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setOpenIndices(newSet);
    };

    const categories = [
        {
            key: 'clients',
            label: t('homepage.faq.categories.clients'),
            class: 'label-client',
            items: ['escrow', 'cost_client', 'any_mission', 'verification', 'unsatisfied']
        },
        {
            key: 'providers',
            label: t('homepage.faq.categories.providers'),
            class: 'label-provider',
            items: ['payment', 'cost_provider', 'artisan', 'freedom', 'dispute']
        }
    ];

    const generalItems = ['regions', 'legal', 'commission_why', 'commission_high'];

    return (
        <section className="oflem-section section section-gray" id="faq">
            <div className="oflem-container">
                <div className="section-head">
                    <AnimatedSection>
                        <div className="section-label">{t('homepage.faq.label')}</div>
                        <h2 className="section-title">{t('homepage.faq.title')}</h2>
                        <p className="section-sub">{t('homepage.faq.subtitle')}</p>
                    </AnimatedSection>
                </div>

                <div className="faq-grid">
                    {categories.map((cat) => (
                        <div key={cat.key}>
                            <p className={`faq-category-label ${cat.class}`}>{cat.label}</p>
                            {cat.items.map((itemKey) => {
                                const isOpen = openIndices.has(itemKey);
                                return (
                                    <div key={itemKey} className={`faq-item ${isOpen ? 'active' : ''}`}>
                                        <button 
                                            className="faq-q" 
                                            onClick={() => toggleFaq(itemKey)}
                                            aria-expanded={isOpen}
                                        >
                                            <strong>{t(`homepage.faq.items.${itemKey}.q`)}</strong>
                                            <span className="faq-chev">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </span>
                                        </button>
                                        <div className="faq-a" style={{ maxHeight: isOpen ? '500px' : '0' }}>
                                            <div className="faq-a-inner" dangerouslySetInnerHTML={{ __html: t(`homepage.faq.items.${itemKey}.a`) }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <p className="faq-category-label label-general">{t('homepage.faq.categories.general')}</p>
                    <div className="faq-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: 0 }}>
                        {generalItems.map((itemKey) => {
                            const isOpen = openIndices.has(itemKey);
                            return (
                                <div key={itemKey} className={`faq-item ${isOpen ? 'active' : ''}`}>
                                    <button 
                                        className="faq-q" 
                                        onClick={() => toggleFaq(itemKey)}
                                        aria-expanded={isOpen}
                                    >
                                        <strong>{t(`homepage.faq.items.${itemKey}.q`)}</strong>
                                        <span className="faq-chev">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </span>
                                    </button>
                                    <div className="faq-a" style={{ maxHeight: isOpen ? '500px' : '0' }}>
                                        <div className="faq-a-inner" dangerouslySetInnerHTML={{ __html: t(`homepage.faq.items.${itemKey}.a`) }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

const FinalCTA = ({ t }) => {
    return (
        <section className="oflem-final-cta" style={{ 
            background: 'linear-gradient(135deg, var(--n) 0%, #2d3748 100%)',
            padding: '90px 0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <AnimatedSection>
                <div className="oflem-final-cta-orb-1"></div>
                <div className="oflem-final-cta-orb-2"></div>
                <div className="container" style={{ maxWidth: '860px', textAlign: 'center', position: 'relative', zIndex: 1, margin: '0 auto' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,107,53,0.2)',
                    border: '1px solid rgba(255,107,53,0.4)',
                    borderRadius: '999px',
                    padding: '7px 18px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: 'var(--o)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '36px'
                }}>
                    <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--o)',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite'
                    }}></span>
                    {t('homepage.cta.ready')}
                </div>
                <p style={{ fontSize: '42px', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-.8px', marginBottom: '8px' }}>
                    {t('homepage.cta.time')}
                </p>
                <p style={{ fontSize: '42px', fontWeight: 900, color: 'var(--o)', lineHeight: 1.2, letterSpacing: '-.8px', marginBottom: '8px' }}>
                    {t('homepage.cta.energy')}
                </p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'rgba(255,255,255,0.80)', lineHeight: 1.3, letterSpacing: '-.3px', marginBottom: '28px' }}>
                    {t('homepage.cta.rest')}
                </p>
                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '44px' }} 
                   dangerouslySetInnerHTML={{ __html: t('homepage.cta.skill') }}></p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a className="oflem-btn oflem-btn-primary" style={{ fontSize: '17px', padding: '16px 40px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {t('homepage.cta.btn_client')}
                    </a>
                    <a className="oflem-btn" style={{ fontSize: '17px', padding: '16px 40px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '10px', cursor: 'pointer' }}>
                        {t('homepage.cta.btn_provider')}
                    </a>
                </div>
            </div>
        </AnimatedSection>
    </section>
    );
};

const RemoteMissions = ({ t, scrollToHero }) => {
    return (
        <section className="oflem-section section section-gray oflem-section-gray" id="remote">
            <div className="oflem-container">
                <div className="section-head">
                    <AnimatedSection>
                        <div className="section-label">{t('homepage.remote_missions.label')}</div>
                        <h2 className="section-title">{t('homepage.remote_missions.title')}</h2>
                        <p className="section-sub">{t('homepage.remote_missions.description')}</p>
                    </AnimatedSection>
                </div>

                <div className="remote-grid">
                    {(Array.isArray(t('homepage.remote_missions.examples')) ? t('homepage.remote_missions.examples') : []).map((example, i) => (
                        <div key={i}>
                            <AnimatedSection delay={`${100 * i}ms`}>
                                <div className="remote-example">
                                    <p><span className="remote-quote">"</span>{example}<span className="remote-quote">"</span></p>
                                </div>
                            </AnimatedSection>
                        </div>
                    ))}
                </div>

                <div className="remote-info-grid">
                    <AnimatedSection delay="100ms">
                        <div className="remote-info-card remote-info-client">
                            <div className="remote-info-icon">👤</div>
                            <h4>{t('homepage.remote_missions.client.title')}</h4>
                            <p>
                                {t('homepage.remote_missions.client.description')}
                            </p>
                            <button className="oflem-btn oflem-btn-primary oflem-btn-sm" onClick={scrollToHero} style={{ width: '100%', fontSize: '15.5px', padding: '14px', marginTop: 'auto' }}>
                                {t('homepage.remote_missions.client.button')}
                            </button>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay="300ms">
                        <div className="remote-info-card remote-info-provider">
                            <div className="remote-info-icon">🖥️</div>
                            <h4>{t('homepage.remote_missions.provider.title')}</h4>
                            <p>
                                {t('homepage.remote_missions.provider.description')}
                            </p>
                            <div className="remote-checks">
                                {(Array.isArray(t('homepage.remote_missions.provider.bullets')) ? t('homepage.remote_missions.provider.bullets') : []).map((item, i) => (
                                    <div key={i}>
                                        <span className={`rcheck ${item.active ? 'green' : 'muted'}`}>{item.active ? "✓" : "○"}</span>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href={route('register')} className="oflem-btn oflem-btn-secondary oflem-btn-sm" style={{ width: '100%', fontSize: '15.5px', padding: '14px', textAlign: 'center', display: 'block', marginTop: 'auto' }}>
                                {t('homepage.remote_missions.provider.button')}
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};

const CookieBar = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    React.useEffect(() => {
        const consent = localStorage.getItem('oflem_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('oflem_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('oflem_cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`cookie-bar ${isVisible ? 'show shadow-2xl' : ''}`}>
            <div className="cookie-bar-inner">
                <p className="cookie-text">
                    {t('homepage.cookies.text')} <a className="underline cursor-pointer ml-1">{t('homepage.cookies.learn_more')}</a>
                </p>
                <div className="cookie-actions">
                    <button onClick={handleAccept} className="cookie-btn cookie-accept font-black">
                        {t('homepage.cookies.accept')}
                    </button>
                    <button onClick={handleDecline} className="cookie-btn cookie-decline font-bold">
                        {t('homepage.cookies.decline')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Welcome({ missions: initialMissions, providers: initialProviders, categories: initialCategories }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    /* 
    const pillars = [
        { 
            icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, 
            title: t('homepage.pillars_section.items.verified.title'), 
            text: t('homepage.pillars_section.items.verified.text'),
            bg: "linear-gradient(135deg, var(--o), var(--ol))"
        },
        { 
            icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, 
            title: t('homepage.pillars_section.items.escrow.title'), 
            text: t('homepage.pillars_section.items.escrow.text'),
            bg: "linear-gradient(135deg, var(--g), #34d399)"
        },
        { 
            icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, 
            title: t('homepage.pillars_section.items.local.title'), 
            text: t('homepage.pillars_section.items.local.text'),
            bg: "linear-gradient(135deg, #667eea, #764ba2)"
        },
        { 
            icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
            title: t('homepage.pillars_section.items.mediation.title'), 
            text: t('homepage.pillars_section.items.mediation.text'),
            bg: "linear-gradient(135deg, #f6ad55, #ed8936)"
        }
    ];
    */

    const scrollToHero = (e) => {
        if(e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    React.useEffect(() => {
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Typewriter effect logic 
    const examples = Array.isArray(t('homepage.hero.examples')) ? t('homepage.hero.examples') : [
        "Ex: Courses urgentes...", 
        "Aide pour ma déclaration...",
        "Passer à la déchetterie...",
        "Traduction d'un contrat...",
        "Besoin de 2 personnes..."
    ];
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    React.useEffect(() => {
        const handleTyping = () => {
            const currentExample = examples[currentExampleIndex];
            if (isDeleting) {
                setPlaceholder(prev => prev.substring(0, prev.length - 1));
                setTypingSpeed(30);
            } else {
                setPlaceholder(prev => currentExample.substring(0, prev.length + 1));
                setTypingSpeed(70);
            }

            if (!isDeleting && placeholder === currentExample) {
                setTimeout(() => setIsDeleting(true), 2500);
            } else if (isDeleting && placeholder === '') {
                setIsDeleting(false);
                setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, currentExampleIndex, examples, typingSpeed]);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm || isChecking) return;

        setIsChecking(true);
        setErrorMessage('');
        try {
            const response = await axios.post('/api/moderation/check', { content: searchTerm });
            if (response.data.is_clean) {
                router.get('/missions/create', { 
                    search: searchTerm,
                    improved_title: response.data.improved_title 
                });
            } else {
                setErrorMessage(t('Ce type de contenu n\'est pas autorisé sur Oflem. Veuillez modifier votre description.'));
            }
        } catch (error) {
            setErrorMessage(t('Une erreur est survenue lors de la vérification. Veuillez réessayer.'));
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="oflem-home-page">
            <Head title={t('homepage.hero.title_tag')} />
            
            {/* Header */}
            <header className={`oflem-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <a className="oflem-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            Oflem<span className="oflem-logo-dot">.</span>
                        </a>
                        <button className="oflem-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu" aria-expanded={mobileMenuOpen}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        </button>
                        <div className={`oflem-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                            <a href="#how-it-works">{t('homepage.nav.how_it_works')}</a>
                            <a href="#missions">{t('homepage.nav.missions')}</a>
                            <a href="#audience">{t('homepage.nav.audience')}</a>
                            <a href="#faq">{t('homepage.nav.faq')}</a>

                            <div className="lang-sep"></div>
                            <a className="oflem-nav-btn-login" onClick={() => router.get('/login')}>{t('homepage.nav.login')}</a>
                            <a className="oflem-nav-btn-signup" onClick={() => router.get('/register')}>{t('homepage.nav.register')}</a>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="oflem-hero">
                <div className="oflem-hero-orb oflem-hero-orb-1" />
                <div className="oflem-hero-orb oflem-hero-orb-2" />

                <div className="oflem-container">
                    <div className="oflem-hero-grid">
                        <div>
                            <div className="oflem-hero-eyebrow">
                                <span className="oflem-hero-eyebrow-dot"></span> {t('homepage.hero.badge')}
                            </div>

                            <h1 className="oflem-hero-h1">
                                <div className="line line-1"><span>{t('homepage.hero.line1')}</span></div>
                                <div className="line line-2"><span>{t('homepage.hero.line2')}</span></div>
                                <div className="line line-3"><span className="hero-orange">{t('homepage.hero.line3')}</span></div>
                            </h1>

                            <div className="oflem-hero-mantra">
                                {t('homepage.hero.mantra')} <span>{t('homepage.hero.mantra_sub')}</span>
                            </div>

                            <p className="oflem-hero-sub">
                                {t('homepage.hero.description')} <strong>{t('homepage.hero.protected')}</strong>.
                            </p>

                            <div className="oflem-pub-bar-wrap">
                                <form onSubmit={handleSearchSubmit} className="oflem-pub-bar">
                                    <div className="oflem-pub-bar-icon"><Search size={22} /></div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); if (errorMessage) setErrorMessage(''); }}
                                        placeholder={placeholder}
                                        className={`oflem-pub-bar-input${errorMessage ? ' border-red-400' : ''}`}
                                    />
                                    <button type="submit" disabled={isChecking} className="oflem-pub-bar-btn">
                                        {isChecking ? '...' : t('homepage.hero.pub_button')}
                                    </button>
                                </form>

                                {errorMessage && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginTop: '10px',
                                        padding: '10px 14px',
                                        background: '#fff1f0',
                                        border: '1px solid #fca5a5',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#b91c1c',
                                    }}>
                                        <span style={{ fontSize: '15px' }}>⚠️</span>
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="oflem-pub-bar-hint">
                                    <span><span className="oflem-pub-hint-check">✓</span> {t('homepage.hero.pub_hints.free')}</span>
                                    <span><span className="oflem-pub-hint-check">✓</span> {t('homepage.hero.pub_hints.no_commitment')}</span>
                                    <span><span className="oflem-pub-hint-check">✓</span> {t('homepage.hero.pub_hints.commission')}</span>
                                </div>
                            </div>

                            <div className="oflem-hero-actions">
                                 <Link 
                                    href={route('register', { role: 'provider' })} 
                                    className="oflem-btn oflem-btn-outline oflem-hero-cta"
                                >
                                    <span className="oflem-hero-cta-title">{t('homepage.hero.cta_provider')}</span>
                                    <span className="oflem-hero-cta-sub">{t('homepage.hero.cta_provider_sub')}</span>
                                </Link>
                            </div>

                            <div className="oflem-trust-row">
                                <div className="oflem-trust-item">
                                    <div className="oflem-trust-icon-wrap"><Shield size={18} /></div>
                                    <div className="oflem-trust-label"><strong>{t('homepage.hero.trust.payment')}<br />{t('homepage.hero.trust.secure')}</strong></div>
                                </div>
                                <div className="oflem-trust-item">
                                    <div className="oflem-trust-icon-wrap"><ShieldCheck size={18} /></div>
                                    <div className="oflem-trust-label"><strong>{t('homepage.hero.trust.providers')}<br />{t('homepage.hero.trust.verified')}</strong></div>
                                </div>
                                <div className="oflem-trust-item">
                                    <div className="oflem-trust-icon-wrap" style={{ background: '#fff', borderColor: 'var(--n)' }}>CH</div>
                                    <div className="oflem-trust-label"><strong>{t('homepage.hero.trust.data')}<br />{t('homepage.hero.trust.swiss')}</strong></div>
                                </div>
                            </div>
                            
                            <div className="oflem-hero-stamp">
                                <span className="oflem-hero-stamp-ch">CH</span>
                                {t('homepage.hero.stamp.made_in')} · {t('homepage.hero.stamp.hosting')} · <Link href={route('legal', { section: 'about' })} className="underline cursor-pointer" style={{ color: 'var(--o)', fontWeight: 700 }}>{t('homepage.hero.stamp.about')}</Link>
                            </div>
                        </div>

                        <div className="oflem-phone-wrap">
                            <div className="oflem-phone-mockup">
                                <div className="oflem-phone-notch" />
                                <div className="oflem-phone-screen">
                                    <div className="oflem-phone-topbar">
                                        <span className="oflem-phone-logo-sm">Oflem<span className="oflem-phone-logo-dot">.</span></span>
                                        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--g)', letterSpacing: '1px' }}>● EN LIGNE</span>
                                    </div>

                                    <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                                        <div style={{ background: '#fff5f0', border: '1px solid rgba(255,107,53,.3)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                                            <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--o)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{t('homepage.hero.phone_mock.label')}</div>
                                            <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--n)', marginBottom: '4px' }}>{t('homepage.hero.phone_mock.title')}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--g500)' }}>{t('homepage.hero.phone_mock.meta')}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--n)', marginTop: '4px' }}>{t('homepage.hero.phone_mock.budget')}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--n)', background: 'var(--g50)', padding: '8px 10px', borderRadius: '8px' }}>{t('homepage.hero.phone_mock.offers_received')}</span>
                                        </div>
                                    </div>

                                    <div className="oflem-offers-scroll">
                                        <div className="oflem-offers-scroll-inner">
                                            <div className="oflem-offer-card top">
                                                <span className="oflem-offer-badge-sm orange">{t('homepage.hero.phone_mock.badges.closest')}</span>
                                                <div className="oflem-offer-left-sm">
                                                    <div className="oflem-offer-av">LC</div>
                                                    <div>
                                                        <div className="oflem-offer-name">Léa C.</div>
                                                        <div className="oflem-offer-stars-sm">★★★★★</div>
                                                        <div className="oflem-offer-dist">800 m</div>
                                                    </div>
                                                </div>
                                                <div className="oflem-offer-price-sm">CHF 20.–</div>
                                            </div>
                                            <div className="oflem-offer-card">
                                                <span className="oflem-offer-badge-sm green">{t('Rapide')}</span>
                                                <div className="oflem-offer-left-sm">
                                                    <div className="oflem-offer-av">NT</div>
                                                    <div>
                                                        <div className="oflem-offer-name">Noah T.</div>
                                                        <div className="oflem-offer-stars-sm">★★★★★</div>
                                                        <div className="oflem-offer-dist">1.2 km</div>
                                                    </div>
                                                </div>
                                                <div className="oflem-offer-price-sm">CHF 25.–</div>
                                            </div>
                                            <div className="oflem-offer-card">
                                                <span className="oflem-offer-badge-sm purple">{t('Disponible')}</span>
                                                <div className="oflem-offer-left-sm">
                                                    <div className="oflem-offer-av">SM</div>
                                                    <div>
                                                        <div className="oflem-offer-name">Sara M.</div>
                                                        <div className="oflem-offer-stars-sm">★★★★☆</div>
                                                        <div className="oflem-offer-dist">2.1 km</div>
                                                    </div>
                                                </div>
                                                <div className="oflem-offer-price-sm">CHF 22.–</div>
                                            </div>
                                            {/* Repeating for infinite scroll feel */}
                                            <div className="oflem-offer-card top">
                                                <span className="oflem-offer-badge-sm orange">{t('Le plus proche')}</span>
                                                <div className="oflem-offer-left-sm">
                                                    <div className="oflem-offer-av">LC</div>
                                                    <div>
                                                        <div className="oflem-offer-name">Léa C.</div>
                                                        <div className="oflem-offer-stars-sm">★★★★★</div>
                                                        <div className="oflem-offer-dist">800 m</div>
                                                    </div>
                                                </div>
                                                <div className="oflem-offer-price-sm">CHF 20.–</div>
                                            </div>
                                            <div className="oflem-offer-card">
                                                <span className="oflem-offer-badge-sm green">{t('Rapide')}</span>
                                                <div className="oflem-offer-left-sm">
                                                    <div className="oflem-offer-av">NT</div>
                                                    <div>
                                                        <div className="oflem-offer-name">Noah T.</div>
                                                        <div className="oflem-offer-stars-sm">★★★★★</div>
                                                        <div className="oflem-offer-dist">1.2 km</div>
                                                    </div>
                                                </div>
                                                <div className="oflem-offer-price-sm">CHF 25.–</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <button className="oflem-choose-btn">{t('Choisir Léa C. →')}</button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ MISSIONS SECTION ═══ */}
            <section className="msv-section reveal visible" id="categories">
                <div className="oflem-container">
                    <AnimatedSection>
                        <div className="section-head" style={{ marginBottom: '48px' }}>
                            <div className="section-label">{t('homepage.categories_section.label')}</div>
                            <h2 className="section-title" style={{ fontSize: '42px' }}>{t('homepage.categories_section.title')}</h2>
                            <p className="section-sub">{t('homepage.categories_section.subtitle')}</p>
                        </div>
                    </AnimatedSection>
                    
                    <div className="cat-grid">
                        {[
                            { icon: '🐕', title: t('homepage.categories_section.items.pets.title'), sub: t('homepage.categories_section.items.pets.sub'), category: 'Promenade et animaux' },
                            { icon: '🔧', title: t('homepage.categories_section.items.bricolage.title'), sub: t('homepage.categories_section.items.bricolage.sub'), category: 'Montage et bricolage' },
                            { icon: '🧹', title: t('homepage.categories_section.items.cleaning.title'), sub: t('homepage.categories_section.items.cleaning.sub'), category: 'Nettoyage et entretien' },
                            { icon: '🌿', title: t('homepage.categories_section.items.gardening.title'), sub: t('homepage.categories_section.items.gardening.sub'), category: 'Jardinage et extérieur' },
                            { icon: '📦', title: t('homepage.categories_section.items.daily.title'), sub: t('homepage.categories_section.items.daily.sub'), category: 'Aide quotidienne' },
                            { icon: '📋', title: t('homepage.categories_section.items.admin.title'), sub: t('homepage.categories_section.items.admin.sub'), category: 'Aide administrative' },
                            { icon: '🖥️', title: t('homepage.categories_section.items.remote.title'), sub: t('homepage.categories_section.items.remote.sub'), category: 'Mission à distance' },
                            { icon: '✦', title: t('homepage.categories_section.items.other.title'), sub: t('homepage.categories_section.items.other.sub'), cta: true }
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={`${50 * i}ms`}>
                                <div 
                                    className={`cat-tile ${item.cta ? 'cat-tile-cta' : ''}`}
                                    onClick={item.cta ? (e) => scrollToHero(e) : () => router.get(route('missions.create', { category: item.category }))}
                                >
                                    <div className="cat-icon">{item.icon}</div>
                                    <div className="cat-title">{item.title}</div>
                                    <div className="cat-sub">{item.sub}</div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS SECTION ═══ */}
            <section className="oflem-section" id="how-it-works">
                <div className="oflem-container">
                    <div className="oflem-section-head">
                        <AnimatedSection>
                            <span className="oflem-section-label">{t('homepage.how_it_works.label')}</span>
                            <h2 className="oflem-section-title">{t('homepage.how_it_works.title')}</h2>
                        </AnimatedSection>
                    </div>
                    
                    <div className="oflem-how-grid">
                        <div className="oflem-steps">
                            {[
                                { num: '1', title: t('homepage.how_it_works.steps.step1.title'), desc: t('homepage.how_it_works.steps.step1.desc') },
                                { num: '2', title: t('homepage.how_it_works.steps.step2.title'), desc: t('homepage.how_it_works.steps.step2.desc') },
                                { num: '3', title: t('homepage.how_it_works.steps.step3.title'), desc: t('homepage.how_it_works.steps.step3.desc') }
                            ].map((step, i) => (
                                <AnimatedSection key={i} delay={`${20 * i}ms`}>
                                    <div className="oflem-step">
                                        <div className="oflem-step-num">{step.num}</div>
                                        <div>
                                            <h3 className="oflem-step-title">{step.title}</h3>
                                            <p className="oflem-step-desc">{step.desc}</p>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            ))}
                        </div>
                        
                        <AnimatedSection delay="400ms">
                            <MapMock />
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* ═══ WHY OFLEM SECTION (Trust Pillars) ═══ */}
            <section className="oflem-section section section-gray oflem-section-gray reveal visible" id="why-oflem">
                <div className="oflem-container">
                    <div className="section-head reveal visible">
                        <AnimatedSection>
                            <div className="section-label">{t('homepage.pillars_section.label')}</div>
                            <h2 className="section-title">
                                {t('homepage.pillars_section.title')}
                                <br />
                                {t('homepage.pillars_section.title_sub')}
                            </h2>
                            <p className="section-sub">{t('homepage.pillars_section.description')}</p>
                        </AnimatedSection>
                    </div>

                    <div className="pillar-grid reveal visible" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '900px' }}>
                        <AnimatedSection delay="0ms">
                            <article className="pillar-card" style={{ textAlign: 'left' }}>
                                <div className="pillar-icon-wrap" style={{ background: 'linear-gradient(135deg,var(--o),var(--ol))' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                </div>
                                <h3 className="pillar-title">{t('homepage.pillars_section.items.verified.title')}</h3>
                                <p className="pillar-text">{t('homepage.pillars_section.items.verified.text')}</p>
                            </article>
                        </AnimatedSection>

                        <AnimatedSection delay="100ms">
                            <article className="pillar-card" style={{ textAlign: 'left' }}>
                                <div className="pillar-icon-wrap" style={{ background: 'linear-gradient(135deg,var(--g),#34d399)' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                </div>
                                <h3 className="pillar-title">{t('homepage.pillars_section.items.escrow.title')}</h3>
                                <p className="pillar-text">{t('homepage.pillars_section.items.escrow.text')}</p>
                            </article>
                        </AnimatedSection>

                        <AnimatedSection delay="200ms">
                            <article className="pillar-card" style={{ textAlign: 'left' }}>
                                <div className="pillar-icon-wrap" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                                </div>
                                <h3 className="pillar-title">{t('homepage.pillars_section.items.local.title')}</h3>
                                <p className="pillar-text">{t('homepage.pillars_section.items.local.text')}</p>
                            </article>
                        </AnimatedSection>

                        <AnimatedSection delay="300ms">
                            <article className="pillar-card" style={{ textAlign: 'left' }}>
                                <div className="pillar-icon-wrap" style={{ background: 'linear-gradient(135deg,#f6ad55,#ed8936)' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                                </div>
                                <h3 className="pillar-title">{t('homepage.pillars_section.items.mediation.title')}</h3>
                                <p className="pillar-text">{t('homepage.pillars_section.items.mediation.text')}</p>
                            </article>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Previous Why Oflem Section Commented Out
            <section className="oflem-section section section-gray oflem-section-gray reveal visible" id="why-oflem">
                <div className="oflem-container">
                    <div className="section-head">
                        <AnimatedSection>
                            <div className="section-label">{t('homepage.pillars_section.label')}</div>
                            <h2 className="section-title">{t('homepage.pillars_section.title')}<br />{t('homepage.pillars_section.title_sub')}</h2>
                            <p className="section-sub">{t('homepage.pillars_section.description')}</p>
                        </AnimatedSection>
                    </div>

                    <div className="pillar-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '900px' }}>
                        {pillars.map((pillar, i) => (
                            <AnimatedSection key={i} delay={`${100 * i}ms`}>
                                <div className="pillar-card" style={{ textAlign: 'left' }}>
                                    <div className="pillar-icon-wrap" style={{ background: pillar.bg }}>
                                        {pillar.icon}
                                    </div>
                                    <h3 className="pillar-title">{pillar.title}</h3>
                                    <p className="pillar-text">{pillar.text}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>
            */}

            {/* ═══ PRICING / COMMISSION SECTION ═══ */}
            <section className="oflem-section section section-white oflem-section-gray reveal visible" id="pricing">
                <div className="oflem-container">
                    <div className="section-head" style={{ marginBottom: '0px' }}>
                        <AnimatedSection>
                            <div className="section-label" style={{ marginBottom: '10px' }}>{t('homepage.pricing.label')}</div>
                            <h3 className="comm-title">{t('homepage.pricing.title')}</h3>
                            <p className="comm-intro">{t('homepage.pricing.description')}</p>
                        </AnimatedSection>
                    </div>

                    <div className="commission-wrap" style={{ marginTop: '0px' }}>
                        <div className="commission-tiers">
                            {/* Petites missions */}
                            <AnimatedSection delay="100ms">
                                <div className="ctier ctier-sm">
                                    <div className="ctier-bar"></div>
                                    <div className="ctier-label">{t('homepage.pricing.tiers.small.label')}</div>
                                    <div className="ctier-rate">25<span>%</span></div>
                                    <div className="ctier-range">{t('homepage.pricing.tiers.small.range')}</div>
                                    <div className="ctier-example">{t('homepage.pricing.tiers.small.example')}</div>
                                </div>
                            </AnimatedSection>

                            {/* Missions courantes */}
                            <AnimatedSection delay="200ms">
                                <div className="ctier ctier-md">
                                    <div className="ctier-bar"></div>
                                    <div className="ctier-badge">{t('homepage.pricing.tiers.medium.badge')}</div>
                                    <div className="ctier-label">{t('homepage.pricing.tiers.medium.label')}</div>
                                    <div className="ctier-rate">20<span>%</span></div>
                                    <div className="ctier-range">{t('homepage.pricing.tiers.medium.range')}</div>
                                    <div className="ctier-example">{t('homepage.pricing.tiers.medium.example')}</div>
                                </div>
                            </AnimatedSection>

                            {/* Grands projets */}
                            <AnimatedSection delay="300ms">
                                <div className="ctier ctier-lg">
                                    <div className="ctier-bar"></div>
                                    <div className="ctier-badge ctier-badge-g">{t('homepage.pricing.tiers.large.badge')}</div>
                                    <div className="ctier-label">{t('homepage.pricing.tiers.large.label')}</div>
                                    <div className="ctier-rate">12<span>%</span></div>
                                    <div className="ctier-range">{t('homepage.pricing.tiers.large.range')}</div>
                                    <div className="ctier-example">{t('homepage.pricing.tiers.large.example')}</div>
                                </div>
                            </AnimatedSection>
                        </div>

                        <div className="comm-info-grid">
                            <AnimatedSection delay="400ms">
                                <div className="comm-info-box">
                                    <h4>{t('homepage.pricing.info.providers.title')}</h4>
                                    <p>{t('homepage.pricing.info.providers.text')}</p>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection delay="500ms">
                                <div className="comm-info-box">
                                    <h4>{t('homepage.pricing.info.purpose.title')}</h4>
                                    <p>{t('homepage.pricing.info.purpose.text')}</p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ AUDIENCE SECTION ═══ */}
            <section className="oflem-section oflem-section-white" id="audience">
                <div className="oflem-container">
                    <div className="section-head">
                        <AnimatedSection>
                            <div className="section-label">{t('homepage.audience.label')}</div>
                            <h2 className="section-title">{t('homepage.audience.title')}<br />{t('homepage.audience.subtitle')}</h2>
                        </AnimatedSection>
                    </div>
                    
                    <div className="audience-split">
                        <AnimatedSection delay="100ms">
                            <div className="audience-card client">
                                <span className="aud-tag client-tag">{t('homepage.audience.client.tag')}</span>
                                <h3>{t('homepage.audience.client.title')}</h3>
                                <p>{t('homepage.audience.client.description')}</p>
                                <ul className="aud-bullets">
                                    {(Array.isArray(t('homepage.audience.client.bullets')) ? t('homepage.audience.client.bullets') : []).map((check, i) => (
                                        <li key={i}>{check}</li>
                                    ))}
                                </ul>
                                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="oflem-btn oflem-btn-primary" style={{ width: '100%', fontSize: '16px', padding: '15px', marginTop: 'auto' }}>{t('homepage.audience.client.button')}</button>
                            </div>
                        </AnimatedSection>
                        
                        <AnimatedSection delay="300ms">
                            <div className="audience-card provider">
                                <span className="aud-tag provider-tag">{t('homepage.audience.provider.tag')}</span>
                                <h3>{t('homepage.audience.provider.title')}</h3>
                                <p>{t('homepage.audience.provider.description')}</p>
                                <ul className="aud-bullets">
                                    {(Array.isArray(t('homepage.audience.provider.bullets')) ? t('homepage.audience.provider.bullets') : []).map((check, i) => (
                                        <li key={i}>{check}</li>
                                    ))}
                                </ul>
                                <Link href={route('register')} className="oflem-btn oflem-btn-secondary" style={{ width: '100%', fontSize: '16px', padding: '15px', textAlign: 'center', display: 'block', marginTop: 'auto' }}>{t('homepage.audience.provider.button')}</Link>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* ═══ REMOTE MISSIONS SECTION ═══ */}
            <RemoteMissions t={t} scrollToHero={scrollToHero} />

            {/* ═══ FAQ SECTION ═══ */}
            <FAQSection t={t} />
            <FinalCTA t={t} />
            
            <Footer />
            <CookieBar />

        </div>
    );
}
