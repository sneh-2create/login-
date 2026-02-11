import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoginButtonProps } from '@od-erp/types';

export const LoginButton: React.FC<LoginButtonProps> = ({
    variant = 'primary',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles =
        'h-[52px] w-full rounded-[12px] text-[16px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2';
    const variantStyles = {
        primary:
            "bg-[var(--login-primary)] text-white shadow-[0px_4px_6px_var(--login-primary-shadow),0px_10px_15px_var(--login-primary-shadow)] hover:bg-[var(--login-primary-hover)] focus:ring-[var(--login-primary)]/20",
        secondary:
            'bg-[var(--login-bg-gray)] text-[var(--ui-gray-700)] hover:bg-[var(--ui-gray-200)] focus:ring-[var(--login-text-muted)]/20'
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className} disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="animate-spin" /> : children}
        </button>
    );
};
