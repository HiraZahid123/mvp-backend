import React from 'react';


export default function AuthSplitLayout({ children, heroImage, heroHeading, heroSubtext, bgAccentClass = 'bg-cream-accent' }) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-oflem-cream font-sans">
            {/* Left Side - Illustration (Top on Mobile) */}
            <div className={`w-full lg:w-1/2 flex flex-col justify-center items-center ${bgAccentClass} relative overflow-hidden min-h-[40vh] lg:min-h-screen p-10 lg:p-16 transition-colors duration-500`}>
                <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
                    {heroHeading && (
                        <div className="text-center mb-6 lg:mb-8">
                            <h2 className="text-2xl lg:text-3xl font-black text-primary-black tracking-tight mb-2">{heroHeading}</h2>
                            {heroSubtext && <p className="text-gray-muted text-sm lg:text-base font-bold">{heroSubtext}</p>}
                        </div>
                    )}
                    <div className="mb-0 w-full text-center">
                        <img 
                            src={heroImage || "/images/illustrations/login-hero.svg"} 
                            alt="Oflem Hero" 
                            className="w-full h-auto max-w-none mx-auto" 
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Content (Bottom on Mobile) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-32 py-16 bg-oflem-cream relative">

                <div className="w-full max-w-[440px] mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
