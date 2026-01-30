import React from 'react';

export default function ProgressIndicator({ currentStep, totalSteps, className = '' }) {
    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <span className="text-xs font-black uppercase tracking-widest text-gray-muted">
                Étape {currentStep} sur {totalSteps}
            </span>
            <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                            index < currentStep
                                ? 'w-8 bg-oflem-terracotta'
                                : index === currentStep - 1
                                ? 'w-12 bg-oflem-terracotta'
                                : 'w-6 bg-gray-200'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
