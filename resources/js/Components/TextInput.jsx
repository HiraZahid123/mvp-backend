import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'w-full px-6 py-4 bg-input-bg border border-gray-border/80 rounded-full text-charcoal placeholder:text-gray-muted/80 shadow-sm focus:ring-2 focus:ring-oflem-terracotta/50 focus:border-oflem-terracotta outline-none transition-all duration-300 ease-out hover:border-oflem-terracotta/50 ' +
                className
            }
            ref={localRef}
        />
    );
});
