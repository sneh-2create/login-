import React, { useRef, useEffect, useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import type { TimePickerProps } from '@od-erp/types';
import { cn } from '../../utils';

function pad(n: number) {
    return String(n).padStart(2, '0');
}

export const TimePicker: React.FC<TimePickerProps> = ({
    label,
    value,
    defaultValue = '',
    onChange,
    error,
    placeholder = 'Select time',
    containerClassName = '',
    id,
    disabled = false,
    hour12: _hour12 = false,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? defaultValue);
    const controlled = value !== undefined;
    const displayValue = controlled ? value : internalValue;
    const pickerId = id ?? `time-picker-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

    useEffect(() => {
        if (controlled && value !== undefined) setInternalValue(value);
    }, [controlled, value]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            setTriggerWidth(null);
            return;
        }
        const el = triggerRef.current;
        if (!el) return;
        const measure = () => setTriggerWidth(el.getBoundingClientRect().width);
        measure();
        const id = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(id);
    }, [open]);

    const [h, m] = displayValue ? displayValue.split(':').map(Number) : [0, 0];
    const hourNum = Number.isNaN(h) ? 0 : h;
    const minNum = Number.isNaN(m) ? 0 : m;

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleSelect = (hour: number, minute: number) => {
        const next = `${pad(hour)}:${pad(minute)}`;
        if (!controlled) setInternalValue(next);
        onChange?.(next);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative flex flex-col min-w-0 w-full', containerClassName)} {...rest}>
            {label && (
                <label
                    htmlFor={pickerId}
                    className={cn(
                        'block mb-1.5 text-sm font-medium text-[var(--color-dark)]',
                        disabled && 'opacity-60'
                    )}
                >
                    {label}
                </label>
            )}
            <button
                ref={triggerRef}
                type="button"
                id={pickerId}
                disabled={disabled}
                aria-expanded={open}
                aria-haspopup="listbox"
                onClick={() => !disabled && setOpen((o) => !o)}
                className={cn(
                    'flex items-center gap-1.5 sm:gap-2 w-full min-w-0 min-w-[8rem] sm:min-w-[9rem] box-border border pl-2 sm:pl-2.5 pr-2 py-1.5 sm:py-2 text-[var(--font-size-sm)]',
                    'rounded-[var(--border-radius-md)] transition-colors duration-150 text-left',
                    'bg-[var(--color-white)] border-[var(--border-color)] text-[var(--color-dark)]',
                    'hover:border-[var(--ui-gray-400)] outline-none focus:!outline-none focus:ring-0 focus-visible:!outline-none focus-visible:ring-0 focus:border-[var(--color-primary)] focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                    'disabled:bg-[var(--color-grey-1)] disabled:border-[var(--ui-gray-300)] disabled:text-[var(--color-secondary)] disabled:cursor-not-allowed',
                    open && '!border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-40',
                    error && !open && '!border-[var(--color-error)]'
                )}
            >
                <Clock className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" aria-hidden />
                <span className={cn('flex-1 min-w-0', !displayValue && 'text-[var(--ui-placeholder-color)]')}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" aria-hidden />
            </button>
            {open && !disabled && triggerWidth != null && (
                <div
                    className="absolute top-full left-0 z-50 mt-1 flex box-border min-w-0 overflow-auto rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg py-2"
                    style={{ width: triggerWidth, maxWidth: triggerWidth, boxSizing: 'border-box' }}
                >
                    <div className="flex w-full max-h-[200px] overflow-auto">
                        <div className="flex-1 overflow-y-auto px-1">
                            {hours.map((hour) => (
                                <button
                                    key={hour}
                                    type="button"
                                    onClick={() => handleSelect(hour, minNum)}
                                    className={cn(
                                        'w-full px-2 py-1.5 text-sm rounded text-left outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                        hour === hourNum
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]'
                                    )}
                                >
                                    {pad(hour)}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto px-1 border-l border-[var(--border-color)]">
                            {minutes.map((minute) => (
                                <button
                                    key={minute}
                                    type="button"
                                    onClick={() => handleSelect(hourNum, minute)}
                                    className={cn(
                                        'w-full px-2 py-1.5 text-sm rounded text-left outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                        minute === minNum
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]'
                                    )}
                                >
                                    {pad(minute)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
