import React from 'react';

export type SnackbarPosition = 'bottom-center' | 'bottom-right';

export type SnackbarVariant =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'permission'
    | 'destructive'
    | 'update';

export interface SnackbarAction {
    /** Custom CTA label (e.g. Undo, Retry, View). Pass any string. */
    label: string;
    onClick: () => void;
}

export type SnackbarAppearance = 'light' | 'dark';

export interface SnackbarItemProps {
    variant: SnackbarVariant;
    title?: string;
    /** Message content. Fully customizable - pass any React node or string. */
    message: React.ReactNode;
    onClose?: () => void;
    dismissible?: boolean;
    /** CTA (label + onClick). Uses accent color (same as icon). Fully customizable label and handler. */
    action?: SnackbarAction;
    appearance?: SnackbarAppearance;
    className?: string;
    /** Optional icon override. Pass any React node to replace the default variant icon. */
    icon?: React.ReactNode;
}

export interface SnackbarContainerProps {
    position: SnackbarPosition;
    children: React.ReactNode;
    className?: string;
}
