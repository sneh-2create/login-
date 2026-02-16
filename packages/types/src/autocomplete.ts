import React from 'react';

export interface AutocompleteOption {
    label: string;
    value: string | number;
}

/** Autocomplete: input + type-to-filter + single select from dropdown. */
export interface AutocompleteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    options: AutocompleteOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (_value: string | number) => void;
    placeholder?: string;
    error?: string;
    containerClassName?: string;
    id?: string;
    disabled?: boolean;
}
