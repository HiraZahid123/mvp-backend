export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-semibold text-oflem-charcoal ml-4 ` + className
            }
        >
            {value ? value : children}
        </label>
    );
}
