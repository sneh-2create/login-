import React from 'react';
import type { DateRangePickerProps, DateRangeValue } from '@od-erp/types';
import { cn } from '../../utils';
import { DatePicker } from './DatePicker';

const DEFAULT_VALUE: DateRangeValue = { start: '', end: '' };

/**
 * Date range picker (same theme and layout as DatePicker, TimePicker, YearPicker).
 * Uses two DatePicker atoms for start and end so styling and behavior match exactly.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    value,
    defaultValue = DEFAULT_VALUE,
    onChange,
    label,
    startPlaceholder = 'Start date',
    endPlaceholder = 'End date',
    min,
    max,
    error,
    containerClassName = '',
    id,
    disabled = false,
    ...rest
}) => {
    const controlled = value !== undefined;
    const [internal, setInternal] = React.useState<DateRangeValue>(defaultValue);
    const range = controlled ? value! : internal;
    const pickerId = id ?? `date-range-picker-${Math.random().toString(36).slice(2, 9)}`;

    const handleStartChange = (start: string) => {
        const next = { ...range, start };
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    const handleEndChange = (end: string) => {
        const next = { ...range, end };
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    return (
        <div
            className={cn('relative flex flex-col min-w-0 w-full', containerClassName)}
            {...rest}
        >
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
            <div className="flex flex-wrap items-stretch gap-2 sm:gap-3 min-w-0">
                <div className="flex-1 min-w-0 flex flex-col">
                    <DatePicker
                        id={`${pickerId}-start`}
                        value={range.start}
                        onChange={handleStartChange}
                        placeholder={startPlaceholder}
                        min={min}
                        max={range.end || max}
                        disabled={disabled}
                        containerClassName="w-full"
                    />
                </div>
                <span
                    className={cn(
                        'self-center text-[var(--color-secondary)] text-sm shrink-0',
                        disabled && 'opacity-60'
                    )}
                    aria-hidden
                >
                    –
                </span>
                <div className="flex-1 min-w-0 flex flex-col">
                    <DatePicker
                        id={`${pickerId}-end`}
                        value={range.end}
                        onChange={handleEndChange}
                        placeholder={endPlaceholder}
                        min={range.start || min}
                        max={max}
                        disabled={disabled}
                        containerClassName="w-full"
                    />
                </div>
            </div>
            {error && (
                <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
