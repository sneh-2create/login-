import React, { useRef, useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MonthPickerProps } from '@od-erp/types';
import { cn } from '../../utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseYYYYMM(s: string | undefined): { y: number; m: number } | null {
    if (!s || !/^\d{4}-\d{2}$/.test(s)) return null;
    const [y, m] = s.split('-').map(Number);
    if (m < 1 || m > 12) return null;
    return { y, m: m - 1 };
}

function toYYYYMM(y: number, m: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}`;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
    label,
    value,
    defaultValue = '',
    onChange,
    min,
    max,
    error,
    placeholder = 'Select month',
    containerClassName = '',
    id,
    disabled = false,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? defaultValue);
    const controlled = value !== undefined;
    const displayValue = controlled ? value : internalValue;
    const pickerId = id ?? `month-picker-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

    const parsed = parseYYYYMM(displayValue);
    const [viewYear, setViewYear] = useState(parsed?.y ?? new Date().getFullYear());

    useEffect(() => {
        if (controlled && value !== undefined) setInternalValue(value);
    }, [controlled, value]);

    useEffect(() => {
        if (parsed) setViewYear(parsed.y);
    }, [displayValue]);

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

    const isDisabled = (m: number) => {
        const ym = toYYYYMM(viewYear, m);
        if (min && ym < min) return true;
        if (max && ym > max) return true;
        return false;
    };

    const handleSelect = (m: number) => {
        const next = toYYYYMM(viewYear, m);
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
                aria-haspopup="dialog"
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
                    {(() => {
                        const p = parseYYYYMM(displayValue);
                        return p ? `${MONTHS[p.m]} ${p.y}` : placeholder;
                    })()}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" aria-hidden />
            </button>
            {open && !disabled && triggerWidth != null && (
                <div
                    className="absolute top-full left-0 z-50 mt-1 overflow-hidden rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg"
                    style={{ width: triggerWidth, maxWidth: triggerWidth, boxSizing: 'border-box' }}
                >
                    <div className="min-w-0 overflow-auto p-3" style={{ maxHeight: '260px' }}>
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => setViewYear((y) => y - 1)}
                            className="p-1 rounded hover:bg-[var(--color-grey-1)] text-[var(--color-dark)]"
                            aria-label="Previous year"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-[var(--color-dark)]">{viewYear}</span>
                        <button
                            type="button"
                            onClick={() => setViewYear((y) => y + 1)}
                            className="p-1 rounded hover:bg-[var(--color-grey-1)] text-[var(--color-dark)]"
                            aria-label="Next year"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 min-w-0" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                        {MONTHS.map((name, m) => (
                            <button
                                key={m}
                                type="button"
                                disabled={isDisabled(m)}
                                onClick={() => handleSelect(m)}
                                className={cn(
                                    'py-2 text-sm rounded outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                    parsed && parsed.y === viewYear && parsed.m === m
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]',
                                    isDisabled(m) && 'opacity-40 cursor-not-allowed'
                                )}
                            >
                                {name}
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
