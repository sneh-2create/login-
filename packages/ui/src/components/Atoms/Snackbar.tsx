import React from 'react';
import { X } from 'lucide-react';
import { SnackbarItemProps, SnackbarVariant } from '@od-erp/types';
import { cn } from '../../utils';
import { NOTIFICATION_TYPE_CONFIG } from '../Config/NotificationTypeConfig';

const SNACKBAR_ICON_CTA: Record<SnackbarVariant, string> = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    permission: 'text-violet-600',
    destructive: 'text-red-600',
    update: 'text-blue-600'
};

const SNACKBAR_ICON_CTA_DARK: Record<SnackbarVariant, string> = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    permission: 'text-violet-400',
    destructive: 'text-red-400',
    update: 'text-blue-400'
};

const SNACKBAR_LIGHT: Record<SnackbarVariant, string> = {
    success: 'border-gray-200 bg-white text-gray-900',
    error: 'border-gray-200 bg-white text-gray-900',
    warning: 'border-gray-200 bg-white text-gray-900',
    info: 'border-gray-200 bg-white text-gray-900',
    permission: 'border-gray-200 bg-white text-gray-900',
    destructive: 'border-gray-200 bg-white text-gray-900',
    update: 'border-gray-200 bg-white text-gray-900'
};

/** Dark mode: variant-specific background shades (like light mode per variant). */
const SNACKBAR_DARK_BG: Record<SnackbarVariant, string> = {
    success: 'bg-emerald-950/90 border-emerald-800/80',
    error: 'bg-red-950/90 border-red-800/80',
    warning: 'bg-amber-950/90 border-amber-800/80',
    info: 'bg-blue-950/90 border-blue-800/80',
    permission: 'bg-violet-950/90 border-violet-800/80',
    destructive: 'bg-red-950/90 border-red-800/80',
    update: 'bg-blue-950/90 border-blue-800/80'
};

const SNACKBAR_DARK_TEXT = 'text-slate-100';

const SNACKBAR_HOVER_BORDER: Record<SnackbarVariant, string> = {
    success: 'hover:border-emerald-500',
    error: 'hover:border-red-500',
    warning: 'hover:border-amber-500',
    info: 'hover:border-blue-500',
    permission: 'hover:border-violet-500',
    destructive: 'hover:border-red-500',
    update: 'hover:border-blue-500'
};

/** Dark mode: hover border = icon/CTA color (same idea as light). */
const SNACKBAR_HOVER_BORDER_DARK: Record<SnackbarVariant, string> = {
    success: 'hover:border-emerald-400',
    error: 'hover:border-red-400',
    warning: 'hover:border-amber-400',
    info: 'hover:border-blue-400',
    permission: 'hover:border-violet-400',
    destructive: 'hover:border-red-400',
    update: 'hover:border-blue-400'
};

export const Snackbar: React.FC<SnackbarItemProps> = ({
    variant,
    title,
    message,
    onClose,
    dismissible = true,
    action,
    appearance = 'light',
    className = '',
    icon: iconOverride
}) => {
    const typeConfig = NOTIFICATION_TYPE_CONFIG[variant];
    const icon = iconOverride ?? typeConfig.icon;
    const showClose = dismissible && typeof onClose === 'function';
    const isDark = appearance === 'dark';
    const iconCtaClass = isDark ? SNACKBAR_ICON_CTA_DARK[variant] : SNACKBAR_ICON_CTA[variant];

    return (
        <div
            role="status"
            className={cn(
                'inline-flex w-max max-w-full box-border border rounded-md',
                'p-4 transition-shadow duration-200 hover:shadow-md',
                'transition-[border-color] duration-200',
                isDark ? cn(SNACKBAR_DARK_BG[variant], SNACKBAR_DARK_TEXT) : SNACKBAR_LIGHT[variant],
                isDark ? SNACKBAR_HOVER_BORDER_DARK[variant] : SNACKBAR_HOVER_BORDER[variant],
                className
            )}
        >
            <div className="flex flex-nowrap items-center gap-3">
                <span
                    className={cn(
                        'flex shrink-0 items-center justify-center opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-default',
                        iconCtaClass
                    )}
                >
                    {icon}
                </span>
                <p className={cn('min-w-0 shrink text-sm font-medium', isDark ? 'text-slate-100' : 'text-gray-900')}>
                    {title && <span>{title}: </span>}
                    {message}
                </p>
                {action && (
                    <button
                        type="button"
                        onClick={action.onClick}
                        className={cn(
                            'ml-auto shrink-0 rounded px-1 py-0.5 text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1',
                            iconCtaClass
                        )}
                    >
                        {action.label}
                    </button>
                )}
                {showClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            'shrink-0 rounded p-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:scale-110',
                            isDark ? 'text-slate-100 hover:bg-white/10' : 'text-gray-900 hover:bg-black/10'
                        )}
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};
