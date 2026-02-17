import React from 'react';

export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    label?: string;
    value?: string | Date | null;
    defaultValue?: string | Date | null;
    onChange?: (_date: Date | null) => void;
    min?: string | Date | null;
    max?: string | Date | null;
    minDate?: Date;
    maxDate?: Date;
    error?: string;
    placeholder?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
}
