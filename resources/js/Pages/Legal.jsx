import React from 'react';
import { Head, Link } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

const sections = {
    cgu: {
        title: "Conditions Générales d'Utilisation",
        subtitle: "Dernière mise à jour : 1er février 2026",
    },
    mentions: {
        title: "Mentions légales",
    },
    privacy: {
        title: "Protection des données",
        subtitle: "Conforme à la nLPD (RS 235.1) entrée en vigueur le 1er septembre 2023",
    },
    cookies: {
        title: "Politique de cookies",
    },
    about: {
        title: "À propos",
    },
};

const activeLinkClasses = (active) =>
    `legal-nav-link ${active ? 'active' : ''}`;

const contentBySection = {
    cgu: (
        <>
            <h2>1. Objet et champ d'application</h2>
            <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme Oflem (ci-après « la Plateforme »), accessible à l'adresse oflem.ch, exploitée par Oflem SA (en cours de constitution), société de droit suisse.</p>
            <p>Oflem est une plateforme de mise en relation entre des personnes recherchant des services (ci-après « Clients ») et des prestataires indépendants ou entreprises proposant leurs services (ci-après « Prestataires »). <strong>Oflem agit exclusivement en qualité de courtier au sens des articles 412 et suivants du Code des obligations suisse (CO)</strong>.</p>

            <h2>2. Rôle d'Oflem et absence de lien de subordination</h2>
            <p>Oflem est un intermédiaire technique de mise en relation. <strong>Oflem n'est pas partie au contrat de service conclu entre le Client et le Prestataire.</strong></p>
            <p>Les Prestataires inscrits sur la Plateforme exercent leur activité en tant que travailleurs indépendants au sens de l'art. 12 LAVS ou en tant qu'entreprises inscrites au registre du commerce. Aucun lien de subordination (art. 319 CO) n'existe entre Oflem et les Prestataires. Notamment :</p>
            <ul>
                <li>Oflem ne fixe pas les prix des prestations — le Prestataire détermine librement ses tarifs ;</li>
                <li>Oflem ne donne aucune instruction sur la méthode, le lieu ou l'horaire d'exécution du travail ;</li>
                <li>Oflem ne fournit pas d'outils ni de matériaux pour l'exécution des prestations ;</li>
                <li>Le Prestataire est libre d'accepter ou de refuser toute mission proposée sur la Plateforme ;</li>
                <li>Le Prestataire peut exercer son activité pour d'autres plateformes ou clients simultanément.</li>
            </ul>
            <p>Le Prestataire est seul responsable de ses obligations fiscales (TVA, impôt sur le revenu), sociales (AVS/AI/APG, assurance-accidents) et administratives (autorisation de travail, inscription au registre du commerce si nécessaire).</p>

            <h2>3. Inscription et obligations des utilisateurs</h2>
            <h3>3.1 Conditions d'inscription</h3>
            <p>L'inscription est ouverte à toute personne physique majeure (18 ans révolus) ou personne morale domiciliée en Suisse. L'utilisateur garantit l'exactitude des informations fournies.</p>
            <h3>3.2 Obligations du Client</h3>
            <p>Le Client s'engage à fournir une description précise et honnête de sa demande, à respecter les délais convenus avec le Prestataire, et à valider ou contester le travail dans un délai de 5 jours ouvrés après notification d'achèvement.</p>
            <h3>3.3 Obligations du Prestataire</h3>
            <p>Le Prestataire s'engage à disposer des qualifications nécessaires, à fournir un travail conforme aux termes convenus, et à respecter le droit suisse applicable, notamment la LTr (loi sur le travail) s'il emploie du personnel.</p>

            <h2>4. Fonctionnement du séquestre</h2>
            <p>Le paiement est sécurisé par un mécanisme de séquestre :</p>
            <ul>
                <li><strong>Blocage</strong> : le montant convenu est bloqué sur un compte séquestre dès l'acceptation de l'offre par le Client ;</li>
                <li><strong>Notification</strong> : le Prestataire est informé du blocage des fonds et peut commencer le travail ;</li>
                <li><strong>Libération</strong> : à l'achèvement du travail, le Client valide et les fonds sont libérés au Prestataire, déduction faite de la commission Oflem ;</li>
                <li><strong>Litige</strong> : en cas de désaccord, les fonds restent bloqués pendant la procédure de médiation.</li>
            </ul>
            <p>Les fonds en séquestre sont gérés par un prestataire de services de paiement agréé, en conformité avec la législation suisse sur les services financiers. <strong>Oflem ne détient jamais directement les fonds des utilisateurs.</strong></p>

            <h2>5. Commission et tarification</h2>
            <p>La publication d'une demande par un Client est gratuite. Le Client ne paie aucun frais de service additionnel en dehors de la commission Oflem.</p>
            <p>La commission Oflem est <strong>ajoutée au prix proposé par le Prestataire</strong> et facturée au Client. Le Prestataire reçoit <strong>100% du montant de son offre</strong>. La commission est dégressive selon le montant de la mission :</p>
            <ul>
                <li><strong>25% (hors TVA)</strong> — missions jusqu'à CHF 149.–</li>
                <li><strong>20% (hors TVA)</strong> — missions de CHF 150.– à CHF 499.–</li>
                <li><strong>12% (hors TVA)</strong> — missions à partir de CHF 500.–</li>
            </ul>
            <p>Oflem se réserve le droit de modifier ses tarifs avec un préavis de 30 jours, notifié par email aux utilisateurs concernés.</p>

            <h2>6. Services d'économie domestique</h2>
            <p>Certains services proposés sur la Plateforme, notamment le nettoyage, le repassage, la garde d'enfants et l'aide à domicile, relèvent de l'économie domestique. Le Client reconnaît qu'il peut acquérir le statut d'employeur au sens de l'art. 319 CO et de la LAVS.</p>
            <p>Le Client s'engage à procéder aux déclarations obligatoires auprès de la caisse de compensation AVS de son canton et à s'acquitter des cotisations sociales.</p>

            <h2>7. Protection des communications</h2>
            <p>La messagerie intégrée est le canal officiel entre Client et Prestataire. L'échange prématuré de coordonnées personnelles est interdit avant la conclusion et le paiement de la mission.</p>

            <h2>8. Médiation et résolution des litiges</h2>
            <p>La médiation proposée par Oflem est gratuite et non contraignante. En cas d'échec, les parties conservent le droit de recours devant les juridictions compétentes, for: siège social d'Oflem SA.</p>

            <h2>9. Responsabilité</h2>
            <p>Oflem n'est pas responsable de la qualité, la ponctualité ou la conformité des prestations. La responsabilité d'Oflem est limitée au fonctionnement de la Plateforme et du séquestre.</p>

            <h2>10. Droit applicable</h2>
            <p>Les CGU sont régies par le droit suisse. For exclusif: siège social d'Oflem SA, sauf dispositions impératives contraires (art. 32 CPC pour les consommateurs).</p>
        </>
    ),
    mentions: (
        <>
            <h2>Éditeur du site</h2>
            <p>Oflem SA (en cours de constitution)<br />Forme juridique : Société anonyme de droit suisse<br />Siège social : Suisse romande<br />Contact : <a href="mailto:contact@oflem.ch" style={{ color: 'var(--o)' }}><strong>contact@oflem.ch</strong></a></p>

            <h2>Hébergement</h2>
            <p>Le site est hébergé en Suisse, conformément aux exigences de la nLPD en matière de localisation des données.</p>

            <h2>Propriété intellectuelle</h2>
            <p>L'ensemble du contenu du site (textes, images, logo, icônes) est la propriété exclusive d'Oflem SA ou de ses partenaires. Toute reproduction est interdite sans autorisation préalable (art. 2 LDA).</p>

            <h2>Responsabilité éditoriale</h2>
            <p>Oflem s'efforce d'assurer l'exactitude des informations, mais ne saurait être tenue responsable des erreurs ou omissions.</p>
        </>
    ),
    privacy: (
        <>
            <h2>1. Responsable du traitement</h2>
            <p>Oflem SA (en cours de constitution), Suisse romande.</p>

            <h2>2. Données collectées</h2>
            <ul>
                <li>Données d'identification : nom, e-mail, téléphone ;</li>
                <li>Données professionnelles (Prestataires) ;</li>
                <li>Données de transaction : montants, statuts ;</li>
                <li>Données de communication : messages échangés ;</li>
                <li>Données techniques : IP, user-agent, cookies essentiels.</li>
            </ul>

            <h2>3. Finalités</h2>
            <p>Exécution du contrat, gestion du séquestre, prévention de fraude, amélioration du service, obligations légales.</p>

            <h2>4. Durée de conservation</h2>
            <p>Conservation 10 ans pour obligations comptables, 2 ans pour données de messagerie après clôture de la mission.</p>

            <h2>5. Droits</h2>
            <ul>
                <li>Droit d'accès, rectification, effacement, portabilité, opposition ;</li>
                <li>Contact : <strong>privacy@oflem.ch</strong>.</li>
            </ul>

            <h2>6. Sécurité</h2>
            <p>Mesures : TLS/SSL, hachage de mots de passe, backups, contrôle des accès.</p>
        </>
    ),
    cookies: (
        <>
            <h2>1. Cookies essentiels</h2>
            <p>Les cookies essentiels sont indispensables au fonctionnement du site (authentification, sécurité, séquestre).</p>

            <h2>2. Cookies de performance</h2>
            <p>Mesure d'audience, amélioration de l'expérience. Option de consentement disponible.</p>

            <h2>3. Refus / suppression</h2>
            <p>Vous pouvez refuser ou supprimer les cookies via les paramètres du navigateur. Certaines fonctionnalités peuvent être limitées.</p>

            <h2>4. Consentement</h2>
            <p>Continuer l'utilisation du site vaut consentement à nos cookies non essentiels. Les cookies essentiels sont utilisés sans consentement pour des raisons techniques.</p>
        </>
    ),
    about: (
      <>
        <h2>À propos de Oflem</h2>
        <p>Oflem est une plateforme suisse dédiée à l'économie de proximité. Notre mission : simplifier la vie quotidienne en mettant en relation des personnes de confiance.</p>
        <p>Données hébergées en Suisse (Infomaniak), prestataires vérifiés, paiement protégé par séquestre.</p>
        <p>La plateforme est pensée pour un usage simple, transparent et sécurisé : publication gratuite des demandes, commission visible avant paiement, modération et service client local.</p>
      </>
    )
};

export default function Legal({ section }) {
    const { t } = useTranslation();
    const active = section || 'cgu';

    return (
        <div className="oflem-home-page">
            <Head title={`${sections[active]?.title || 'Légal'} · Oflem`} />

            <section className="oflem-section oflem-section-white" style={{ paddingTop: '56px', paddingBottom: '72px' }}>
                <div className="oflem-container">
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div className="oflem-section-label">Légal</div>
                        <h2 className="oflem-section-title" style={{ fontSize: '36px' }}>{sections[active]?.title}</h2>
                        {sections[active]?.subtitle && <p style={{ color: 'var(--g500)', fontSize: '13px' }}>{sections[active].subtitle}</p>}
                    </div>

                    <div className="legal-nav">
                        <Link href={route('legal', { section: 'cgu' })} className={activeLinkClasses(active === 'cgu')}>CGU</Link>
                        <Link href={route('legal', { section: 'mentions' })} className={activeLinkClasses(active === 'mentions')}>Mentions légales</Link>
                        <Link href={route('legal', { section: 'privacy' })} className={activeLinkClasses(active === 'privacy')}>Protection des données</Link>
                        <Link href={route('legal', { section: 'cookies' })} className={activeLinkClasses(active === 'cookies')}>Cookies</Link>
                        <Link href={route('legal', { section: 'about' })} className={activeLinkClasses(active === 'about')}>À propos</Link>
                    </div>

                    <div className="legal-content" style={{ background: '#fff', border: '1px solid var(--g300)', borderRadius: 'var(--rl)', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                        {contentBySection[active]}
                    </div>
                </div>
            </section>
        </div>
    );
}
