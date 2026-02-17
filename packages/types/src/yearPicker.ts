import React from 'react';

export interface YearPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (_value: string) => void;
    min?: number;
    max?: number;
    error?: string;
    placeholder?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
    /** Number of years to show in the list. Default 12. */
    yearRange?: number;
}
