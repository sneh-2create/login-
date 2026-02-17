import React from 'react';

export interface NumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    /** Show success state (green border + helper). Use when value is valid. */
    success?: boolean;
    helperText?: string;
    containerClassName?: string;
    required?: boolean;
}
