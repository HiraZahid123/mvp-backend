import React from 'react';
import useTranslation from '@/Hooks/useTranslation';

export default function OnboardingProgressBar({ step = 1 }) {
    const { t } = useTranslation();

    const steps = [
        { id: 1, label: t('onboarding.your_request') },
        { id: 2, label: t('onboarding.your_account') },
        { id: 3, label: t('onboarding.verification') },
    ];

    return (
        <div className="progress-bar-wrap">
            {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                    <div className="progress-step-item">
                        <div className={`progress-step-circle ${s.id < step ? 'done' : s.id === step ? 'active' : ''}`}>
                            {s.id < step ? '✓' : s.id}
                        </div>
                        <div className={`progress-step-label ${s.id === step ? 'active' : ''}`}>
                            {s.label}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`progress-connector ${s.id < step ? 'done' : ''}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
