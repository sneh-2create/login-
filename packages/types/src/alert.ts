import React from 'react';

export type AlertVariant =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'permission'
    | 'destructive'
    | 'update';

export type AlertAppearance = 'light' | 'dark';

export interface AlertProps {
    variant: AlertVariant;
    title?: string;
    message: React.ReactNode;
    onClose?: () => void;
    dismissible?: boolean;
    appearance?: AlertAppearance;
    className?: string;
    icon?: React.ReactNode;
}
