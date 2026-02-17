import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    onClick,
    ...rest
}) => {
    return (
        <div
            className={`bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden ${noPadding ? '' : 'p-6'} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            {...rest}
        >
            {children}
        </div>
    );
};
