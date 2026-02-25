import React from 'react';

export default function RoleCard({ icon, emoji, title, description, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full p-6 rounded-[24px]
                border-2 transition-all duration-500 ease-out
                text-left
                ${selected 
                    ? 'border-oflem-terracotta bg-oflem-terracotta/5 shadow-elegant-glow scale-[1.02]' 
                    : 'border-zinc-100 bg-white hover:border-oflem-terracotta/40 hover:shadow-elegant hover:-translate-y-1'
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
                    <h3 className="text-xl font-black text-oflem-charcoal mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-muted font-medium leading-relaxed">
                        {description}
                    </p>
                </div>
                {selected && (
                    <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-oflem-terracotta rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </button>
    );
}
