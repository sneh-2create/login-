import React from 'react';

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    containerClassName?: string;
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    className = '',
    containerClassName = '',
    placeholder,
    id,
    ...props
}) => {
    const selectId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1ca9c9] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
                {...props}
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};
