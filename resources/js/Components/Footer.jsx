import React from 'react';
import { Link, router } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

export default function Footer() {
    const { t } = useTranslation();

    const scrollToHero = (e) => {
        if (e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const oflemNav = (path) => {
        if (path === 'welcome') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        router.get(`/${path}`);
    };

    return (
        <footer className="oflem-footer">
            <div className="oflem-container">
                <div className="oflem-footer-grid">
                    <div className="oflem-footer-col">
                        <a 
                            className="oflem-logo" 
                            style={{ marginBottom: '14px', display: 'inline-block', fontSize: '26px' }} 
                            onClick={() => oflemNav('welcome')}
                        >
                            Oflem<span className="oflem-logo-dot">.</span>
                        </a>
                        <p style={{ fontSize: '14px', color: 'var(--g500)', lineHeight: '1.7', maxWidth: '260px', marginBottom: '14px' }}>
                            {t('homepage.footer.description')}
                        </p>
                        <div className="oflem-footer-trust">
                            <span className="oflem-footer-trust-badge">{t('homepage.footer.trust.escrow')}</span>
                            <span className="oflem-footer-trust-badge">{t('homepage.footer.trust.swiss_data')}</span>
                            <span className="oflem-footer-trust-badge">{t('homepage.footer.trust.lausanne')}</span>
                            <span className="oflem-footer-trust-badge">{t('homepage.footer.trust.nlpd')}</span>
                        </div>
                    </div>
                    
                    <div className="oflem-footer-col">
                        <h4>{t('homepage.footer.col.platform')}</h4>
                        <a onClick={scrollToHero}>{t('homepage.footer.links.publish')}</a>
                        <a onClick={() => oflemNav('register')}>{t('homepage.footer.links.provider')}</a>
                        <a href="#how-it-works">{t('homepage.footer.links.how')}</a>
                        <a href="#categories">{t('homepage.footer.links.examples')}</a>
                        <a href="#faq">{t('homepage.footer.links.faq')}</a>
                    </div>
                    
                    <div className="oflem-footer-col">
                        <h4>{t('homepage.footer.col.company')}</h4>
                        <a onClick={() => oflemNav('legal/about')}>{t('homepage.footer.links.about')}</a>
                        <a href="mailto:hello@oflem.ch">{t('homepage.footer.links.contact')}</a>
                    </div>
                    
                    <div className="oflem-footer-col">
                        <h4>{t('homepage.footer.col.legal')}</h4>
                        <a onClick={() => oflemNav('legal/mentions')}>{t('homepage.footer.links.mentions')}</a>
                        <a onClick={() => oflemNav('legal/cgu')}>{t('homepage.footer.links.cgu')}</a>
                        <a onClick={() => oflemNav('legal/privacy')}>{t('homepage.footer.links.privacy')}</a>
                        <a onClick={() => oflemNav('legal/cookies')}>{t('homepage.footer.links.cookies')}</a>
                    </div>
                </div>
                
                <div className="oflem-footer-bottom">
                    <span>{t('homepage.footer.bottom.copy')}</span>
                    <div className="oflem-footer-swiss">
                        <span className="oflem-footer-badge">{t('homepage.footer.bottom.made_in')}</span>
                        <span className="oflem-footer-badge">{t('homepage.footer.trust.swiss_data')}</span>
                        <span className="oflem-footer-badge">{t('homepage.footer.trust.nlpd')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
