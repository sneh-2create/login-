import React from 'react';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
    /** Tooltip content (string or React node). If omitted, uses the trigger's aria-label (e.g. icon button name). */
    content?: React.ReactNode;
    /** By default tooltip follows theme: light mode = black tooltip, dark mode = white tooltip (ancestor with .dark). Set to 'light' or 'dark' to override. */
    appearance?: 'light' | 'dark';
    /** Position relative to trigger. Use 'auto' to pick placement by available space. Default: auto */
    placement?: TooltipPlacement | 'auto';
    /** Optional delay before showing (ms) */
    delayShow?: number;
    /** Optional delay before hiding (ms) */
    delayHide?: number;
    /** Trigger element */
    children: React.ReactNode;
    /** Optional class for the trigger wrapper */
    className?: string;
    /** Optional class for the tooltip bubble */
    tooltipClassName?: string;
    /** Disable tooltip */
    disabled?: boolean;
}
