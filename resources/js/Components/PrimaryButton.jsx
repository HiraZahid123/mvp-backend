export default function PrimaryButton({
    className = '',
    disabled,
    children,
    processing,
    ...props
}) {
    // Only show loading state if processing is explicitly true.
    const isLoading = !!processing;

    return (
        <button
            {...props}
            disabled={disabled || processing}
            className={
                `inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light text-white rounded-rs font-black text-[14px] uppercase tracking-widest shadow-sho transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-elegant-glow active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-oflem-terracotta/20 disabled:from-zinc-100 disabled:to-zinc-100 disabled:text-zinc-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none ` +
                className
            }
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-oflem-charcoal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Please wait...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
