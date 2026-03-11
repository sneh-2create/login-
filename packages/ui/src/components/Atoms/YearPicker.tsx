import React, { useRef, useEffect, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { YearPickerProps } from '@od-erp/types';
import { cn } from '../../utils';

export const YearPicker: React.FC<YearPickerProps> = ({
    label,
    value,
    defaultValue,
    onChange,
    min,
    max,
    error,
    placeholder = 'Select year',
    containerClassName = '',
    id,
    disabled = false,
    yearRange = 12,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const raw = value ?? defaultValue;
    const strValue = typeof raw === 'number' ? String(raw) : raw ?? '';
    const [internalValue, setInternalValue] = useState(strValue);
    const controlled = value !== undefined;
    const displayValue = controlled ? (typeof value === 'number' ? String(value) : value ?? '') : internalValue;
    const pickerId = id ?? `year-picker-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

    const currentYear = new Date().getFullYear();
    const minYear = min ?? currentYear - Math.floor(yearRange / 2);
    const maxYear = max ?? currentYear + Math.floor(yearRange / 2);
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const selectedYear = displayValue ? parseInt(displayValue, 10) : null;

    useEffect(() => {
        if (controlled) {
            const v = value;
            setInternalValue(typeof v === 'number' ? String(v) : v ?? '');
        }
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

    const handleSelect = (y: number) => {
        const next = String(y);
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
                    'flex items-center gap-1.5 sm:gap-2 w-full min-w-0 box-border border pl-2 sm:pl-2.5 pr-2 py-1.5 sm:py-2 text-[var(--font-size-sm)]',
                    'rounded-[var(--border-radius-md)] transition-colors duration-150 text-left',
                    'bg-[var(--color-white)] border-[var(--border-color)] text-[var(--color-dark)]',
                    'hover:border-[var(--ui-gray-400)] outline-none focus:!outline-none focus:ring-0 focus-visible:!outline-none focus-visible:ring-0 focus:border-[var(--color-primary)] focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                    'disabled:bg-[var(--color-grey-1)] disabled:border-[var(--ui-gray-300)] disabled:text-[var(--color-secondary)] disabled:cursor-not-allowed',
                    open && '!border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-40',
                    error && !open && '!border-[var(--color-error)]'
                )}
            >
                <Calendar className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" aria-hidden />
                <span className={cn('flex-1 min-w-0', !displayValue && 'text-[var(--ui-placeholder-color)]')}>
                    {displayValue || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" aria-hidden />
            </button>
            {open && !disabled && triggerWidth != null && (
                <div
                    className="absolute top-full left-0 z-50 mt-1 box-border min-w-0 max-h-[220px] overflow-auto rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg py-2"
                    style={{ width: triggerWidth, maxWidth: triggerWidth, boxSizing: 'border-box' }}
                >
                    {years.map((y) => (
                        <button
                            key={y}
                            type="button"
                            onClick={() => handleSelect(y)}
                            className={cn(
                                'w-full px-3 py-2 text-sm text-left outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                selectedYear === y
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]'
                            )}
                        >
                            {y}
                        </button>
                    ))}
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
