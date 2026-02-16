import React from 'react';

export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (_value: string) => void;
    error?: string;
    placeholder?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
    /** 12 or 24 hour format. Default 24. */
    hour12?: boolean;
}
