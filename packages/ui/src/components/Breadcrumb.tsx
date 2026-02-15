import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    showHomeIcon?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    className = '',
    showHomeIcon = true
}) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className={cn("flex items-center gap-2 text-sm", className)} aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isFirst = index === 0;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {/* Separator */}
                            {!isFirst && (
                                <ChevronRight
                                    className="w-4 h-4 text-[var(--color-muted-foreground)]"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Breadcrumb Item */}
                            {item.href && !isLast ? (
                                <Link
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors",
                                        "text-[var(--color-muted-foreground)] font-medium"
                                    )}
                                >
                                    {isFirst && showHomeIcon && !item.icon && (
                                        <Home className="w-4 h-4" />
                                    )}
                                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        "flex items-center gap-1.5",
                                        isLast
                                            ? "text-[var(--color-primary)] font-semibold"
                                            : "text-[var(--color-muted-foreground)] font-medium"
                                    )}
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {isFirst && showHomeIcon && !item.icon && (
                                        <Home className="w-4 h-4" />
                                    )}
                                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
