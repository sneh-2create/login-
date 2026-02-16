import React from 'react';
import type { TextAreaProps } from '@od-erp/types';
import { cn } from '../../utils';

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    value,
    defaultValue,
    onChange,
    placeholder,
    error,
    containerClassName = '',
    id,
    disabled = false,
    rows = 4,
    className = '',
    ...rest
}) => {
    const textAreaId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const isControlled = value !== undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={cn('flex flex-col gap-1.5 min-w-0 w-full', containerClassName)}>
            {label != null && label !== '' && (
                <label
                    htmlFor={textAreaId}
                    className={cn(
                        'block text-sm font-medium text-[var(--color-dark)]',
                        disabled && 'opacity-60'
                    )}
                >
                    {label}
                </label>
            )}
            <textarea
                id={textAreaId}
                {...(isControlled ? { value } : { defaultValue })}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={cn(
                    'w-full min-w-0 rounded-[var(--border-radius-md)] border px-3 py-2 text-sm resize-y transition-[border-color,box-shadow]',
                    'bg-[var(--color-white)] border-[var(--border-color)] text-[var(--color-dark)] placeholder:text-[var(--ui-placeholder-color)]',
                    !disabled && !error && 'hover:border-[var(--ui-gray-400)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-40 focus:border-[var(--color-primary)]',
                    'disabled:bg-[var(--control-disabled-bg)] disabled:border-[var(--control-disabled-border)] disabled:text-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-60',
                    error && '!border-[var(--color-error)] focus:!ring-[var(--color-error)]',
                    className
                )}
                aria-invalid={!!error}
                aria-describedby={error ? `${textAreaId}-error` : undefined}
                {...rest}
            />
            {error != null && error !== '' && (
                <p id={`${textAreaId}-error`} className="text-xs text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
