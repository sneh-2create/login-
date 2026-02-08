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
    ...props
}) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${noPadding ? '' : 'p-6'} ${className} ${props.onClick ? 'cursor-pointer' : ''}`}
            {...props}
        >
            {children}
        </div>
    );
};
