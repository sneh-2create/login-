import React from 'react';
import '@od-erp/theme/index.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '1rem',
    };

    const variantStyles = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
        },
        secondary: {
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
        },
        danger: {
            backgroundColor: 'var(--color-danger)',
            color: 'var(--color-white)',
        },
    };

    return (
        <button
            style={{ ...baseStyle, ...variantStyles[variant] }}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
};
