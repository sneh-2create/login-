import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    onClick
}) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${noPadding ? '' : 'p-6'} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
