import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'custom' | string;
    className?: string;
    customBgColor?: string;
    customTextColor?: string;
    width?: string;
}
