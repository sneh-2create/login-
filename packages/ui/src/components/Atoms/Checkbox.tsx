import React, { useState, useEffect } from 'react';
import type { CheckboxProps } from '@od-erp/types';
import { cn } from '../../utils';

/**
 * Checkbox (Figma 659-6578) – all variants for use across the app.
 * States: default (unchecked), checked, hover (when not disabled), disabled (unchecked & checked), focus-visible.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    checked: checkedProp,
    defaultChecked = false,
    onChange,
    containerClassName = '',
    className = '',
    disabled = false,
    id,
    ...rest
}) => {
    const inputId = id ?? `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const controlled = checkedProp !== undefined;
    const checked = controlled ? checkedProp : internalChecked;

    useEffect(() => {
        if (controlled && checkedProp !== undefined) setInternalChecked(checkedProp);
    }, [controlled, checkedProp]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.checked;
        if (!controlled) setInternalChecked(next);
        onChange?.(next);
    };

    return (
        <div className={cn('flex items-center gap-2 min-w-0', containerClassName)}>
            <label
                htmlFor={inputId}
                className={cn(
                    'group inline-flex items-center gap-2 cursor-pointer select-none',
                    disabled && 'is-disabled opacity-[var(--control-disabled-opacity)] cursor-not-allowed',
                    className
                )}
            >
                <input
                    type="checkbox"
                    id={inputId}
                    {...(controlled ? { checked } : { defaultChecked })}
                    onChange={handleChange}
                    disabled={disabled}
                    className="sr-only peer"
                    aria-label={typeof label === 'string' ? label : undefined}
                    {...rest}
                />
                <span
                    className={cn(
                        'w-[var(--control-size)] h-[var(--control-size)] shrink-0 rounded-[var(--border-radius-sm)] border-2 flex items-center justify-center transition-colors duration-150',
                        checked
                            ? 'bg-[var(--control-checked-bg)] border-[var(--control-checked-border)]'
                            : 'bg-[var(--control-bg)] border-[var(--control-border)]',
                        !disabled && 'group-hover:border-[var(--control-hover-border)]',
                        disabled && 'bg-[var(--control-disabled-bg)] border-[var(--control-disabled-border)]',
                        disabled && 'group-hover:border-[var(--control-disabled-border)]',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-opacity-40 peer-focus-visible:ring-offset-1'
                    )}
                >
                    {checked && (
                        <svg className="w-2.5 h-2.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </span>
                {label != null && <span className="text-sm text-[var(--color-dark)]">{label}</span>}
            </label>
        </div>
    );
};
