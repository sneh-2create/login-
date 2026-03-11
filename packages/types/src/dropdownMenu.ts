import type { ReactNode } from 'react';

export interface DropdownMenuItem {
    label: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    /** Optional key to prevent duplicate keys */
    key?: string | number;
}

/** Figma 652-5299: icon-triggered dropdown (more actions, 3-dot menu). Items have hover effect. */
export interface DropdownMenuProps {
    /** Trigger: icon button or custom element (e.g. MoreVertical, MoreHorizontal) */
    trigger: ReactNode | ((_open: boolean) => ReactNode);
    /** Menu items: label + onClick. Rendered with hover style. */
    items: DropdownMenuItem[];
    /** Placement relative to trigger. Ignored when autoFlip is true. */
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    /** When true, open above if no space below (dynamic). */
    autoFlip?: boolean;
    /** Open state (controlled) */
    open?: boolean;
    onOpenChange?: (_open: boolean) => void;
    /** Default open (uncontrolled) */
    defaultOpen?: boolean;
    /** Close after item click */
    closeOnSelect?: boolean;
    /** Panel class name */
    className?: string;
    /** Min width of menu (e.g. '8rem') */
    minWidth?: string;
    /** Max width of menu (e.g. '16rem') */
    maxWidth?: string;
    /** When true, renders the menu in a portal (document.body) to escape overflow/clip contexts (e.g. inside tables) */
    usePortal?: boolean;
}
