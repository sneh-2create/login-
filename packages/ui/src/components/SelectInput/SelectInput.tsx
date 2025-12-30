import React from 'react';
import { Select, SelectProps } from '../atoms/Select';

export const SelectInput: React.FC<SelectProps> = (props) => {
    return (
        <Select
            {...props}
            className={`h-8 text-xs py-1 ${props.className}`}
        />
    );
};
