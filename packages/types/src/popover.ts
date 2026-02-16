import type { ReactNode } from 'react';

/** Figma 652-4256: default popover. Figma 666-410: card-style popover. */
export type PopoverVariant = 'default' | 'card';

export interface PopoverProps {
    /** Trigger element (e.g. button). Receives open state and toggle. */
    trigger: ReactNode | ((_open: boolean, _toggle: () => void) => ReactNode);
    /** Popover panel content (dynamic from backend). */
    children: ReactNode;
    /** Optional title (dynamic from backend). */
    title?: ReactNode;
    /** Variant: default (Figma 652-4256) or card (Figma 666-410). */
    variant?: PopoverVariant;
    /** Open state (controlled). If undefined, component is uncontrolled. */
    open?: boolean;
    /** Called when open state changes (for controlled) */
    onOpenChange?: (_open: boolean) => void;
    /** Default open (uncontrolled) */
    defaultOpen?: boolean;
    /** Placement relative to trigger */
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    /** Panel width (e.g. "w-64") */
    width?: string;
    /** Show arrow pointing to trigger (default variant only) */
    showArrow?: boolean;
    /** Panel class name */
    className?: string;
    /** Trigger wrapper class name */
    triggerClassName?: string;
    /** Close on click outside */
    closeOnClickOutside?: boolean;
    /** Close on Escape */
    closeOnEscape?: boolean;
}
