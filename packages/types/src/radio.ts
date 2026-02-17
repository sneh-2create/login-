import React from 'react';

/** Figma 659-6583: radio. */
export interface RadioOption {
    label: React.ReactNode;
    value: string | number;
}

export interface RadioProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    name: string;
    options: RadioOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (_value: string | number) => void;
    disabled?: boolean;
    containerClassName?: string;
}
