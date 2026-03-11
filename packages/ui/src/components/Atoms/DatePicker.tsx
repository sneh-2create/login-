import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DatePickerProps } from '@od-erp/types';
import { cn } from '../../utils';
import { useDropdownPosition } from '../../hooks/useDropdownPosition';

function getWeekdayNames(): string[] {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    return [0, 1, 2, 3, 4, 5, 6].map((d) => formatter.format(new Date(2024, 0, 7 + d)));
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDate(s: string | Date | null | undefined): Date | null {
    if (!s) return null;
    if (s instanceof Date) return Number.isNaN(s.getTime()) ? null : s;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}

function toYYYYMMDD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    defaultValue = '',
    onChange,
    min,
    max,
    minDate: minDateProp,
    maxDate: maxDateProp,
    error,
    placeholder = 'Select date',
    containerClassName = '',
    id,
    disabled = false,
    className,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? defaultValue);
    const controlled = value !== undefined;
    const displayValue = controlled ? value : internalValue;
    const pickerId = id ?? `date-picker-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const { placement, triggerWidth, coords } = useDropdownPosition(triggerRef, open);

    const valueDate = toDate(displayValue);
    const [viewDate, setViewDate] = useState<Date>(() => valueDate ?? new Date());
    const weekdays = React.useMemo(() => getWeekdayNames(), []);
    const minDate = minDateProp ?? toDate(min);
    const maxDate = maxDateProp ?? toDate(max);

    useEffect(() => {
        if (controlled && value !== undefined) setInternalValue(value);
    }, [controlled, value]);

    useEffect(() => {
        if (valueDate) setViewDate(valueDate);
    }, [displayValue]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(e.target as Node);
            const isOutsidePortal = portalRef.current && !portalRef.current.contains(e.target as Node);
            if (isOutsideContainer && (portalRef.current ? isOutsidePortal : true)) {
                setOpen(false);
            }
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

    const [view, setView] = useState<'day' | 'month' | 'year'>('day');

    useEffect(() => {
        if (!open) {
            setView('day'); // Reset view when closed
        }
    }, [open]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const days: (number | null)[] = Array(startPad).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) days.push(null);

    const isDisabled = (day: number) => {
        const d = new Date(year, month, day);
        if (minDate && d < minDate) return true;
        if (maxDate && d > maxDate) return true;
        return false;
    };

    const isMonthDisabled = (m: number) => {
        const firstDay = new Date(year, m, 1);
        const lastDay = new Date(year, m + 1, 0);
        if (minDate && lastDay < minDate) return true;
        if (maxDate && firstDay > maxDate) return true;
        return false;
    };

    const isYearDisabled = (y: number) => {
        const firstDay = new Date(y, 0, 1);
        const lastDay = new Date(y, 11, 31);
        if (minDate && lastDay < minDate) return true;
        if (maxDate && firstDay > maxDate) return true;
        return false;
    };

    const handleSelect = (day: number) => {
        const d = new Date(year, month, day);
        if (!controlled) setInternalValue(d);
        onChange?.(d);
        setOpen(false);
    };

    const handleMonthSelect = (m: number) => {
        setViewDate(new Date(year, m, 1));
        setView('day');
    };

    const handleYearSelect = (y: number) => {
        setViewDate(new Date(y, month, 1));
        setView('month');
    };

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const prevYear = () => setViewDate(new Date(year - 1, month, 1));
    const nextYear = () => setViewDate(new Date(year + 1, month, 1));

    const prevDecade = () => setViewDate(new Date(year - 12, month, 1));
    const nextDecade = () => setViewDate(new Date(year + 12, month, 1));

    const handlePrev = () => {
        if (view === 'day') prevMonth();
        else if (view === 'month') prevYear();
        else prevDecade();
    };

    const handleNext = () => {
        if (view === 'day') nextMonth();
        else if (view === 'month') nextYear();
        else nextDecade();
    };

    // Generate years for year view (current year +/- 6 to show 12 years grid likely)
    // Let's show a grid of 12 years (3x4 or 4x3) for consistent UI size with months (3x4)
    const yearGridStart = year - 6;
    const years = Array.from({ length: 15 }, (_, i) => yearGridStart + i);

    return (
        <div ref={containerRef} className={cn('relative flex flex-col gap-1.5 min-w-0 w-full', containerClassName, className)} {...rest}>
            {label && (
                <label
                    htmlFor={pickerId}
                    className={cn(
                        'block text-sm font-medium text-[var(--color-foreground)]',
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
                    "relative w-full cursor-pointer rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 px-3 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px] flex items-center gap-2 text-[var(--color-foreground)]",
                    disabled && "cursor-not-allowed opacity-50 bg-[var(--color-background)]",
                    error && "border-red-500 focus:ring-red-500",
                    open && "ring-1 ring-primary border-primary",
                    className
                )}
            >
                <Calendar className="w-4 h-4 shrink-0 text-[var(--color-muted-foreground)]" aria-hidden />
                <span className={cn('flex-1 min-w-0 truncate', !displayValue && 'text-[var(--ui-placeholder-color)]')}>
                    {valueDate ? toYYYYMMDD(valueDate) : (typeof displayValue === 'string' ? displayValue : '') || placeholder}
                </span>
                <ChevronDown className={cn("w-4 h-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform", open && "rotate-180")} aria-hidden />
            </button>
            {open && !disabled && triggerWidth != null && coords && createPortal(
                <div
                    ref={portalRef}
                    className={cn(
                        'fixed z-[100002] overflow-hidden rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg',
                        placement === 'bottom' ? 'mt-1' : 'mb-1'
                    )}
                    style={{ 
                        top: placement === 'bottom' ? triggerRef.current?.getBoundingClientRect().bottom : undefined,
                        bottom: placement === 'top' ? (window.innerHeight - (triggerRef.current?.getBoundingClientRect().top || 0)) : undefined,
                        left: triggerRef.current?.getBoundingClientRect().left,
                        width: triggerWidth, 
                        maxWidth: triggerWidth, 
                        boxSizing: 'border-box' 
                    }}
                >
                    <div className="min-w-0 overflow-auto p-3" style={{ maxHeight: '300px' }}>
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="p-1 rounded hover:bg-[var(--color-grey-1)] text-[var(--color-dark)] outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setView(view === 'year' ? 'day' : 'year')}
                            className={cn(
                                "px-1 py-0.5 rounded text-sm font-semibold text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]",
                                view !== 'day' && "bg-[var(--color-grey-1)]"
                            )}
                        >
                            {MONTHS[month]} {year}
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="p-1 rounded hover:bg-[var(--color-grey-1)] text-[var(--color-dark)] outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {view === 'day' && (
                        <>
                            <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-[var(--color-secondary)] mb-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                                {weekdays.map((w) => (
                                    <span key={w} className="min-w-0 overflow-hidden text-ellipsis" title={w}>{w}</span>
                                ))}
                            </div>
                            <div className="grid gap-px min-w-0" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                                {days.map((day, i) =>
                                    day === null ? (
                                        <div key={i} />
                                    ) : (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={isDisabled(day)}
                                            onClick={() => handleSelect(day)}
                                            className={cn(
                                                'py-1.5 text-sm rounded outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                                valueDate &&
                                                    valueDate.getFullYear() === year &&
                                                    valueDate.getMonth() === month &&
                                                    valueDate.getDate() === day
                                                    ? 'bg-[var(--color-primary)] text-white'
                                                    : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]',
                                                isDisabled(day) && 'opacity-40 cursor-not-allowed'
                                            )}
                                        >
                                            {day}
                                        </button>
                                    )
                                )}
                            </div>
                        </>
                    )}

                    {view === 'month' && (
                        <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((m, i) => (
                                <button
                                    key={m}
                                    type="button"
                                    disabled={isMonthDisabled(i)}
                                    onClick={() => handleMonthSelect(i)}
                                    className={cn(
                                        'py-2 text-sm rounded outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                        i === month
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]',
                                        isMonthDisabled(i) && 'opacity-40 cursor-not-allowed'
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}

                    {view === 'year' && (
                        <div className="grid grid-cols-3 gap-2">
                            {years.map((y) => (
                                <button
                                    key={y}
                                    type="button"
                                    disabled={isYearDisabled(y)}
                                    onClick={() => handleYearSelect(y)}
                                    className={cn(
                                        'py-2 text-sm rounded outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                        y === year
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]',
                                        isYearDisabled(y) && 'opacity-40 cursor-not-allowed'
                                    )}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}

                    </div>
                </div>,
                document.body
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
