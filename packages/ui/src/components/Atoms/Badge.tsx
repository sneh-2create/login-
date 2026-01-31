import React from 'react';
import { cn } from '../../utils';
import { BadgeProps } from '@od-erp/types';
import { BADGE_VARIANTS } from '@od-erp/constants';

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    className,
    customBgColor,
    customTextColor,
    width = 'auto',
    children,
    ...props
}) => {
    // Ensure safe access to BADGE_VARIANTS
    const normalizedVariant = (typeof variant === 'string' ? variant.toLowerCase() : variant) as keyof typeof BADGE_VARIANTS;
    const variantStyles = BADGE_VARIANTS[normalizedVariant] || BADGE_VARIANTS.default;

    // Allow custom colors if variant is custom
    const customStyles = variant === 'custom'
        ? `${customBgColor || ''} ${customTextColor || ''}`.trim()
        : '';

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center h-[25px] px-3 py-1.5 rounded-full text-[11px] font-bold leading-[13.3125px] tracking-tight text-center whitespace-nowrap",
                width !== 'auto' ? width : '',
                variantStyles,
                customStyles,
                className
            )}
            style={{ width: width !== 'auto' ? width : undefined }}
            {...props}
        >
            {children}
        </span>
    );
};
