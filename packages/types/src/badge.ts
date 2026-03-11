import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom' | string;
export type BadgeAppearance = 'filled' | 'outline' | 'subtle';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    appearance?: BadgeAppearance;
    className?: string;
    /** Only when variant="custom" */
    customBgColor?: string;
    customTextColor?: string;
    width?: string;
}
