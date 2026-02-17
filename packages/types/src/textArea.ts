import React from 'react';

/** Figma 743-148: text area. All content and options from props (e.g. backend). */
export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    label?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (_value: string) => void;
    placeholder?: string;
    error?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
    /** Number of visible rows (min height). */
    rows?: number;
}
