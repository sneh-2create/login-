import React, { useState, useEffect } from 'react';
import type { RadioProps, RadioOption } from '@od-erp/types';
import { cn } from '../../utils';

/**
 * Radio group (Figma 659-6583) – all variants for use across the app.
 * States per option: default, selected, hover (when not disabled), disabled, focus-visible.
 */
export const Radio: React.FC<RadioProps> = ({
    name,
    options,
    value: valueProp,
    defaultValue,
    onChange,
    disabled = false,
    containerClassName = '',
    id: _id,
    ...rest
}) => {
    const [internalValue, setInternalValue] = useState<string | number | undefined>(valueProp ?? defaultValue);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : internalValue;

    useEffect(() => {
        if (controlled && valueProp !== undefined) setInternalValue(valueProp);
    }, [controlled, valueProp]);

    const handleChange = (option: RadioOption) => {
        if (!controlled) setInternalValue(option.value);
        onChange?.(option.value);
    };

    return (
        <div className={cn('flex flex-col gap-2 min-w-0', containerClassName)} role="radiogroup" aria-label={name} {...rest}>
            {options.map((option) => {
                const isSelected = value === option.value;
                const inputId = `radio-${name}-${String(option.value)}`;
                return (
                    <label
                        key={String(option.value)}
                        htmlFor={inputId}
                        className={cn(
                            'group inline-flex items-center gap-2 cursor-pointer select-none',
                            disabled && 'is-disabled opacity-[var(--control-disabled-opacity)] cursor-not-allowed'
                        )}
                    >
                        <input
                            type="radio"
                            id={inputId}
                            name={name}
                            checked={isSelected}
                            onChange={() => handleChange(option)}
                            disabled={disabled}
                            className="sr-only peer"
                            value={String(option.value)}
                            aria-label={typeof option.label === 'string' ? option.label : undefined}
                        />
                        <span
                            className={cn(
                                'w-[var(--control-size)] h-[var(--control-size)] shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-150',
                                isSelected ? 'border-[var(--control-checked-border)]' : 'bg-[var(--control-bg)] border-[var(--control-border)]',
                                !disabled && 'group-hover:border-[var(--control-hover-border)]',
                                disabled && 'bg-[var(--control-disabled-bg)] border-[var(--control-disabled-border)]',
                                disabled && 'group-hover:border-[var(--control-disabled-border)]',
                                'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-opacity-40 peer-focus-visible:ring-offset-1'
                            )}
                        >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--control-checked-bg)] shrink-0" />}
                        </span>
                        {option.label != null && <span className="text-sm text-[var(--color-dark)]">{option.label}</span>}
                    </label>
                );
            })}
        </div>
    );
};
