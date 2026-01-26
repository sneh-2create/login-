import React from 'react';

export interface TitleProps {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    variant?: 'pageTitle' | 'sectionTitle' | 'cardTitle' | 'subtitle' | 'body';
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    color?: string;
}

export const Title: React.FC<TitleProps> = ({
    as: Component = 'h1',
    variant = 'pageTitle',
    children,
    className = '',
    style = {},
    color
}) => {
    const baseStyles = "font-sans text-gray-800";

    const variants = {
        pageTitle: "text-2xl font-bold mb-6",
        sectionTitle: "text-lg font-bold mb-4",
        cardTitle: "text-base font-semibold text-gray-700",
        subtitle: "text-sm text-gray-500",
        body: "text-base"
    };

    const finalStyle = color ? { ...style, color } : style;

    return (
        <Component
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={finalStyle}
        >
            {children}
        </Component>
    );
};
