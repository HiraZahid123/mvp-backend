export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-full border border-transparent bg-red-600 px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-all duration-500 ease-out hover:bg-red-700 hover:shadow-elegant active:bg-red-800 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
