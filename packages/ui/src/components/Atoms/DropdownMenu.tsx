import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DropdownMenuProps } from '@od-erp/types';
import { cn } from '../../utils';
import { useDropdownPosition } from '../../hooks/useDropdownPosition';

const PLACEMENT_CLASSES = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1'
};

/** Figma 652-5299: icon-triggered dropdown (more actions, 3-dot menu). Items have hover effect. Opens above when no space below if autoFlip. */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    trigger,
    items,
    placement = 'bottom-end',
    autoFlip = true,
    open: openProp,
    onOpenChange,
    defaultOpen = false,
    closeOnSelect = true,
    className = '',
    minWidth = '8rem'
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const controlled = openProp !== undefined;
    const open = controlled ? openProp : internalOpen;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const { placement: dynamicPlacement } = useDropdownPosition(triggerRef, open);

    const setOpen = useCallback(
        (next: boolean) => {
            if (!controlled) setInternalOpen(next);
            onOpenChange?.(next);
        },
        [controlled, onOpenChange]
    );

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, setOpen]);

    const menuPlacementClasses = autoFlip
        ? dynamicPlacement === 'top'
            ? (placement.includes('end') ? 'bottom-full right-0 mb-1' : 'bottom-full left-0 mb-1')
            : (placement.includes('end') ? 'top-full right-0 mt-1' : 'top-full left-0 mt-1')
        : PLACEMENT_CLASSES[placement];

    return (
        <div ref={containerRef} className="relative inline-block">
            {typeof trigger === 'function' ? (
                <div ref={triggerRef} onClick={() => setOpen(!open)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}>
                    {trigger(open)}
                </div>
            ) : (
                <div ref={triggerRef} onClick={() => setOpen(!open)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}>
                    {trigger}
                </div>
            )}
            {open && (
                <div
                    role="menu"
                    className={cn(
                        'absolute z-50 py-1 overflow-hidden rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg',
                        menuPlacementClasses,
                        className
                    )}
                    style={{ minWidth }}
                >
                    {items.map((item, index) => (
                        <button
                            key={item.key ?? index}
                            type="button"
                            role="menuitem"
                            disabled={item.disabled}
                            onClick={() => {
                                item.onClick?.();
                                if (closeOnSelect) setOpen(false);
                            }}
                            className={cn(
                                'w-full px-3 py-2 text-left text-sm text-[var(--color-dark)] transition-colors',
                                'hover:bg-[var(--color-grey-1)]',
                                'focus:outline-none focus-visible:bg-[var(--color-grey-1)]',
                                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
