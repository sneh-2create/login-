import React from 'react';

export interface MonthPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (_value: string) => void;
    min?: string;
    max?: string;
    error?: string;
    placeholder?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
}
