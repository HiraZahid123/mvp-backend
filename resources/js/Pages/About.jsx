import React from 'react';
import { Head, Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

export default function About() {
    const { t } = useTranslation();
    return (
        <div className="oflem-home-page">
            <Head title="À propos de nous" />
            <section className="oflem-section oflem-section-white" style={{ paddingTop: '100px' }}>
                <div className="oflem-container">
                    <h1 className="oflem-section-title">À propos de nous</h1>
                    <p className="oflem-section-sub" style={{ marginTop: '12px' }}>
                        Oflem est une plateforme suisse dédiée à la mise en relation locale, sécurisée et transparente.
                        Notre mission est de simplifier la vie quotidienne en connectant les besoins avec des personnes de confiance.
                    </p>
                    <p style={{ marginTop: '16px', color: 'var(--g700)', lineHeight: 1.7 }}>
                        Données hébergées en Suisse (Infomaniak), prestataires vérifiés, paiement protégé par séquestre.
                        Nous nous engageons sur l'éthique, la sécurité et la qualité de service.
                    </p>
                    <div style={{ marginTop: '30px' }}>
                        <Link href={route('welcome')} className="oflem-btn oflem-btn-outline" style={{ color: 'var(--o)', borderColor: 'var(--o)', fontWeight: 900 }}>{t("Retour à l'accueil")}</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
