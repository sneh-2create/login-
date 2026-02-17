import React from 'react';

export interface TitleProps {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    variant?: 'pageTitle' | 'pageTitleNoMargin' | 'sectionTitle' | 'cardTitle' | 'subtitle' | 'body';
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
    const baseStyles = "font-sans text-[var(--color-foreground)]";

    const variants = {
        pageTitle: "text-2xl font-bold mb-6",
        pageTitleNoMargin: "text-2xl font-bold mb-0",
        sectionTitle: "text-lg font-bold mb-4",
        cardTitle: "text-base font-semibold text-[var(--color-foreground)]",
        subtitle: "text-sm text-[var(--color-muted-foreground)]",
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
