import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    containerClassName = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-dark)]">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`flex h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-dark)] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--ui-placeholder-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''} ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
        </div>
    );
};
