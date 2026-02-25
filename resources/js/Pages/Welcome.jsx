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
            className={`${className} transition-all duration-700 transform ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
            {children}
        </div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`faq-item group bg-white border border-zinc-200 rounded-rs mb-3 overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-oflem-terracotta/10 border-oflem-terracotta/30' : 'hover:border-oflem-terracotta/30'}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex justify-between items-center text-left"
            >
                <strong className="text-[15px] font-black text-oflem-charcoal tracking-tight">{question}</strong>
                <div className={`faq-chev w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-50 border border-zinc-200 transition-all duration-300 ${isOpen ? 'rotate-180 bg-orange-50 border-orange-200' : ''}`}>
                    <ChevronDown className={`w-4 h-4 text-oflem-charcoal ${isOpen ? 'text-oflem-terracotta' : ''}`} />
                </div>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[300px] border-t border-zinc-100' : 'max-h-0'}`}>
                <div className="p-5 text-[14.5px] text-zinc-600 leading-[1.85]">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const CommissionTiers = ({ t }) => (
    <div className="max-w-[960px] mx-auto mt-10">
        <div className="text-center max-w-[600px] mx-auto mb-10">
            <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-2 block">{t('Tarification')}</span>
            <h3 className="text-2xl sm:text-3xl font-black text-oflem-charcoal mb-4">{t('Une commission simple, affichée avant paiement')}</h3>
            <p className="text-zinc-500 font-medium leading-relaxed">{t('Publier est gratuit. Quand vous acceptez une offre, vous payez le prix du prestataire plus la commission Oflem, visible avant de confirmer.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Small Tier */}
            <div className="bg-white rounded-2xl p-8 relative overflow-hidden flex flex-col gap-2 border-2 border-zinc-100 shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-400 to-zinc-300" />
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">{t('Petites missions')}</div>
                <div className="text-5xl font-black tracking-tighter text-oflem-charcoal">25<span className="text-2xl ml-0.5">%</span></div>
                <div className="text-[13px] font-bold text-zinc-500">{t("Jusqu'à CHF 149")}</div>
                <div className="bg-zinc-50 rounded-xl p-3 text-[12px] text-zinc-600 mt-4 leading-relaxed">
                    {t('Prestataire : CHF 40 → ')}<strong>{t('Vous payez : CHF 50')}</strong>
                </div>
            </div>

            {/* Medium Tier */}
            <div className="bg-white rounded-2xl p-8 relative overflow-hidden flex flex-col gap-2 border-2 border-oflem-terracotta/30 shadow-lg shadow-oflem-terracotta/5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-oflem-terracotta to-oflem-terracotta-light" />
                <div className="absolute top-3 right-3 bg-oflem-terracotta text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">{t('Le plus courant')}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">{t('Missions courantes')}</div>
                <div className="text-5xl font-black tracking-tighter text-oflem-terracotta">20<span className="text-2xl ml-0.5">%</span></div>
                <div className="text-[13px] font-bold text-zinc-500">{t('CHF 150 à CHF 499')}</div>
                <div className="bg-orange-50 rounded-xl p-3 text-[12px] text-zinc-700 mt-4 leading-relaxed">
                    {t('Prestataire : CHF 200 → ')}<strong>{t('Vous payez : CHF 240')}</strong>
                </div>
            </div>

            {/* Large Tier */}
            <div className="bg-white rounded-2xl p-8 relative overflow-hidden flex flex-col gap-2 border-2 border-oflem-green/30 shadow-lg shadow-oflem-green/5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-oflem-green to-emerald-400" />
                <div className="absolute top-3 right-3 bg-oflem-green text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">{t('Meilleur taux')}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">{t('Grands projets')}</div>
                <div className="text-5xl font-black tracking-tighter text-oflem-green">12<span className="text-2xl ml-0.5">%</span></div>
                <div className="text-[13px] font-bold text-zinc-500">{t('Dès CHF 500')}</div>
                <div className="bg-emerald-50 rounded-xl p-3 text-[12px] text-zinc-700 mt-4 leading-relaxed">
                    {t('Prestataire : CHF 600 → ')}<strong>{t('Vous payez : CHF 672')}</strong>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[780px] mx-auto">
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                <div className="text-[13px] font-black text-oflem-charcoal mb-2">{t('Pour les prestataires')}</div>
                <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
                    {t("Le prestataire reçoit 100% de ce qu'il a proposé. La commission est côté client : sa rémunération est nette, dès le départ.")}
                </p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                <div className="text-[13px] font-black text-oflem-charcoal mb-2">{t('À quoi elle sert')}</div>
                <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
                    {t('Vérification des prestataires, protection du paiement par séquestre, support en cas de litige. Pas un simple mur d\'annonces.')}
                </p>
            </div>
        </div>
    </div>
);

const RemoteMissions = ({ t }) => (
    <section className="py-24 bg-zinc-50 relative overflow-hidden" id="remote">
        <div className="container mx-auto px-6 relative z-10">
            <div className="section-head mb-16">
                <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('Missions à distance')}</span>
                <h2 className="text-4xl font-black text-oflem-charcoal mb-6 tracking-tight uppercase leading-[1.1]">
                    {t("Certaines choses n'ont pas besoin")}<br />{t('de déplacement.')}
                </h2>
                <p className="text-lg text-zinc-500 font-medium max-w-3xl leading-relaxed">
                    {t("Déclaration d'impôts, traduction de documents, aide pour comprendre un courrier officiel, relecture d'un dossier, mise en page professionnelle. Ces missions se font intégralement en ligne.")}
                </p>
            </div>

            {/* Remote Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                {[
                    t("Aide pour ma déclaration d'impôts vaudoise, régime indépendant"),
                    t("Traduction d'un contrat allemand vers le français"),
                    t("Révision de mon CV pour un poste en Suisse alémanique"),
                    t("M'expliquer mon décompte de caisse maladie")
                ].map((text, i) => (
                    <div key={i} className="bg-white border-2 border-zinc-100 rounded-2xl p-6 flex items-center shadow-sm">
                        <p className="text-[13px] text-zinc-600 font-medium italic leading-relaxed">
                            <span className="text-oflem-terracotta font-black text-xl mr-1">"</span>{text}<span className="text-oflem-terracotta font-black text-xl ml-1">"</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-zinc-100 border-t-4 border-t-oflem-terracotta rounded-3xl p-8 md:p-12 flex flex-col shadow-xl ring-1 ring-black/5">
                    <div className="text-3xl mb-6">👤</div>
                    <h4 className="text-xl font-black text-oflem-charcoal mb-4 leading-snug">{t('Vous avez un besoin à distance')}</h4>
                    <p className="text-[14px] text-zinc-500 leading-relaxed font-medium mb-10">
                        {t('Décrivez votre demande librement. Un prestataire qualifié travaille depuis chez lui et vous livre le résultat. Paiement protégé, comme pour toute mission Oflem.')}
                    </p>
                    <Link href={route('missions.create')} className="mt-auto px-6 py-4 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white rounded-xl font-black text-xs uppercase tracking-widest text-center shadow-sho hover:scale-[1.02] transition-transform">
                        {t('Publier une mission à distance')}
                    </Link>
                </div>

                <div className="bg-white border-2 border-zinc-100 border-t-4 border-t-zinc-900 rounded-3xl p-8 md:p-12 flex flex-col shadow-xl ring-1 ring-black/5">
                    <div className="text-3xl mb-6">🖥️</div>
                    <h4 className="text-xl font-black text-oflem-charcoal mb-4 leading-snug">{t('Vous proposez vos compétences à distance')}</h4>
                    <p className="text-[14px] text-zinc-500 leading-relaxed font-medium mb-8">
                        {t('Les prestataires "remote only" passent par un contrôle d\'identité allégé. En contrepartie, ils n\'accèdent qu\'aux missions à distance.')}
                    </p>
                    <div className="space-y-3 mb-10">
                        {[
                            { label: t('Inscription simplifiée, identité seule'), active: true },
                            { label: t('Missions depuis chez vous, à votre rythme'), active: true },
                            { label: t('100% de votre offre vous revient'), active: true },
                            { label: t('Accès limité aux missions à distance uniquement'), active: false }
                        ].map((check, i) => (
                            <div key={i} className="flex items-center gap-3 text-[13px] font-bold">
                                {check.active ? (
                                    <CheckCircle2 size={16} className="text-oflem-green" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />
                                )}
                                <span className={check.active ? 'text-zinc-700' : 'text-zinc-400'}>{check.label}</span>
                            </div>
                        ))}
                    </div>
                    <Link href={route('register')} className="mt-auto px-6 py-4 bg-oflem-charcoal text-white rounded-xl font-black text-xs uppercase tracking-widest text-center shadow-sho hover:scale-[1.02] transition-transform">
                        {t('Créer mon profil prestataire')}
                    </Link>
                </div>
            </div>
        </div>
    </section>
);

const HowItWorksSteps = ({ t }) => (
    <div className="steps-container space-y-12">
        <AnimatedSection>
            <div className="section-head mb-12">
                <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('How it works')}</span>
                <h2 className="text-4xl font-black text-oflem-charcoal tracking-tight uppercase leading-none">{t('Three steps. No more.')}</h2>
            </div>
        </AnimatedSection>

        {[
            { 
                num: 1, 
                title: t('Describe what you need'), 
                desc: t('One sentence is enough. "Help with my Vaud tax return" or "Someone to assemble a wardrobe Saturday morning in Montreux". Indicate your budget. Posting is free and without commitment.') 
            },
            { 
                num: 2, 
                title: t('Verified providers respond'), 
                desc: t('People near you, verified by Oflem, consult your request and make a proposal. You compare, you choose, without pressure.') 
            },
            { 
                num: 3, 
                title: t('You only pay when everything is finished'), 
                desc: t('The amount is set aside safely. The provider is paid only after validation from you. In case of a problem, our team intervenes.') 
            }
        ].map((step, i) => (
            <AnimatedSection key={i} delay={`${100 * i}ms`}>
                <div className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-full bg-oflem-charcoal text-white flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-oflem-terracotta transition-colors duration-300">
                        {step.num}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-oflem-charcoal mb-3 tracking-tight group-hover:text-oflem-terracotta transition-colors">{step.title}</h3>
                        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                </div>
            </AnimatedSection>
        ))}
    </div>
);

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
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] z-[1000] animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="bg-oflem-charcoal/97 backdrop-blur-md text-white p-6 rounded-rl shadow-2xl border border-zinc-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-[15px] font-black uppercase tracking-wider">{t('Cookies & Privacy')}</h4>
                        <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <PlusCircle className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                    <p className="text-[13px] text-zinc-400 font-medium leading-relaxed mb-6">
                        {t('We use cookies to improve your experience and ensure the security of your transactions in Switzerland.')}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={handleAccept} className="flex-1 py-2.5 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white text-[12px] font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] transition-transform">
                            {t('Accept')}
                        </button>
                        <button onClick={handleDecline} className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 text-[12px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors">
                            {t('Decline')}
                        </button>
                    </div>
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

    // Social Proof Control Flag
    // In Switzerland, it is legally forbidden to use fake testimonials or placeholder numbers.
    // Deactivate visually until real data is available.
    const SHOW_SOCIAL_PROOF = false;
    
    // Typewriter effect logic
    const examples = [
        t('walk my dog'),
        t('fix my sink'),
        t('assemble IKEA furniture'),
        t('do my groceries'),
        t('clean my apartment'),
        t('water my plants')
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
                setTypingSpeed(50);
            } else {
                setPlaceholder(prev => currentExample.substring(0, prev.length + 1));
                setTypingSpeed(150);
            }

            if (!isDeleting && placeholder === currentExample) {
                setTimeout(() => setIsDeleting(true), 1500);
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
            const response = await axios.post(route('api.moderation.check'), { content: searchTerm });
            if (response.data.is_clean) {
                router.get(route('missions.create'), { 
                    search: searchTerm,
                    improved_title: response.data.improved_title 
                });
            } else {
                setErrorMessage(t('Your description contains unauthorized words. Please modify it.'));
            }
        } catch (error) {
            setErrorMessage(t('An error occurred during verification. Please try again.'));
        } finally {
            setIsChecking(false);
        }
    };

    const pillars = [
        { 
            title: t('Verified Providers'), 
            text: t('Identity document, right to work in Switzerland, verified qualifications. Someone validated by the platform.'), 
            icon: <ShieldCheck className="w-8 h-8 text-white" />,
            bg: "bg-oflem-charcoal"
        },
        { 
            title: t('Money via Escrow'), 
            text: t('Funds are held and only released when you validate the work. No advances, no bad surprises.'), 
            icon: <Coins className="w-8 h-8 text-white" />,
            bg: "bg-oflem-green"
        },
        { 
            title: t('Near you'), 
            text: t('Each provider lives in your region. Not someone 200 km away, but a person who knows your area.'), 
            icon: <Users className="w-8 h-8 text-white" />,
            bg: "bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light"
        },
        { 
            title: t('Mediation & Disputes'), 
            text: t('In case of issues, our team intervenes. Funds remain held until the problem is resolved.'), 
            icon: <Shield className="w-8 h-8 text-white" />,
            bg: "bg-oflem-navy"
        },
    ];

    const missions = initialMissions || [
        { id: 1, title: t('Apartment Move 3.5'), loc: 'Lausanne, VD', price: '450', tag: 'default', desc: t('Help carrying boxes and some heavy furniture this Saturday.') },
        { id: 2, title: t('Sink Leak Repair'), loc: 'Genève, GE', price: '85', tag: 'default', desc: t('The kitchen faucet is dripping. Already tried tightening, without success.') },
        { id: 3, title: t('Lawn Mowing (200m2)'), loc: 'Fribourg, FR', price: '60', tag: 'default', desc: t('Need a quick pass before tomorrow evening\'s rain.') },
    ];

    const [activeTab, setActiveTab] = useState('seek');

    return (
        <div className="min-h-screen bg-white font-sans text-oflem-charcoal selection:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/20">
            <Head title={t('Oflem — What if you didn\'t have to do it all alone?')} />
            
            <Header />

            {/* Hero Section */}
            <section className="hero relative pt-20 pb-24 overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
                {/* Decorative Orbs */}
                <div className="absolute top-[-200px] right-[-150px] w-[600px] h-[600px] bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/10 rounded-full blur-[80px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse-slow delay-1000" />

                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-16 items-center">
                        <div>
                            <AnimatedSection delay="100ms">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-oflem-terracotta/25 rounded-full mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-oflem-green animate-pulse" />
                                    <span className="text-[13px] font-black uppercase tracking-wider text-oflem-terracotta">
                                        {auth.user ? `${t('Welcome back')}, ${auth.user.name.split(' ')[0]}` : t('Verified providers in Switzerland')}
                                    </span>
                                </div>
                            </AnimatedSection>

                            <AnimatedSection delay="250ms">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.1] tracking-[-2px] mb-6">
                                    {t('What if you didn\'t have to')}<br />
                                    <span className="text-oflem-terracotta underline decoration-oflem-terracotta/20 underline-offset-8 italic font-serif">{t('do it all alone?')}</span>
                                </h1>
                            </AnimatedSection>

                            <AnimatedSection delay="400ms">
                                <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-medium leading-[1.7] max-w-[560px] mb-10">
                                    {t('Someone near you can take care of it.')} <strong className="text-oflem-charcoal font-extrabold">{t('Post for free')}</strong>, {t('receive offers from verified providers in French-speaking Switzerland.')}
                                </p>
                            </AnimatedSection>

                            <AnimatedSection delay="550ms" className="max-w-xl">
                                <form onSubmit={handleSearchSubmit} className="pub-bar flex flex-col sm:flex-row items-stretch bg-white border-[2.5px] border-zinc-200 rounded-rl shadow-sh hover:border-oflem-terracotta/40 focus-within:border-oflem-terracotta focus-within:shadow-[0_12px_40px_rgba(255,107,53,0.20),0_0_0_4px_rgba(255,107,53,0.08)] transition-all duration-300 overflow-hidden">
                                    <div className="flex items-center px-5 py-4 sm:py-0 text-[#c0ccd8]">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={searchTerm ? '' : placeholder}
                                        className="flex-1 border-none bg-transparent outline-none px-5 sm:px-0 py-4 sm:py-[22px] text-[17px] font-semibold text-oflem-charcoal placeholder:text-zinc-300 min-w-0"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isChecking}
                                        className="m-2 px-6 sm:px-8 py-4 sm:py-0 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white rounded-rs font-extrabold text-[15px] shadow-sho hover:scale-[1.03] transition-transform flex items-center justify-center gap-2 flex-shrink-0"
                                    >
                                        {isChecking ? '...' : <>{t('Post my request')} <ArrowRight size={16} className="inline ml-1" /></>}
                                    </button>
                                </form>
                                <div className="pub-bar-hint flex items-center justify-center sm:justify-start flex-wrap gap-x-5 gap-y-2 mt-4 text-[12.5px] font-bold text-zinc-500">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-oflem-green" /> {t('Free')}</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-oflem-green" /> {t('No commitment')}</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-oflem-green" /> {t('Commission displayed before payment')}</span>
                                </div>
                                
                                {errorMessage && (
                                    <div className="mt-3 text-red-500 text-sm font-bold animate-shake">{errorMessage}</div>
                                )}

                                {/* Hero Stamp */}
                                {SHOW_SOCIAL_PROOF && (
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-3 mt-8 pt-4 text-center sm:text-left">
                                        <div className="flex -space-x-3">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 overflow-hidden shadow-sm">
                                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-oflem-charcoal text-white flex items-center justify-center text-[10px] font-black shadow-sm">+4k</div>
                                        </div>
                                        <div className="text-[12px] font-bold text-zinc-500 leading-tight">
                                            <span className="text-oflem-charcoal font-black block uppercase tracking-tight">{t('1,400+ Successful missions')}</span>
                                            {t('in French-speaking Switzerland this week')}
                                        </div>
                                    </div>
                                )}
                            </AnimatedSection>

                             <AnimatedSection delay="700ms" className="mt-8 pt-8 border-t border-zinc-200/60">
                                <div className="flex flex-col sm:flex-row flex-wrap gap-x-10 gap-y-6 items-start sm:items-center">
                                    <div className="flex items-center gap-3.5 group">
                                        <div className="w-11 h-11 rounded-full border-2 border-zinc-100 bg-white flex items-center justify-center text-oflem-charcoal shadow-sm group-hover:border-oflem-terracotta/30 group-hover:bg-orange-50 transition-all">
                                            <Shield className="w-5 h-5 text-oflem-terracotta" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11.5px] font-black text-oflem-charcoal uppercase tracking-wider">{t('Secure payment')}</span>
                                            <span className="text-[10px] font-bold text-zinc-400">{t('Escrow protected')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3.5 group">
                                        <div className="w-11 h-11 rounded-full border-2 border-zinc-100 bg-white flex items-center justify-center text-oflem-charcoal shadow-sm group-hover:border-oflem-green/30 group-hover:bg-green-50 transition-all">
                                            <CheckCircle2 className="w-5 h-5 text-oflem-green" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11.5px] font-black text-oflem-charcoal uppercase tracking-wider">{t('Verified providers')}</span>
                                            <span className="text-[10px] font-bold text-zinc-400">{t('Identity & Skills')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3.5 group">
                                        <div className="w-11 h-11 rounded-full border-2 border-zinc-100 bg-white flex items-center justify-center shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                                            <span className="text-[10px] font-black text-oflem-charcoal">CH</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11.5px] font-black text-oflem-charcoal uppercase tracking-wider">{t('Swiss Data')}</span>
                                            <span className="text-[10px] font-bold text-zinc-400">{t('Hosted in Geneva')}</span>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>

                        {/* Phone Mockup Desktop only */}
                        <div className="hidden lg:block">
                            <AnimatedSection delay="400ms" className="phone-wrap flex items-center justify-center">
                                <div className="phone-mockup relative w-[320px] bg-oflem-charcoal rounded-[44px] p-2 border-[10px] border-oflem-charcoal shadow-2xl animate-phone-float overflow-hidden">
                                    <div className="phone-notch absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-oflem-charcoal rounded-b-[18px] z-20" />
                                    <div className="phone-screen bg-zinc-50 rounded-[32px] h-[560px] p-5 pt-8 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-xl font-black text-oflem-charcoal">Oflem<span className="text-oflem-terracotta">.</span></span>
                                            <div className="bg-oflem-green text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse uppercase">Live</div>
                                        </div>
                                        
                                        <div className="offers-scroll relative h-[290px] overflow-hidden mb-6">
                                            {/* Top/Bottom Fade Overlays */}
                                            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-zinc-50 to-transparent z-10 pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-50 to-transparent z-10 pointer-events-none" />
                                            
                                            <div className="offers-scroll-inner flex flex-col gap-3 py-4 animate-scroll-up">
                                                {(initialProviders?.length > 0 ? initialProviders : [
                                                    { name: 'Léa C.', price: '20', badge: t('CLOSEST'), tagColor: 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light', stars: 5, dist: '800 m' },
                                                    { name: 'Noah T.', price: '25', badge: t('FAST'), tagColor: 'bg-oflem-green', stars: 5, dist: '1.2 km' },
                                                    { name: 'Sara M.', price: '22', badge: t('AVAILABLE'), tagColor: 'bg-blue-500', stars: 4, dist: '2.1 km' },
                                                ]).map((offer, i) => (
                                                    <div key={i} className={`p-4 bg-white rounded-xl border-2 transition-all duration-500 relative ${offer.badge === t('CLOSEST') ? 'border-oflem-terracotta' : 'border-zinc-100'}`}>
                                                        {offer.badge && (
                                                            <span className={`${offer.tagColor || 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light'} text-white text-[8px] font-black px-2 py-0.5 rounded-lg absolute top-2 right-2 uppercase tracking-wider`}>
                                                                {offer.badge}
                                                            </span>
                                                        )}
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-oflem-charcoal text-white flex items-center justify-center font-black text-xs">
                                                                    {offer.name.split(' ').map(n => n[0]).join('')}
                                                                </div>
                                                                <div>
                                                                    <div className="flex justify-between items-center w-full">
                                                                        <h4 className="text-[13px] font-black">{offer.name}</h4>
                                                                    </div>
                                                                    {SHOW_SOCIAL_PROOF && (
                                                                        <div className="flex text-[#FFD23F] text-[10px] mb-1">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <Star key={i} className={`w-2.5 h-2.5 fill-current ${i < offer.stars ? 'text-[#FFD23F]' : 'text-zinc-200'}`} />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-[10px] text-zinc-400 font-bold">{offer.dist}</div>
                                                                </div>
                                                            </div>
                                                            <div className={`text-[16px] font-black mt-4 ${offer.badge === t('CLOSEST') ? 'text-oflem-terracotta' : 'text-zinc-900'}`}>
                                                                CHF {offer.price}.–
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-6 left-5 right-5 z-20">
                                            <button className="w-full bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white py-4 rounded-xl font-black text-xs text-center shadow-sho hover:scale-[1.02] transition-transform">
                                                {t('CHOOSE THIS OFFER')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1. Categories (Wild Missions Grid) - Aligned to Haykel's White Design */}
            <section className="py-24 bg-white border-b border-zinc-100" id="categories">
                <div className="container mx-auto px-6">
                    <div className="section-head mb-16 text-center">
                        <AnimatedSection>
                            <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('Endless possibilities')}</span>
                            <h2 className="text-4xl font-black text-oflem-charcoal mb-4 uppercase tracking-tight leading-none">{t('Missions Sauvages')}</h2>
                            <p className="text-lg text-zinc-500 font-medium max-w-2xl mx-auto">{t('What will you delegate today?')}</p>
                        </AnimatedSection>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 border border-zinc-100 rounded-rl overflow-hidden shadow-sm">
                        {[
                            { name: t('Cleaning'), icon: "🧹", desc: t('Apartment, window...') },
                            { name: t('Handyman'), icon: "🔧", desc: t('Fix, assemble, drill...') },
                            { name: t('Delivery'), icon: "📦", desc: t('Groceries, parcels...') },
                            { name: t('IT Help'), icon: "🖥️", desc: t('Update, troubleshooting...') },
                            { name: t('Gardening'), icon: "🌿", desc: t('Tall grass, leaves...') },
                            { name: t('Moving'), icon: "🚚", desc: t('Boxes, heavy furniture...') },
                            { name: t('Pets'), icon: "🐕", desc: t('Walking, sitting...') },
                            { name: t('Admin'), icon: "📋", desc: t('Letters, taxes...') },
                            { name: t('Furniture'), icon: "🪑", desc: t('IKEA, cabinets...') },
                            { name: t('Painting'), icon: "🎨", desc: t('One wall or more...') },
                            { name: t('Tutoring'), icon: "📚", desc: t('Language, school...') },
                            { name: t('Anything?'), icon: "✦", desc: t('If it\'s legal, post it.') },
                        ].map((cat, i) => (
                            <AnimatedSection key={i} delay={`${50 * i}ms`} className="msv-item group border-r border-b border-zinc-100 p-6 sm:p-8 bg-white hover:bg-orange-50/50 transition-all duration-300 cursor-pointer">
                                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-orange-100 transition-all">
                                    {cat.icon}
                                </div>
                                <div className="text-[14px] font-black text-oflem-charcoal uppercase tracking-wider mb-1">{cat.name}</div>
                                <div className="text-[12px] text-zinc-400 font-bold group-hover:text-oflem-terracotta transition-colors line-clamp-1">{cat.desc}</div>
                            </AnimatedSection>
                        ))}
                    </div>
                    
                    <div className="mt-12 text-center">
                        <Link href={route('missions.active')} className="inline-flex items-center gap-3 text-oflem-terracotta font-black text-[12px] uppercase tracking-widest hover:gap-5 transition-all group">
                            {t('Voir toutes les catégories')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. How it Works (Map Interaction) */}
            <section className="py-24 bg-white overflow-hidden" id="how-it-works">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <HowItWorksSteps t={t} />
                        <AnimatedSection delay="300ms">
                            <MapMock showSocialProof={SHOW_SOCIAL_PROOF} />
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Trust Pillars */}
             <section className="py-16 md:py-24 bg-white border-b border-zinc-100" id="why-oflem">
                <div className="container mx-auto px-6">
                    <div className="section-head mb-16 px-6">
                        <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('Pourquoi Oflem')}</span>
                        <h2 className="text-4xl font-black text-oflem-charcoal mb-4 tracking-tight uppercase leading-[1.1]">
                            {t('Poster une annonce, ça peut marcher.')}<br />{t('Sauf quand ça se passe mal.')}
                        </h2>
                        <p className="text-lg text-zinc-500 font-medium max-w-3xl leading-relaxed">
                            {t('Poster une annonce entre particuliers ou appeler l\'ami d\'un ami, ça peut marcher. Mais quand ça se passe mal, vous êtes seul. Oflem, c\'est la fiabilité en plus.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: t('Prestataires vérifiés'), text: t('Pièce d\'identité, droit de travailler en Suisse, qualifications vérifiées si nécessaire. Pas un inconnu sans historique.'), icon: <Shield className="w-8 h-8 text-white" />, bg: "bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light" },
                            { title: t('Argent protégé par séquestre'), text: t('Vous ne payez pas à l\'avance dans le vide. Les fonds sont bloqués et ne partent que lorsque vous avez confirmé.'), icon: <Lock className="w-8 h-8 text-white" />, bg: "bg-gradient-to-br from-oflem-green to-emerald-400" },
                            { title: t('Toujours quelqu\'un près de chez vous'), text: t('Chaque prestataire qui répond à votre demande vit dans votre région. Pas quelqu\'un à 200 km.'), icon: <MapPin className="w-8 h-8 text-white" />, bg: "bg-gradient-to-br from-blue-500 to-indigo-600" },
                            { title: t('Médiation en cas de litige'), text: t('Quand quelque chose se passe mal, vous n\'êtes pas seul. Notre équipe intervient, les fonds restent bloqués.'), icon: <Users className="w-8 h-8 text-white" />, bg: "bg-gradient-to-br from-orange-400 to-orange-500" },
                        ].map((pillar, i) => (
                            <AnimatedSection key={i} delay={`${150 * i}ms`} className="pillar-card p-8 bg-zinc-50 border border-zinc-100 rounded-3xl hover:shadow-xl transition-all duration-500">
                                <div className={`w-16 h-16 ${pillar.bg} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                                    {pillar.icon}
                                </div>
                                <h3 className="text-xl font-black text-oflem-charcoal mb-4 tracking-tight">{pillar.title}</h3>
                                <p className="text-[14px] text-zinc-500 leading-relaxed font-medium">{pillar.text}</p>
                            </AnimatedSection>
                        ))}
                    </div>

                    <CommissionTiers t={t} />
                </div>
            </section>



            {/* Audience Detailed Cards */}
            <section className="py-24 bg-white relative" id="audience">
                <div className="container mx-auto px-6">
                    <div className="section-head mb-16 text-center">
                        <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('Pour qui')}</span>
                        <h2 className="text-4xl font-black text-oflem-charcoal mb-4 tracking-tight uppercase leading-[1.1]">
                            {t('Oflem s\'adresse à tout le monde.')}<br />{t('Et on le dit sans sourire gêné.')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Side */}
                         <AnimatedSection className="p-8 md:p-12 bg-white border-2 border-orange-50 rounded-[40px] text-oflem-charcoal relative overflow-hidden group shadow-2xl shadow-orange-500/5 ring-1 ring-orange-100">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-oflem-terracotta/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
                             <span className="inline-block px-4 py-1.5 bg-orange-50 text-oflem-terracotta rounded-full text-[12px] font-black uppercase tracking-widest mb-8 border border-orange-100 shadow-sm">
                                 👤 {t('Vous avez un besoin')}
                             </span>
                             <h3 className="text-2xl sm:text-3xl font-black mb-6 tracking-tight text-oflem-charcoal">{t('Un coup de main. Sans complication.')}</h3>
                             <p className="text-zinc-500 font-medium leading-[1.7] mb-8 text-[16px]">
                                 {t('Il y a des jours où déléguer n\'est pas un luxe, mais simplement pratique. Qu\'il s\'agisse d\'un petit service ou d\'un vrai coup de main.')}
                             </p>
                             <ul className="space-y-4 mb-10 border-t border-orange-50 pt-10">
                                 {[
                                     t('Publication gratuite, sans engagement'),
                                     t('Prestataires vérifiés dans votre région'),
                                     t('Argent protégé jusqu\'à validation'),
                                     t('Assistance en cas de besoin')
                                 ].map((item, i) => (
                                     <li key={i} className="flex items-center gap-3 text-[14px] font-bold text-zinc-600">
                                         <CheckCircle2 size={16} className="text-oflem-terracotta" />
                                         {item}
                                     </li>
                                 ))}
                             </ul>
                             <Link href={route('missions.create')} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sho hover:scale-[1.02] transition-transform">
                                 {t('Publier ma demande, c\'est gratuit')}
                             </Link>
                         </AnimatedSection>

                        {/* Provider Side */}
                        <AnimatedSection delay="200ms" className="p-8 md:p-12 bg-oflem-charcoal rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-oflem-terracotta/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
                            <span className="inline-block px-4 py-1.5 bg-zinc-800/50 text-zinc-300 rounded-full text-[12px] font-black uppercase tracking-widest mb-8 border border-zinc-700 shadow-sm backdrop-blur-sm">
                                🛠️ {t('Vous avez des compétences')}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black mb-6 tracking-tight">{t('Votre talent mérite d\'être payé.')}</h3>
                            <p className="text-zinc-400 font-medium leading-[1.7] mb-8 text-[16px]">
                                {t('Vous avez un savoir-faire, une compétence, ou simplement du temps. Autour de vous, des personnes cherchent exactement ce que vous savez faire.')}
                            </p>
                            <ul className="space-y-4 mb-10 border-t border-zinc-800 pt-10">
                                {[
                                    t('Inscription gratuite'),
                                    t('Vous recevez 100% du montant de votre offre'),
                                    t('Paiement garanti avant de commencer'),
                                    t('Votre page personnelle Oflem à partager')
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[14px] font-bold text-zinc-300">
                                        <CheckCircle2 size={16} className="text-oflem-green" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href={route('register')} className="w-full inline-flex items-center justify-center gap-2 bg-white text-oflem-charcoal px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                {t('Créer mon profil prestataire')}
                            </Link>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            <RemoteMissions t={t} />

            {/* Emotional Quote Strip */}
            <section className="bg-oflem-charcoal py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,107,53,0.12),transparent_50%),radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <AnimatedSection>
                        <blockquote className="text-xl sm:text-2xl md:text-[36px] font-black text-white leading-[1.35] tracking-tight max-w-[760px] mx-auto">
                            {t('Oflem is the freedom to delegate what weighs you down to finally enjoy your free time.')}
                        </blockquote>
                        <cite className="block mt-8 sm:mt-10 text-zinc-500 font-bold not-italic">{t('— The Oflem Switzerland Team')}</cite>
                    </AnimatedSection>
                </div>
            </section>

            {/* Missions Section */}
            <section className="py-24 bg-white" id="petites-missions">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <AnimatedSection className="max-w-2xl">
                            <h2 className="text-4xl font-black text-oflem-charcoal tracking-tight mb-4 uppercase">{t('Explore missions')}</h2>
                            <p className="text-lg text-zinc-500 font-medium tracking-tight">{t('Hundreds of opportunities near you right now.')}</p>
                        </AnimatedSection>
                        <AnimatedSection>
                            <Link href={route('missions.active')} className="inline-flex items-center gap-2 text-oflem-terracotta font-black text-sm uppercase tracking-wider group">
                                {t('See all')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                        </AnimatedSection>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {missions.map((m, i) => (
                            <AnimatedSection key={i} delay={`${150 * i}ms`}>
                                <Link 
                                    href={route('missions.show', m.id)}
                                    className="block p-8 bg-white border-2 border-zinc-100 rounded-rl overflow-hidden relative group transition-all duration-300 hover:border-oflem-terracotta hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-oflem-terracotta to-orange-400" />
                                    <div className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full mb-4 ${
                                        m.tag === 'remote' ? 'bg-blue-50 text-blue-600' : 
                                        m.tag === 'premium' ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-600'
                                    }`}>
                                        {m.tag}
                                    </div>
                                    <h4 className="text-[17px] font-black mb-3 text-oflem-charcoal leading-tight group-hover:text-oflem-terracotta transition-colors">{m.title}</h4>
                                    <p className="text-[13.5px] text-zinc-500 mb-6 leading-relaxed line-clamp-2">{m.desc}</p>
                                    <hr className="border-zinc-50 mb-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-bold text-zinc-400">{m.loc}</span>
                                        <span className="text-2xl font-black text-oflem-green">CHF {m.price}</span>
                                    </div>
                                </Link>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>





            {/* Perspective Section (Tabs) */}
            <section className="py-24 bg-white" id="roles">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <AnimatedSection>
                            <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('Your Role')}</span>
                            <h2 className="text-4xl font-black text-oflem-charcoal mb-4 tracking-tight uppercase">{t('Two sides, one community')}</h2>
                        </AnimatedSection>
                    </div>

                    <div className="tabs-wrap max-w-4xl mx-auto border-2 border-zinc-100 rounded-rl shadow-xl overflow-hidden">
                         <div className="tabs-head flex bg-zinc-50 p-1.5 sm:p-2 gap-1.5 sm:gap-2 border-b-2 border-zinc-100">
                            <button 
                                onClick={() => setActiveTab('seek')}
                                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 rounded-rs font-black text-[12px] sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${activeTab === 'seek' ? 'bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white shadow-sho scale-[1.02]' : 'bg-transparent text-zinc-500 hover:bg-zinc-100'}`}
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 hidden xs:block" />
                                {t('I seek help')}
                            </button>
                            <button 
                                onClick={() => setActiveTab('offer')}
                                className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 rounded-rs font-black text-[12px] sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${activeTab === 'offer' ? 'bg-oflem-charcoal text-white shadow-sho scale-[1.02]' : 'bg-transparent text-zinc-500 hover:bg-zinc-100'}`}
                            >
                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 hidden xs:block" />
                                {t('I offer help')}
                            </button>
                        </div>

                        <div className="tabs-body p-6 sm:p-8 md:p-12">
                            {activeTab === 'seek' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-black text-oflem-charcoal mb-6 leading-tight">{t('Stop letting your daily chores weigh you down.')}</h3>
                                        <ul className="space-y-4 mb-8">
                                            {[
                                                t('Describe your need in 2 minutes'),
                                                t('Receive offers from verified neighbors'),
                                                t('Secure payment with escrow (no advance)'),
                                                t('Zero commitment: pay only if satisfied')
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-3 text-[14.5px] text-zinc-600 font-medium">
                                                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-oflem-terracotta shrink-0"><CheckCircle2 size={12} /></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={route('missions.create')} className="inline-flex items-center gap-2 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest shadow-sho hover:scale-105 transition-transform">
                                            {t('Post my first mission')} <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="bg-orange-50 rounded-rl p-8 border-2 border-dashed border-oflem-terracotta/20">
                                            <div className="bg-white p-5 rounded-xl shadow-lg border border-zinc-100 mb-4 animate-phone-float-slow">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-12 h-12 rounded-full bg-oflem-green/10 text-oflem-green flex items-center justify-center font-black">LC</div>
                                                    <div>
                                                        <div className="text-[13px] font-black text-oflem-charcoal">Léa C.</div>
                                                        {SHOW_SOCIAL_PROOF && (
                                                            <div className="text-[11px] text-zinc-400 font-bold">{t('5 stars · Lausanne')}</div>
                                                        )}
                                                        <div className="mt-2 text-oflem-terracotta font-black text-lg">CHF 20.–</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -top-4 -right-4 bg-oflem-green text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg uppercase">{t('Available now')}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="order-2 md:order-1 relative">
                                        <div className="bg-zinc-900 rounded-rl p-8 border-2 border-zinc-800">
                                            <div className="space-y-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 flex justify-between items-center opacity-60">
                                                        <div className="w-24 h-2 bg-zinc-700 rounded-full" />
                                                        <div className="w-12 h-4 bg-zinc-700 rounded-full" />
                                                    </div>
                                                ))}
                                                <div className="bg-white p-5 rounded-xl shadow-lg border-2 border-oflem-terracotta animate-phone-float">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="w-10 h-10 rounded-full bg-oflem-charcoal text-white flex items-center justify-center font-black text-xs">MA</div>
                                                        <div>
                                                            <div className="text-[13px] font-black text-oflem-charcoal">{t('Ménage 3.5p')}</div>
                                                            <div className="text-[11px] text-oflem-green font-bold">{t('High Reward')}</div>
                                                        </div>
                                                        <div className="ml-auto text-xl font-black text-oflem-terracotta">CHF 85</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="order-1 md:order-2">
                                        <h3 className="text-2xl font-black text-oflem-charcoal mb-6 leading-tight">{t('Monetize your time and manual skills.')}</h3>
                                        <ul className="space-y-4 mb-8">
                                            {[
                                                t('Access verified missions near you'),
                                                t('Set your own prices and hours'),
                                                t('Weekly payments directly to your wallet'),
                                                t('Insurance and mediation included')
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-3 text-[14.5px] text-zinc-600 font-medium">
                                                    <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-oflem-charcoal shrink-0"><CheckCircle2 size={12} /></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={route('register')} className="inline-flex items-center gap-2 bg-oflem-charcoal text-white px-8 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest shadow-sho hover:scale-105 transition-transform">
                                            {t('Create my provider account')} <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-zinc-50" id="faq">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <AnimatedSection>
                            <span className="text-[12px] font-black uppercase text-oflem-terracotta tracking-[3px] mb-4 block">{t('Assistance')}</span>
                            <h2 className="text-4xl font-black text-oflem-charcoal mb-4 tracking-tight uppercase">{t('Questions fréquentes')}</h2>
                            <p className="text-zinc-500 font-bold">{t('Tout ce que vous devez savoir avant de commencer.')}</p>
                        </AnimatedSection>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-16">
                        <div>
                            <p className="text-[11px] font-black text-oflem-terracotta uppercase tracking-[2.5px] mb-6 pb-2 border-b-2 border-zinc-200">{t('Pour les clients')}</p>
                            <FAQItem 
                                question={t('Comment fonctionne le séquestre ?')} 
                                answer={t('Imaginez que vous confiez votre argent à un arbitre de confiance. Il le garde en sécurité jusqu\'à ce que le travail soit fait et que vous soyez content. Si tout se passe bien, il le remet au prestataire.')}
                            />
                            <FAQItem 
                                question={t('Combien ça coûte pour un client ?')} 
                                answer={t('Publier une demande est gratuit. Quand vous acceptez une offre, vous payez le montant proposé par le prestataire, plus la commission Oflem, clairement affichée avant validation. La commission est dégressive : 25% jusqu\'à CHF 149 · 20% entre CHF 150 et 499 · 12% dès CHF 500.')}
                            />
                            <FAQItem 
                                question={t('Je peux publier n\'importe quelle mission ?')} 
                                answer={t('Absolument. Promenade de chien, colis à récupérer, meuble à monter, déclaration d\'impôts. Tout ce qui est légal et vous simplifie la vie peut être publié.')}
                            />
                            <FAQItem 
                                question={t('Comment sont vérifiés les prestataires ?')} 
                                answer={t('Pour les prestataires terrain, nous vérifions la pièce d\'identité, le droit de travailler en Suisse, et les qualifications si nécessaire. Pour les prestataires à distance, un email vérifié et un profil complet suffisent.')}
                            />
                            <FAQItem 
                                question={t('Que faire si je ne suis pas satisfait ?')} 
                                answer={t('Vous n\'avez pas à valider la mission si le travail n\'est pas conforme. Les fonds restent bloqués tant que le litige n\'est pas résolu. Notre équipe de médiation intervient sous 24h ouvrés.')}
                            />
                        </div>

                        <div>
                            <p className="text-[11px] font-black text-oflem-charcoal uppercase tracking-[2.5px] mb-6 pb-2 border-b-2 border-zinc-200">{t('Pour les prestataires')}</p>
                            <FAQItem 
                                question={t('Comment fonctionne le paiement ?')} 
                                answer={t('Le client bloque le montant en séquestre avant que vous commenciez. Une fois la mission validée, vous recevez 100% de votre offre sous 2 à 3 jours ouvrés. La commission Oflem est ajoutée au prix côté client.')}
                            />
                            <FAQItem 
                                question={t('Combien ça coûte pour un prestataire ?')} 
                                answer={t('L\'inscription est gratuite. Aucun abonnement, aucun frais fixe. Vous proposez un prix, vous recevez 100% de ce montant. La commission est ajoutée côté client.')}
                            />
                            <FAQItem 
                                question={t('Faut-il être artisan ou indépendant ?')} 
                                answer={t('Non. Oflem est ouvert aux artisans, indépendants, étudiants et particuliers motivés. Pour les travaux techniques, nous vérifions vos qualifications.')}
                            />
                            <FAQItem 
                                question={t('Je choisis mes missions librement ?')} 
                                answer={t('Oui. Vous consultez les demandes autour de vous et répondez uniquement à celles qui vous intéressent. Pas d\'obligation de volume, vous travaillez quand vous voulez.')}
                            />
                            <FAQItem 
                                question={t('Que se passe-t-il en cas de litige avec un client ?')} 
                                answer={t('Notre équipe de médiation intervient sous 24h ouvrés. Les fonds restent bloqués en séquestre pendant la résolution. Si vous avez réalisé le travail conformément, vous êtes protégé.')}
                            />
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[2.5px] mb-6 pb-2 border-b-2 border-zinc-200">{t('Général')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <FAQItem 
                                question={t('Dans quelles régions êtes-vous disponibles ?')} 
                                answer={t('Suisse romande : Genève, Vaud, Fribourg, Neuchâtel, Valais et Jura. Extension vers la Suisse alémanique prévue prochainement.')}
                            />
                            <FAQItem 
                                question={t('Quelle est la relation juridique entre les parties ?')} 
                                answer={t('Oflem est un intermédiaire de mise en relation (courtier au sens de l\'art. 412 CO). Aucun lien de subordination n\'existe entre le client et le prestataire.')}
                            />
                            <FAQItem 
                                question={t('À quoi sert concrètement la commission ?')} 
                                answer={t('Elle finance : 1. La vérification des prestataires, 2. La protection du paiement par séquestre, 3. L\'accompagnement en cas de problème.')}
                            />
                            <FAQItem 
                                question={t('25% c\'est beaucoup pour une petite mission ?')} 
                                answer={t('Sur CHF 40, ça représente CHF 10. En échange, vous avez un prestataire vérifié, un paiement protégé, et une équipe disponible si ça se passe mal.')}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
             <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <AnimatedSection className="bg-gradient-to-br from-oflem-charcoal to-oflem-navy-light rounded-[48px] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden group shadow-3xl">
                        {/* Orbs background like in HTML */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute w-[500px] h-[500px] -top-[150px] -right-[100px] rounded-full bg-radial-gradient(circle,rgba(255,107,53,0.15)_0%,transparent_70%) animate-pulse-slow" />
                            <div className="absolute w-[350px] h-[350px] -bottom-[100px] -left-[80px] rounded-full bg-radial-gradient(circle,rgba(255,107,53,0.1)_0%,transparent_70%) animate-pulse-slow" />
                        </div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-3 bg-oflem-terracotta/20 border border-oflem-terracotta/40 rounded-full px-5 py-2 text-[12px] font-black text-oflem-terracotta uppercase tracking-[2px] mb-10 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-oflem-terracotta animate-pulse" />
                                {t('Prêt à commencer ?')}
                            </div>
                            
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                                {t('Votre temps compte.')}<br />
                                <span className="text-oflem-terracotta italic font-serif">{t('Votre énergie aussi.')}</span>
                            </h2>
                            
                            <p className="text-xl md:text-2xl font-bold text-white/80 mb-8 tracking-tight">
                                {t("Laissez Oflem s'occuper du reste.")}
                            </p>
                            
                            <p className="text-lg text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                                {t('Et si vous avez une compétence, un talent, ou simplement l\'envie d\'aider : quelqu\'un, près de chez vous, en a besoin.')}
                            </p>
 
                            <div className="flex flex-col sm:flex-row gap-5 justify-center">
                                <Link 
                                    href={route('missions.create')} 
                                    className="px-10 py-5 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white rounded-2xl font-black text-[15px] uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-oflem-terracotta/20"
                                >
                                    {t('Publier ma demande, c\'est gratuit')}
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="px-10 py-5 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-2xl font-black text-[15px] uppercase tracking-widest hover:bg-white/20 hover:scale-[1.05] transition-all"
                                >
                                    {t('Devenir prestataire')}
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <Footer />
            <CookieBar />

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.15; transform: scale(1.05); }
                }
                .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
                
                @keyframes phone-float-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
                .animate-phone-float-slow { animation: phone-float-slow 8s ease-in-out infinite; }

                .msv-item:nth-child(6n) { border-right: none; }
                @media (max-width: 1024px) {
                    .msv-item:nth-child(6n) { border-right: 1px solid rgba(63, 63, 70, 0.5); }
                    .msv-item:nth-child(3n) { border-right: none; }
                }
                @media (max-width: 640px) {
                    .msv-item:nth-child(3n) { border-right: 1px solid rgba(63, 63, 70, 0.5); }
                    .msv-item:nth-child(2n) { border-right: none; }
                }

                .tabs-wrap { animation: sectionIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                @keyframes sectionIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
