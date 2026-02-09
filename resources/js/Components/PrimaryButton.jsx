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
                `inline-flex items-center justify-center rounded-full bg-gold-accent px-8 py-4 text-sm font-bold text-primary-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-accent/20 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none active:scale-[0.98] shadow-md ` +
                className
            }
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-primary-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
