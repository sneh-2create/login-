import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { NumberInputProps } from '@od-erp/types';
import { cn } from '../../utils';

/** Number input with stepper. Uses theme vars for colors/sizing. */
export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    error,
    success = false,
    helperText,
    required = false,
    className = '',
    containerClassName = '',
    id,
    disabled,
    value,
    defaultValue,
    min,
    max,
    step = 1,
    onChange,
    ...props
}) => {
    const inputId = id || props.name || `number-input-${Math.random().toString(36).slice(2, 9)}`;
    const toScalar = (v: string | number | readonly string[] | undefined): string | number => {
        if (v === undefined || v === null) return '';
        if (Array.isArray(v)) return v[0] ?? '';
        return typeof v === 'number' || typeof v === 'string' ? v : '';
    };
    const [internalValue, setInternalValue] = React.useState<string | number>(() => {
        const raw = value !== undefined ? value : defaultValue ?? '';
        return Array.isArray(raw) ? (raw[0] ?? '') : (typeof raw === 'number' || typeof raw === 'string' ? raw : '');
    });
    const isControlled = value !== undefined;
    const displayValue = isControlled ? toScalar(value) : internalValue;
    const numValue = typeof displayValue === 'string' ? parseFloat(displayValue) : Number(displayValue);

    const [successRevealed, setSuccessRevealed] = React.useState(false);

    React.useEffect(() => {
        if (isControlled) setInternalValue(toScalar(value));
    }, [isControlled, value]);

    React.useEffect(() => {
        if (success && !error && helperText) {
            const id = requestAnimationFrame(() => setSuccessRevealed(true));
            return () => cancelAnimationFrame(id);
        }
        setSuccessRevealed(false);
    }, [success, error, helperText]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next: string | number = e.target.value;
        if (!isControlled) setInternalValue(next);
        onChange?.(e);
    };

    const handleStep = (delta: number) => {
        if (disabled) return;
        const current = typeof numValue === 'number' && !Number.isNaN(numValue) ? numValue : 0;
        const next = current + delta;
        const minNum = typeof min === 'number' ? min : min != null ? parseFloat(String(min)) : undefined;
        const maxNum = typeof max === 'number' ? max : max != null ? parseFloat(String(max)) : undefined;
        const clamped = minNum != null && next < minNum ? minNum : maxNum != null && next > maxNum ? maxNum : next;
        const nextStr = String(clamped);
        if (!isControlled) setInternalValue(nextStr);
        const synthetic = {
            target: { value: nextStr, name: props.name, id: inputId }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(synthetic);
    };

    return (
        <div className={cn('flex flex-col min-w-0 w-full', containerClassName)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'block mb-1.5 text-sm font-medium text-[var(--color-dark)]',
                        disabled && 'opacity-60'
                    )}
                >
                    {label}
                    {required && <span className="text-[var(--color-error)] ml-0.5" aria-hidden>*</span>}
                </label>
            )}
            <div className="relative flex items-stretch">
                <input
                    type="number"
                    id={inputId}
                    disabled={disabled}
                    value={isControlled ? toScalar(value) : internalValue}
                    defaultValue={defaultValue}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleChange}
                    aria-invalid={!!error}
                    aria-required={required}
                    aria-describedby={helperText ? `${inputId}-helper` : undefined}
                    className={cn(
                        'block w-full min-w-0 box-border border pl-2 pr-6 sm:pl-2.5 sm:pr-8 py-1.5 sm:py-2 text-[var(--font-size-sm)]',
                        'rounded-[var(--border-radius-md)] transition-colors duration-150',
                        'bg-[var(--color-white)] border-[var(--border-color)] text-[var(--color-dark)] placeholder:text-[var(--ui-placeholder-color)]',
                        'hover:border-[var(--ui-gray-400)]',
                        'focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]',
                        'disabled:bg-[var(--color-grey-1)] disabled:border-[var(--ui-gray-300)] disabled:text-[var(--color-secondary)] disabled:placeholder:text-[var(--ui-gray-400)] disabled:cursor-not-allowed disabled:hover:border-[var(--ui-gray-300)]',
                        error && '!border-[var(--color-error)] focus:!border-[var(--color-error)]',
                        success && !error && '!border-[var(--color-success)] focus:!border-[var(--color-success)]',
                        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                        className
                    )}
                    {...props}
                />
                {!disabled && (
                    <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center gap-px pointer-events-none w-6">
                        <button
                            type="button"
                            aria-label="Increment"
                            className={cn(
                                'flex items-center justify-center rounded-sm text-[var(--color-secondary)] hover:text-[var(--color-dark)] hover:bg-black/5 focus:outline-none focus:bg-black/5 pointer-events-auto',
                                (max != null && !Number.isNaN(numValue) && numValue >= Number(max)) && 'opacity-40 pointer-events-none'
                            )}
                            onClick={() => handleStep(step == null ? 1 : +step)}
                        >
                            <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button
                            type="button"
                            aria-label="Decrement"
                            className={cn(
                                'flex items-center justify-center rounded-sm text-[var(--color-secondary)] hover:text-[var(--color-dark)] hover:bg-black/5 focus:outline-none focus:bg-black/5 pointer-events-auto',
                                (min != null && !Number.isNaN(numValue) && numValue <= Number(min)) && 'opacity-40 pointer-events-none'
                            )}
                            onClick={() => handleStep(step == null ? -1 : -(+step))}
                        >
                            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>
            {helperText && !error && !success && (
                <p id={`${inputId}-helper`} className="mt-1 text-xs text-[var(--color-secondary)]">
                    {helperText}
                </p>
            )}
            {success && !error && helperText && (
                <p
                    id={`${inputId}-helper`}
                    className={cn(
                        'mt-1 text-xs text-[var(--color-success)] transition-all duration-200 ease-out',
                        successRevealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                    )}
                >
                    {helperText}
                </p>
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
