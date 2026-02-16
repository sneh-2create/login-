import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PopoverProps } from '@od-erp/types';
import { cn } from '../../utils';

type Placement = 'top' | 'bottom' | 'left' | 'right';

const PLACEMENT_STYLES: Record<Placement, { panel: string; arrow: string; arrowBorder: string }> = {
    top: { panel: 'bottom-full left-1/2 -translate-x-1/2 mb-2', arrow: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full', arrowBorder: 'border-t-[var(--popover-bg)] border-x-transparent border-b-transparent' },
    bottom: { panel: 'top-full left-1/2 -translate-x-1/2 mt-2', arrow: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full', arrowBorder: 'border-b-[var(--popover-bg)] border-x-transparent border-t-transparent' },
    left: { panel: 'right-full top-1/2 -translate-y-1/2 mr-2', arrow: 'right-0 top-1/2 translate-x-full -translate-y-1/2', arrowBorder: 'border-l-[var(--popover-bg)] border-y-transparent border-r-transparent' },
    right: { panel: 'left-full top-1/2 -translate-y-1/2 ml-2', arrow: 'left-0 top-1/2 -translate-x-full -translate-y-1/2', arrowBorder: 'border-r-[var(--popover-bg)] border-y-transparent border-l-transparent' }
};

export const Popover: React.FC<PopoverProps> = ({
    trigger,
    children,
    title,
    variant = 'default',
    open: openProp,
    onOpenChange,
    defaultOpen = false,
    placement = 'bottom',
    width = 'w-64',
    showArrow = true,
    className = '',
    triggerClassName = '',
    closeOnClickOutside = true,
    closeOnEscape = true
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const controlled = openProp !== undefined;
    const open = controlled ? openProp : internalOpen;
    const containerRef = useRef<HTMLDivElement>(null);

    const setOpen = useCallback(
        (next: boolean) => {
            if (!controlled) setInternalOpen(next);
            onOpenChange?.(next);
        },
        [controlled, onOpenChange]
    );

    const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

    useEffect(() => {
        if (!open) return;
        if (!closeOnEscape) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, setOpen]);

    useEffect(() => {
        if (!open || !closeOnClickOutside) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, closeOnClickOutside, setOpen]);

    const resolvedPlacement: Placement = placement === 'auto' ? 'bottom' : placement;
    const styles = PLACEMENT_STYLES[resolvedPlacement];

    return (
        <div ref={containerRef} className={cn('relative inline-block', triggerClassName)}>
            {typeof trigger === 'function' ? trigger(open, toggle) : (
                <div onClick={(e) => { e.stopPropagation(); toggle(); }} role="presentation">
                    {trigger}
                </div>
            )}
            {open && (
                <div
                    role="tooltip"
                    className={cn(
                        'absolute z-[100] inline-block text-sm transition-opacity duration-300',
                        'bg-[var(--popover-bg)] border border-[var(--popover-border)] text-[var(--popover-text)]',
                        'rounded-[var(--popover-radius)] shadow-[var(--popover-shadow)]',
                        'max-w-[min(100vw-2rem,16rem)] sm:max-w-none',
                        width,
                        styles.panel,
                        variant === 'card' && 'p-0 overflow-hidden rounded-[var(--border-radius-lg)] shadow-lg',
                        className
                    )}
                >
                    {title != null && (
                        <div
                            className={cn(
                                'px-3 py-2 border-b border-[var(--popover-border)] bg-[var(--popover-header-bg)]',
                                variant === 'default' && 'rounded-t-[var(--popover-radius)]',
                                variant === 'card' && 'rounded-t-[var(--border-radius-lg)] px-4 py-3'
                            )}
                        >
                            <h3 className="font-medium text-[var(--popover-heading)]">{title}</h3>
                        </div>
                    )}
                    <div className={cn('px-3 py-2', variant === 'card' && 'px-4 py-3')}>{children}</div>
                    {variant === 'default' && showArrow && (
                        <div
                            className={cn('absolute w-0 h-0 border-[6px] border-transparent', styles.arrow, styles.arrowBorder)}
                            aria-hidden
                        />
                    )}
                </div>
            )}
        </div>
    );
};
