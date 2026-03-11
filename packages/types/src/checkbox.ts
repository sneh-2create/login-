import React from 'react';

/** Figma 659-6578: checkbox. */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: React.ReactNode;
    onChange?: (_checked: boolean) => void;
    containerClassName?: string;
    /** Wrapper class (label + box) */
    className?: string;
}
