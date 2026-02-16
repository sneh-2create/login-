import React, { useRef, useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DateTimePickerProps } from '@od-erp/types';
import { cn } from '../../utils';

function getWeekdayNames(): string[] {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    return [0, 1, 2, 3, 4, 5, 6].map((d) => formatter.format(new Date(2024, 0, 7 + d)));
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number) {
    return String(n).padStart(2, '0');
}

/** Parse "YYYY-MM-DDTHH:mm" to { date, hour, minute } or null */
function parseDateTime(s: string | undefined): { y: number; m: number; d: number; h: number; min: number } | null {
    if (!s) return null;
    const [datePart, timePart] = s.split('T');
    if (!datePart) return null;
    const date = new Date(datePart);
    if (Number.isNaN(date.getTime())) return null;
    let h = 0,
        min = 0;
    if (timePart) {
        const [hh, mm] = timePart.split(':').map(Number);
        if (!Number.isNaN(hh)) h = Math.max(0, Math.min(23, hh));
        if (!Number.isNaN(mm)) min = Math.max(0, Math.min(59, mm));
    }
    return {
        y: date.getFullYear(),
        m: date.getMonth(),
        d: date.getDate(),
        h,
        min
    };
}

function toDateTimeString(y: number, m: number, d: number, h: number, min: number): string {
    const datePart = `${y}-${pad(m + 1)}-${pad(d)}`;
    const timePart = `${pad(h)}:${pad(min)}`;
    return `${datePart}T${timePart}`;
}

function formatDisplay(value: string | undefined): string {
    const p = parseDateTime(value);
    if (!p) return '';
    return `${pad(p.d)}/${pad(p.m + 1)}/${p.y} ${pad(p.h)}:${pad(p.min)}`;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    label,
    value,
    defaultValue = '',
    onChange,
    min,
    max,
    error,
    placeholder = 'Select date and time',
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
    const pickerId = id ?? `date-time-picker-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

    const parsed = parseDateTime(displayValue);
    const [viewDate, setViewDate] = useState<Date>(() => {
        if (parsed) return new Date(parsed.y, parsed.m, parsed.d);
        return new Date();
    });
    const [selectedDate, setSelectedDate] = useState<{ y: number; m: number; d: number } | null>(() =>
        parsed ? { y: parsed.y, m: parsed.m, d: parsed.d } : null
    );
    const [hourNum, setHourNum] = useState(parsed?.h ?? 0);
    const [minNum, setMinNum] = useState(parsed?.min ?? 0);

    const weekdays = React.useMemo(() => getWeekdayNames(), []);
    let minDate: Date | null = min ? new Date(min) : null;
    let maxDate: Date | null = max ? new Date(max) : null;
    if (minDate && Number.isNaN(minDate.getTime())) minDate = null;
    if (maxDate && Number.isNaN(maxDate.getTime())) maxDate = null;

    useEffect(() => {
        if (controlled && value !== undefined) setInternalValue(value);
    }, [controlled, value]);

    useEffect(() => {
        if (parsed) {
            setViewDate(new Date(parsed.y, parsed.m, parsed.d));
            setSelectedDate({ y: parsed.y, m: parsed.m, d: parsed.d });
            setHourNum(parsed.h);
            setMinNum(parsed.min);
        }
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

    const handleSelectDay = (day: number) => {
        const nextDate = { y: year, m: month, d: day };
        setSelectedDate(nextDate);
        setViewDate(new Date(year, month, day));
    };

    const handleSelectTime = (h: number, min: number) => {
        const y = selectedDate?.y ?? year;
        const m = selectedDate?.m ?? month;
        const d = selectedDate?.d ?? 1;
        const next = toDateTimeString(y, m, d, h, min);
        if (!controlled) setInternalValue(next);
        onChange?.(next);
        setOpen(false);
    };

    const applyTime = () => {
        const y = selectedDate?.y ?? year;
        const m = selectedDate?.m ?? month;
        const d = selectedDate?.d ?? 1;
        const next = toDateTimeString(y, m, d, hourNum, minNum);
        if (!controlled) setInternalValue(next);
        onChange?.(next);
        setOpen(false);
    };

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const width = triggerWidth != null ? Math.max(triggerWidth, 280) : 280;

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
                    'flex items-center gap-1.5 sm:gap-2 w-full min-w-0 min-w-[14rem] sm:min-w-[16rem] box-border border pl-2 sm:pl-2.5 pr-2 py-1.5 sm:py-2 text-[var(--font-size-sm)]',
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
                    {formatDisplay(displayValue) || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--color-secondary)]" aria-hidden />
            </button>
            {open && !disabled && (
                <div
                    className="absolute top-full left-0 z-50 mt-1 overflow-hidden rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg"
                    style={{ width, minWidth: width, boxSizing: 'border-box' }}
                >
                    <div className="min-w-0 overflow-auto p-3" style={{ maxHeight: '360px' }}>
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1 rounded hover:bg-[var(--color-grey-1)] text-[var(--color-dark)] outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-[var(--color-dark)]">
                                {MONTHS[month]} {year}
                            </span>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1 rounded hover:bg-[var(--color-grey-1)] text-[var(--color-dark)] outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40"
                                aria-label="Next month"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-[var(--color-secondary)] mb-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                            {weekdays.map((w) => (
                                <span key={w} className="min-w-0 overflow-hidden text-ellipsis" title={w}>{w}</span>
                            ))}
                        </div>
                        <div className="grid gap-px min-w-0 mb-3" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                            {days.map((day, i) =>
                                day === null ? (
                                    <div key={i} />
                                ) : (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={isDisabled(day)}
                                        onClick={() => handleSelectDay(day)}
                                        className={cn(
                                            'py-1.5 text-sm rounded outline-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                            selectedDate &&
                                                selectedDate.y === year &&
                                                selectedDate.m === month &&
                                                selectedDate.d === day
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
                        <div className="border-t border-[var(--border-color)] pt-2">
                            <div className="text-xs font-medium text-[var(--color-secondary)] mb-1">Time</div>
                            <div className="flex max-h-[160px] overflow-auto">
                                <div className="flex-1 overflow-y-auto px-1">
                                    {hours.map((hour) => (
                                        <button
                                            key={hour}
                                            type="button"
                                            onClick={() => handleSelectTime(hour, minNum)}
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
                                            onClick={() => handleSelectTime(hourNum, minute)}
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
                            <button
                                type="button"
                                onClick={applyTime}
                                className="mt-2 w-full py-1.5 text-sm font-medium rounded-[var(--border-radius-md)] bg-[var(--color-primary)] text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40"
                            >
                                Apply
                            </button>
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
