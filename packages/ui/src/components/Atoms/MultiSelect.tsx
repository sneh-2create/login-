import React from 'react';
import { Dropdown } from './Dropdown';
import type { MultiSelectProps } from '@od-erp/types';

/**
 * MultiSelect component - now a wrapper around the unified Dropdown component.
 * Preserves the "text summary" display mode and auto-positioning.
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
    value,
    defaultValue,
    onChange,
    ...rest
}) => {
    // Determine if the component is controlled
    const isControlled = value !== undefined;
    
    // Internal state for uncontrolled usage
    const [internalValue, setInternalValue] = React.useState<(string | number)[]>(
        value ?? defaultValue ?? []
    );

    const finalValue = isControlled ? value : internalValue;

    const handleChange = (newValue: string | number | (string | number)[]) => {
        const arrayVal = Array.isArray(newValue) ? newValue : [newValue];
        if (!isControlled) {
            setInternalValue(arrayVal);
        }
        onChange?.(arrayVal);
    };

    return (
        <Dropdown
            {...rest}
            value={finalValue}
            onChange={handleChange}
            multiple={true}
            displayMode="text"
            usePortal={true}
        />
    );
};
