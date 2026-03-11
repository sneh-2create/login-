import React, { ReactNode } from 'react';

export interface SelectSingleOption {
    label: ReactNode | string;
    value: string | number;
    disabled?: boolean;
}

/** Figma 659-6670: single-select dropdown (closed and open state). */
export interface SelectSingleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: ReactNode | string;
    options: SelectSingleOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (_value: string | number) => void;
    placeholder?: string;
    error?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
}
