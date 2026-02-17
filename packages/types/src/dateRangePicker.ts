import React from 'react';

export interface DateRangeValue {
    start: string | Date | null;
    end: string | Date | null;
}

export interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    /** Controlled: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } */
    value?: DateRangeValue;
    defaultValue?: DateRangeValue;
    onChange?: (_value: DateRangeValue) => void;
    label?: string;
    startPlaceholder?: string;
    endPlaceholder?: string;
    min?: string | Date | null;
    max?: string | Date | null;
    error?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
}
