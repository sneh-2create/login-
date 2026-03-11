import React from 'react';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    ShieldAlert,
    Trash2,
    RefreshCcw
} from 'lucide-react';

// Variant → icon for Alert/Toast/Snackbar; change here to update everywhere
export type NotificationVariant =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'permission'
    | 'destructive'
    | 'update';

/** Default icon size for Toast/Snackbar. Alert can wrap in a larger container if needed. */
const iconClassName = 'h-4 w-4 shrink-0';

export const NOTIFICATION_TYPE_CONFIG: Record<
    NotificationVariant,
    { icon: React.ReactNode; iconClassName?: string }
> = {
    success: {
        icon: <CheckCircle2 className={iconClassName} aria-hidden />
    },
    error: {
        icon: <XCircle className={iconClassName} aria-hidden />
    },
    warning: {
        icon: <AlertTriangle className={iconClassName} aria-hidden />
    },
    info: {
        icon: <Info className={iconClassName} aria-hidden />
    },
    permission: {
        icon: <ShieldAlert className={iconClassName} aria-hidden />
    },
    destructive: {
        icon: <Trash2 className={iconClassName} aria-hidden />
    },
    update: {
        icon: <RefreshCcw className={iconClassName} aria-hidden />
    }
};
