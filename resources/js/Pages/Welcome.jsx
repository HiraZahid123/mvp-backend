import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import axios from 'axios';
import { 
    Home, 
    Wrench, 
    Truck, 
    Sparkles, 
    Rocket,
    CheckCircle2,
    ShieldCheck,
    Coins,
    Gem,
    ArrowRight
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

const AnimatedSection = ({ children, className = "" }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    return (
        <div 
            ref={ref} 
            className={`${className} transition-all duration-1000 transform ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
            {children}
        </div>
    );
};

export default function Welcome() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isClean, setIsClean] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);

    const steps = [
        { title: t('How it works steps.step1_title'), desc: t('How it works steps.step1_desc'), icon: "1" },
        { title: t('How it works steps.step2_title'), desc: t('How it works steps.step2_desc'), icon: "2" },
        { title: t('How it works steps.step3_title'), desc: t('How it works steps.step3_desc'), icon: "3" },
    ];

    const stats = [
        { label: t('Community Stats.happy_lazy'), value: "12k+" },
        { label: t('Community Stats.active_motive'), value: "4.5k" },
        { label: t('Community Stats.missions_done'), value: "25k" },
    ];

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm || isChecking) return;

        setIsChecking(true);
        setHasChecked(false);
        try {
            const response = await axios.post(route('api.moderation.check'), { content: searchTerm });
            const clean = response.data.is_clean;
            setIsClean(clean);
            setHasChecked(true);

            if (clean) {
                router.get(route('missions.create'), { 
                    search: searchTerm,
                    improved_title: response.data.improved_title 
                });
            }
        } catch (error) {
            console.error("Moderation check failed", error);
        } finally {
            setIsChecking(false);
        }
    };



    const guarantees = [
        { title: t('Secure Payment'), desc: t('Mission paid after completion, funds held in escrow.'), icon: <ShieldCheck className="w-8 h-8 text-oflem-terracotta" /> },
        { title: t('Total Trust'), desc: t('Verified profiles and community ratings.'), icon: <CheckCircle2 className="w-8 h-8 text-oflem-terracotta" /> },
        { title: t('100% Rewards'), desc: t('Motives receive the full price agreed upon.'), icon: <Coins className="w-8 h-8 text-oflem-terracotta" /> },
        { title: t('Swiss Quality'), desc: t('A platform built by help-seekers for help-seekers.'), icon: <Gem className="w-8 h-8 text-oflem-terracotta" /> },
    ];

    const testimonials = [
        { name: 'Sarah, 34 ans', content: "Oflem a sauvé mon week-end. Je n'avais pas envie de bouger, et quelqu'un est venu réparer mon évier en 2 heures.", location: 'Lausanne', role: 'Customer' },
        { name: 'Thomas', content: "Je gagne 500 CHF de plus par mois simplement en aidant mes voisins. C'est flexible et gratifiant.", location: 'Genève', role: 'Provider' },
    ];

    return (
        <div className="min-h-screen bg-oflem-cream font-sans text-oflem-charcoal selection:bg-oflem-terracotta/20 relative overflow-hidden">
            <Head title={t('Welcome')} />
            
            {/* Visual Depth Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-oflem-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-oflem-terracotta/3 rounded-full blur-[100px] pointer-events-none" />

            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <AnimatedSection className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-oflem-terracotta/10 rounded-full mb-8">
                            <span className="text-oflem-terracotta text-lg animate-pulse">🇨🇭</span>
                            <span className="text-xs font-black uppercase tracking-widest text-oflem-terracotta">{t('Platform Swiss Quality')}</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8">
                            La <span className="text-oflem-terracotta">flemme</span>,<br />
                            mais avec <span className="italic font-serif">respect</span>.
                        </h1>
                        
                        <p className="text-xl md:text-2xl font-bold text-gray-muted mb-12 max-w-xl leading-relaxed tracking-tight">
                            {t('Everything you want. Really.')}
                        </p>

                        <div className="max-w-xl mb-12">
                            <form onSubmit={handleSearchSubmit} className="relative group">
                                <div className="flex items-center w-full px-6 py-4 md:px-8 md:py-6 rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-border focus-within:border-oflem-terracotta/30 focus-within:ring-4 focus-within:ring-oflem-terracotta/5 transition-all">
                                    <span className="text-lg font-black text-gray-muted hidden sm:inline whitespace-nowrap">J'ai la flemme de...</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={searchTerm ? '' : t('promener mon chien')}
                                        className="flex-1 bg-transparent border-none text-lg font-black text-oflem-charcoal focus:ring-0 placeholder:text-gray-200 ml-2"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!searchTerm.trim() || isChecking}
                                        className="hidden sm:flex items-center justify-center w-12 h-12 bg-oflem-terracotta text-white rounded-2xl hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                                <button 
                                    type="submit"
                                    className="sm:hidden w-full mt-4 py-4 bg-oflem-terracotta text-white rounded-2xl font-black text-lg"
                                >
                                    {isChecking ? t('Checking...') : t('Start the search')}
                                </button>
                            </form>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link 
                                href={route('missions.create')} 
                                className="px-8 py-5 bg-oflem-charcoal text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-oflem-charcoal/90 transition-all flex items-center gap-3 group"
                            >
                                <span className="text-xl">🛋️</span> {t('I am a Flemmard')}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link 
                                href={route('missions.active')} 
                                className="px-8 py-5 bg-white border-2 border-oflem-charcoal text-oflem-charcoal rounded-full font-black text-sm uppercase tracking-widest hover:bg-oflem-cream transition-all flex items-center gap-3"
                            >
                                <span className="text-xl">💪</span> {t('I am Motivated')}
                            </Link>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection className="flex-1 w-full lg:w-auto relative">
                        <div className="relative aspect-square md:aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl group">
                            <div className="absolute inset-0 bg-oflem-terracotta/10 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                            <img 
                                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=2070" 
                                alt="Swiss Community Support" 
                                className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-1000 group-hover:scale-105"
                            />
                            
                            {/* Floating Labels */}
                            <div className="absolute top-12 -left-8 bg-white p-6 rounded-[32px] shadow-xl border border-gray-border animate-float">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-oflem-terracotta/20 rounded-full flex items-center justify-center text-xl">🏠</div>
                                    <div>
                                        <p className="text-xs font-black text-gray-muted uppercase tracking-widest">{t('Last mission')}</p>
                                        <p className="font-black text-oflem-charcoal">Fixing my sink</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-12 -right-8 bg-oflem-charcoal p-6 rounded-[32px] shadow-2xl animate-float-delayed">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">✅</div>
                                    <div>
                                        <p className="text-xs font-black text-white/50 uppercase tracking-widest">{t('Trust index')}</p>
                                        <p className="font-black text-white">100% Secure</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 md:py-32 px-6 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <AnimatedSection className="text-center mb-20 md:mb-32">
                        <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight uppercase">{t('How it works title')}</h2>
                        <p className="text-lg font-bold text-gray-muted max-w-2xl mx-auto leading-relaxed tracking-tight">
                            {t('How it works description')}
                        </p>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 items-start">
                        {steps.map((step, i) => (
                            <AnimatedSection key={i} className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 rounded-2xl bg-oflem-cream flex items-center justify-center font-black text-2xl text-oflem-terracotta mb-8 group-hover:bg-oflem-terracotta group-hover:text-white transition-all duration-500 shadow-sm border border-oflem-terracotta/10">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-black mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-sm font-bold text-gray-muted leading-relaxed max-w-[280px]">
                                    {step.desc}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>

                    <div className="mt-32 pt-20 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {stats.map((stat, i) => (
                            <AnimatedSection key={i}>
                                <div className="text-4xl md:text-5xl font-black text-oflem-charcoal mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-oflem-terracotta">{stat.label}</div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reassurance Section - "Anything you need. Really." */}
            <section className="bg-gradient-to-br from-oflem-cream via-white to-oflem-cream/50 py-24 md:py-32 px-6 border-y border-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-oflem-terracotta/5 rounded-full blur-[120px]" />
                
                <div className="max-w-5xl mx-auto relative z-10">
                    <AnimatedSection className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-tight">
                            <span className="text-oflem-charcoal">Tout ce que tu veux.</span><br />
                            <span className="text-oflem-terracotta italic font-serif">Vraiment.</span>
                        </h2>
                        <p className="text-xl md:text-2xl font-bold text-gray-muted max-w-3xl mx-auto leading-relaxed tracking-tight">
                            {t('Oflem is not a list of categories. Describe your task and we will find the right Motivé.')}
                        </p>
                    </AnimatedSection>

                    <AnimatedSection className="bg-white/80 backdrop-blur-sm p-12 md:p-16 rounded-[48px] shadow-[0_30px_80px_rgba(0,0,0,0.06)] border border-white mb-16">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-oflem-terracotta/10 rounded-full mb-6">
                                    <span className="text-2xl">🛋️</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-oflem-terracotta">Pour les Flemmards</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-oflem-charcoal">
                                    Occupé, fatigué, ou simplement pas envie ?
                                </h3>
                                <p className="text-base font-bold text-gray-muted leading-relaxed">
                                    Décris ta mission en quelques mots. Un Motivé volontaire s'en occupe. Simple, rapide, sécurisé.
                                </p>
                            </div>
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-oflem-cream rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-xl border-4 border-white">
                                🤝
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-oflem-terracotta/10 rounded-full mb-6">
                                    <span className="text-2xl">💪</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-oflem-terracotta">Pour les Motivés</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-oflem-charcoal">
                                    Prêt à aider et gagner de l'argent ?
                                </h3>
                                <p className="text-base font-bold text-gray-muted leading-relaxed">
                                    Choisis les missions qui te conviennent. Fixe ton prix. Sois payé directement. Flexible et gratifiant.
                                </p>
                            </div>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection className="text-center">
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-oflem-charcoal/5 rounded-full border border-oflem-charcoal/10">
                            <span className="text-lg font-black text-oflem-charcoal">
                                Tout le monde est traité avec respect.
                            </span>
                            <span className="text-2xl">🤝</span>
                            <span className="text-lg font-black text-oflem-terracotta">
                                Flemmard ou Motivé, c'est du gagnant-gagnant.
                            </span>
                        </div>
                        
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {[
                                { emoji: '🐕', text: 'Promener mon chien' },
                                { emoji: '🛠️', text: 'Réparer mon évier' },
                                { emoji: '📦', text: 'Déménagement' },
                                { emoji: '🌱', text: 'Jardinage' },
                            ].map((example, i) => (
                                <Link
                                    key={i}
                                    href={route('missions.create', { search: example.text })}
                                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/60 hover:bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{example.emoji}</span>
                                    <span className="text-xs font-black text-gray-muted group-hover:text-oflem-terracotta transition-colors">
                                        {example.text}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <p className="mt-8 text-sm font-bold text-gray-muted italic">
                            Si ta mission n'est pas dans la liste, aucun souci : écris-la quand même.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Guarantees Section */}
            <section id="guarantees" className="bg-oflem-charcoal py-24 md:py-32 px-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-oflem-terracotta/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <AnimatedSection>
                        <h2 className="text-3xl md:text-5xl font-black mb-24 text-center tracking-tight uppercase">{t('What Oflem ensures')}</h2>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
                        {guarantees.map((item, i) => (
                            <AnimatedSection key={i} className="flex flex-col items-center text-center group">
                                <div className="mb-10 w-20 h-20 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 transition-all duration-500 group-hover:bg-oflem-terracotta group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_0_40px_rgba(224,122,95,0.4)]">
                                    {React.cloneElement(item.icon, { className: "w-8 h-8 text-oflem-terracotta group-hover:text-white transition-colors duration-300" })}
                                </div>
                                <h3 className="text-lg font-black mb-4 group-hover:text-oflem-terracotta transition-colors duration-300 tracking-tight">{item.title}</h3>
                                <p className="text-sm font-bold text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed max-w-[220px]">
                                    {item.desc}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 md:py-32 px-6 bg-oflem-cream/30 relative overflow-hidden">
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-oflem-terracotta/5 rounded-full blur-[100px]" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <AnimatedSection className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight leading-tight uppercase">{t('What our customers say').split('customers')[0]}<span className="text-oflem-terracotta">{t('Customer')}s</span>{t('What our customers say').split('customers')[1]}</h2>
                            <p className="text-lg md:text-xl font-bold text-gray-muted leading-relaxed tracking-tight">
                                Rejoignez des milliers de Suisses qui utilisent déjà Oflem pour simplifier leur quotidien.
                            </p>
                        </div>
                        <Link href="#" className="flex items-center gap-3 text-sm font-black text-oflem-terracotta hover:opacity-80 transition-opacity uppercase tracking-widest bg-white px-8 py-5 rounded-full shadow-sm border border-gray-100 group">
                            {t('See all reviews')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                        </Link>
                    </AnimatedSection>
                    
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        {testimonials.map((testimonial, i) => (
                            <AnimatedSection key={i} className={`flex-1 p-10 md:p-14 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.04)] border relative transition-all duration-500 hover:-translate-y-2 ${
                                i === 1 ? 'bg-oflem-terracotta text-white border-oflem-terracotta shadow-[0_30px_100px_rgba(224,122,95,0.2)]' : 'bg-white border-white'
                            }`}>
                                <div className="flex gap-1 mb-10">
                                    {[1,2,3,4,5].map(star => <Sparkles key={star} className={`w-5 h-5 fill-current ${i === 1 ? 'text-white' : 'text-oflem-terracotta'}`} />)}
                                </div>
                                <p className={`text-xl md:text-2xl font-bold leading-relaxed mb-12 italic tracking-tight ${i === 1 ? 'text-white' : 'text-oflem-charcoal'}`}>
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-inner flex items-center justify-center font-black text-2xl ${
                                        i === 1 ? 'bg-white/20 border-white text-white' : 'bg-oflem-cream border-white text-oflem-charcoal'
                                    }`}>
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-base tracking-tight">{testimonial.name}</h4>
                                        <p className={`text-xs font-black uppercase tracking-widest ${i === 1 ? 'text-white/70' : 'text-gray-muted'}`}>
                                            {testimonial.role ? `${testimonial.role} • ` : ''}{t(testimonial.location)}
                                        </p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

