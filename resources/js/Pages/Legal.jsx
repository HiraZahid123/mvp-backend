import React from 'react';
import { Head, Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

const activeLinkClasses = (active) =>
    `legal-nav-link ${active ? 'active' : ''}`;

export default function Legal({ section }) {
    const { t } = useTranslation();
    const active = section || 'cgu';

    // Map section IDs to translation keys
    const legalData = t('homepage.legal');
    const currentSection = legalData[active];

    return (
        <div className="oflem-home-page">
            <Head title={`${currentSection?.title || legalData.label} · Oflem`} />

            {/* Header Mirror for Back Button */}
            <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--g200)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" className="logo" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--n)', textDecoration: 'none' }}>
                        Oflem<span className="logo-dot" style={{ color: 'var(--o)' }}>.</span>
                    </Link>
                    <Link href="/" className="nav-btn-login" style={{ color: 'var(--g600)', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
                        {legalData.back}
                    </Link>
                </div>
            </header>

            <section className="oflem-section oflem-section-white" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
                <div className="oflem-container">
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div className="oflem-section-label">{active === 'about' ? currentSection.label : legalData.label}</div>
                        <h2 className="oflem-section-title" style={{ fontSize: '36px' }}>{currentSection?.title}</h2>
                        {currentSection?.subtitle && <p style={{ color: 'var(--g500)', fontSize: '13px' }}>{currentSection.subtitle}</p>}
                    </div>

                    <div className="legal-nav">
                        <Link href={route('legal', { section: 'cgu' })} className={activeLinkClasses(active === 'cgu')}>{legalData.nav.cgu}</Link>
                        <Link href={route('legal', { section: 'mentions' })} className={activeLinkClasses(active === 'mentions')}>{legalData.nav.mentions}</Link>
                        <Link href={route('legal', { section: 'privacy' })} className={activeLinkClasses(active === 'privacy')}>{legalData.nav.privacy}</Link>
                        <Link href={route('legal', { section: 'cookies' })} className={activeLinkClasses(active === 'cookies')}>{legalData.nav.cookies}</Link>
                        <Link href={route('legal', { section: 'about' })} className={activeLinkClasses(active === 'about')}>{legalData.nav.about}</Link>
                    </div>

                    <div className="legal-content" style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                        <div dangerouslySetInnerHTML={{ __html: currentSection?.content }} className="prose-content" />
                    </div>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{ __html: `
                .prose-content h2 { font-size: 20px; font-weight: 800; color: var(--n); margin-top: 32px; margin-bottom: 16px; letter-spacing: -0.01em; }
                .prose-content h3 { font-size: 17px; font-weight: 700; color: var(--n); margin-top: 24px; margin-bottom: 12px; }
                .prose-content p { font-size: 15px; line-height: 1.6; color: var(--g700); margin-bottom: 16px; }
                .prose-content ul { margin-bottom: 16px; padding-left: 20px; }
                .prose-content li { font-size: 15px; line-height: 1.6; color: var(--g700); margin-bottom: 8px; list-style-type: disc; }
                .prose-content strong { color: var(--n); font-weight: 700; }
                
                .legal-nav { display: flex; gap: 8px; justify-content: center; margin-bottom: 32px; overflow-x: auto; padding: 4px; }
                .legal-nav-link { padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: var(--g600); text-decoration: none; transition: all 0.2s; white-space: nowrap; border: 1px solid transparent; }
                .legal-nav-link:hover { background: var(--g100); color: var(--n); }
                .legal-nav-link.active { background: var(--n); color: #fff; border-color: var(--n); }
            ` }} />
        </div>
    );
}
