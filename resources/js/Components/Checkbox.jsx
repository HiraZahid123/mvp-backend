export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-border text-gold-accent focus:ring-gold-accent h-4 w-4 ' +
                className
            }
        />
    );
}
