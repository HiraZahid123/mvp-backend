import React, { useRef, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import useTranslation from '@/Hooks/useTranslation';

export default function PhotoUploader({ value, onChange, previewUrl }) {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(previewUrl || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onChange(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Photo Preview Circle */}
            <div 
                onClick={handleClick}
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-border/30 cursor-pointer group hover:border-oflem-terracotta transition-all duration-300"
            >
                {preview ? (
                    <img 
                        src={preview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-oflem-terracotta/20 to-oflem-terracotta/5 flex items-center justify-center">
                        <img 
                            src="/images/branding/oflem-placeholder.svg" 
                            alt="OFLEM placeholder" 
                            className="w-16 h-16 opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `
                                    <svg class="w-16 h-16 text-gray-muted/40" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                    </svg>
                                `;
                            }}
                        />
                    </div>
                )}
                
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-white" />
                </div>
            </div>

            {/* Upload Button */}
            <button
                type="button"
                onClick={handleClick}
                className="
                    px-6 py-2.5 
                    bg-white border-2 border-gray-border/50
                    rounded-[24px]
                    text-sm font-bold text-oflem-charcoal
                    hover:border-oflem-terracotta hover:bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light/5
                    transition-all duration-300
                "
            >
                {t('Choisir une photo')}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <p className="text-xs text-gray-muted text-center max-w-xs">
                {t('Optionnel • Une photo multiplie vos opportunités')}
            </p>
        </div>
    );
}
