import React from 'react';

export interface MultiSelectOption {
    label: string;
    value: string | number;
}

/** Figma 659-6671: multi-select dropdown (closed and open state). */
export interface MultiSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value' | 'defaultValue'> {
    label?: string;
    options: MultiSelectOption[];
    value?: (string | number)[];
    defaultValue?: (string | number)[];
    onChange?: (_value: (string | number)[]) => void;
    placeholder?: string;
    error?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
    usePortal?: boolean;
}
