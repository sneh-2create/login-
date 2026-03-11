import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    minWidth = '8rem',
    maxWidth,
    usePortal = false
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const controlled = openProp !== undefined;
    const open = controlled ? openProp : internalOpen;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    // Ref to the portal menu element (used for click-outside when portal is active)
    const menuRef = useRef<HTMLDivElement>(null);
    const { placement: dynamicPlacement } = useDropdownPosition(triggerRef, open);

    // Portal position state
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    const setOpen = useCallback(
        (next: boolean) => {
            if (!controlled) setInternalOpen(next);
            onOpenChange?.(next);
        },
        [controlled, onOpenChange]
    );

    // Compute portal position from trigger bounding rect
    useEffect(() => {
        if (!usePortal || !open || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const openAbove = autoFlip && dynamicPlacement === 'top';
        const alignRight = placement.includes('end');

        setMenuStyle({
            position: 'fixed',
            zIndex: 9999,
            ...(openAbove
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 }),
            ...(alignRight
                ? { right: window.innerWidth - rect.right }
                : { left: rect.left })
        });
    }, [open, usePortal, autoFlip, dynamicPlacement, placement]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            // When using portal, also check if click is inside the portal menu
            const insideTrigger = containerRef.current?.contains(target);
            const insideMenu = usePortal && menuRef.current?.contains(target);
            if (!insideTrigger && !insideMenu) {
                setOpen(false);
            }
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
    }, [open, setOpen, usePortal]);

    const menuPlacementClasses = autoFlip
        ? dynamicPlacement === 'top'
            ? (placement.includes('end') ? 'bottom-full right-0 mb-1' : 'bottom-full left-0 mb-1')
            : (placement.includes('end') ? 'top-full right-0 mt-1' : 'top-full left-0 mt-1')
        : PLACEMENT_CLASSES[placement];

    const menuContent = (
        <div
            ref={menuRef}
            role="menu"
            className={cn(
                'py-1 overflow-hidden rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg',
                !usePortal && 'absolute z-50',
                !usePortal && menuPlacementClasses,
                className
            )}
            style={{ minWidth, maxWidth, ...(usePortal ? menuStyle : {}) }}
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
    );

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
                usePortal
                    ? createPortal(menuContent, document.body)
                    : menuContent
            )}
        </div>
    );
};
