import React from 'react';
import { Loader2 } from 'lucide-react';
import { ButtonProps } from '@od-erp/types';

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]",
        secondary: "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)] focus:ring-[var(--color-muted-foreground)]",
        outline: "border border-[var(--color-primary)] bg-transparent hover:bg-[var(--color-muted)] text-[var(--color-foreground)]",
        ghost: "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] text-[var(--color-muted-foreground)]",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        'outline-muted': "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-muted)] text-[var(--color-foreground)] shadow-none",
        'soft-primary': "border border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary),transparent_95%)] text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)]",
        'soft-danger': "border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 focus:ring-red-500",
    };

    const sizes: Record<string, string> = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
};
