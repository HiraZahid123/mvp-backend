export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-border text-oflem-terracotta focus:ring-oflem-terracotta h-4 w-4 ' +
                className
            }
        />
    );
}
