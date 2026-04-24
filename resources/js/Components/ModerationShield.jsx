import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const STATES = {
    scanning: {
        Icon: Shield,
        iconColor: '#94a3b8',
        label: 'Analyse IA en cours…',
        bg: '#f8fafc',
        border: '#e2e8f0',
        text: '#64748b',
        pulse: true,
    },
    verified: {
        Icon: ShieldCheck,
        iconColor: '#16a34a',
        label: 'Contenu vérifié par IA',
        bg: '#f0fdf4',
        border: '#86efac',
        text: '#15803d',
        pulse: false,
    },
    blocked: {
        Icon: ShieldAlert,
        iconColor: '#dc2626',
        label: null, // filled from `message` prop
        bg: '#fff1f2',
        border: '#fca5a5',
        text: '#b91c1c',
        pulse: false,
    },
};

/**
 * Universal AI Moderation Shield indicator.
 *
 * status: 'idle' | 'scanning' | 'verified' | 'blocked'
 * message: optional reason string shown in the blocked state
 */
export default function ModerationShield({ status = 'idle', message = '', className = '' }) {
    if (status === 'idle') return null;

    const cfg = STATES[status];
    if (!cfg) return null;

    const { Icon } = cfg;
    const label = status === 'blocked'
        ? (message || "Ce contenu n'est pas autorisé sur Oflem.")
        : cfg.label;

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 700,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.text,
                letterSpacing: '0.01em',
                transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
            }}
            className={className}
        >
            <span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: cfg.iconColor,
                    ...(cfg.pulse ? { animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite' } : {}),
                }}
            >
                <Icon size={14} strokeWidth={2.5} />
            </span>
            <span>{label}</span>
        </div>
    );
}
