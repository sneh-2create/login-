import React from 'react';

/** Figma 659-6591: switch (toggle). */
export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (_checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    containerClassName?: string;
}
