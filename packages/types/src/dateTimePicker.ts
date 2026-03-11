import React from 'react';

/** Value format: "YYYY-MM-DDTHH:mm" (local date + time, 24h) */
export interface DateTimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
    hour12?: boolean;
}
