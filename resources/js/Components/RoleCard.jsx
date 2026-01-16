import React from 'react';

export default function RoleCard({ icon, emoji, title, description, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full p-6 rounded-[24px]
                border-2 transition-all duration-300
                text-left
                ${selected 
                    ? 'border-gold-accent bg-gold-accent/10 shadow-lg scale-[1.02]' 
                    : 'border-gray-border/50 bg-white hover:border-gold-accent/50 hover:shadow-md hover:-translate-y-1'
                }
            `}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {icon ? (
                        <img src={icon} alt="" className="w-12 h-12 object-contain" />
                    ) : (
                        <span className="text-4xl">{emoji}</span>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-black text-primary-black mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-muted font-medium leading-relaxed">
                        {description}
                    </p>
                </div>
                {selected && (
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-gold-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </button>
    );
}
