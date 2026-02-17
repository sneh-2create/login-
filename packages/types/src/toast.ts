import React from 'react';

export type ToastPosition = 'top-center' | 'top-right';

export type ToastVariant =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'permission'
    | 'destructive'
    | 'update';

export interface ToastAction {
    /** Custom CTA label. Pass any string (e.g. Undo, Retry, View). */
    label: string;
    onClick: () => void;
}

export type ToastAppearance = 'light' | 'dark';

export interface ToastItemProps {
    variant: ToastVariant;
    title?: string;
    /** Message content. Fully customizable - pass any React node or string. */
    message: React.ReactNode;
    onClose?: () => void;
    dismissible?: boolean;
    action?: ToastAction;
    appearance?: ToastAppearance;
    className?: string;
    icon?: React.ReactNode;
}

export interface ToastContainerProps {
    position: ToastPosition;
    children: React.ReactNode;
    className?: string;
}
