import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function PasswordInput({ 
    id,
    value, 
    onChange, 
    placeholder = 'Enter your password',
    autoComplete = 'current-password',
    required = false,
    className = ''
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                className={`
                    w-full px-4 py-3 pr-12
                    bg-input-bg border border-gray-border/50
                    rounded-[24px]
                    text-oflem-charcoal text-base
                    placeholder:text-gray-muted/60
                    focus:outline-none focus:ring-2 focus:ring-oflem-terracotta/30 focus:border-oflem-terracotta
                    transition-all duration-200
                    ${className}
                `}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-muted hover:text-oflem-charcoal transition-colors duration-200"
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                ) : (
                    <EyeIcon className="w-5 h-5" />
                )}
            </button>
        </div>
    );
}
