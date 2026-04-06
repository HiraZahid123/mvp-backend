import React from 'react';
import { Head, Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import '../../../css/oflem-home.css';

export default function RegistrationSuccess() {
    const { t } = useTranslation();

    return (
        <div className="oflem-home-page">
            <Head title={t('onboarding.success_title')} />

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes sPop {
                    0% { transform: scale(0) }
                    100% { transform: scale(1) }
                }
            `}} />

            <header className="oflem-header">
                <div className="oflem-container">
                    <nav className="oflem-nav">
                        <Link href={route('welcome')} className="oflem-logo">Oflem<span className="oflem-logo-dot">.</span></Link>
                    </nav>
                </div>
            </header>

            <section className="oflem-section" style={{ paddingTop: '80px' }}>
                <div className="oflem-container" style={{ maxWidth: '560px', textAlign: 'center' }}>
                    
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--g),#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 16px 40px rgba(16,185,129,.30)', animation: 'sPop .5s cubic-bezier(.175,.885,.32,1.275)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>

                    <h2 className="oflem-section-title" style={{ fontSize: '38px' }}>{t('onboarding.success_heading')}</h2>
                    <p style={{ fontSize: '18px', color: 'var(--g700)', lineHeight: 1.7, marginBottom: '16px' }}>
                        {t('onboarding.success_desc')}
                    </p>

                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '32px' }}>
                        <Link href={route('dashboard')} className="oflem-btn oflem-btn-primary" style={{ padding: '16px 32px' }}>
                            {t('onboarding.go_to_dashboard')}
                        </Link>
                    </div>

                </div>
            </section>
        </div>
    );
}
