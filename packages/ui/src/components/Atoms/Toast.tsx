import React from 'react';
import { X } from 'lucide-react';
import { ToastItemProps, ToastVariant } from '@od-erp/types';
import { cn } from '../../utils';
import { NOTIFICATION_TYPE_CONFIG } from '../Config/NotificationTypeConfig';

const TOAST_ICON: Record<ToastVariant, string> = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    permission: 'text-violet-600',
    destructive: 'text-red-600',
    update: 'text-blue-600'
};

const TOAST_ICON_DARK: Record<ToastVariant, string> = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    permission: 'text-violet-400',
    destructive: 'text-red-400',
    update: 'text-blue-400'
};

const TOAST_LEFT_BORDER: Record<ToastVariant, string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
    permission: 'border-l-violet-500',
    destructive: 'border-l-red-500',
    update: 'border-l-blue-500'
};

const TOAST_LEFT_BORDER_DARK: Record<ToastVariant, string> = {
    success: 'border-l-emerald-400',
    error: 'border-l-red-400',
    warning: 'border-l-amber-400',
    info: 'border-l-blue-400',
    permission: 'border-l-violet-400',
    destructive: 'border-l-red-400',
    update: 'border-l-blue-400'
};

const TOAST_LIGHT = 'border-gray-200 bg-white text-gray-900';
const TOAST_DARK = 'border-slate-600 bg-slate-800 text-slate-100';

export const Toast: React.FC<ToastItemProps> = ({
    variant,
    title,
    message,
    onClose,
    dismissible = true,
    appearance = 'light',
    className = '',
    icon: iconOverride
}) => {
    const typeConfig = NOTIFICATION_TYPE_CONFIG[variant];
    const icon = iconOverride ?? typeConfig.icon;
    const showClose = dismissible && typeof onClose === 'function';
    const isDark = appearance === 'dark';
    const iconClass = isDark ? TOAST_ICON_DARK[variant] : TOAST_ICON[variant];
    const leftBorderClass = isDark ? TOAST_LEFT_BORDER_DARK[variant] : TOAST_LEFT_BORDER[variant];

    return (
        <div
            role="status"
            className={cn(
                'inline-flex w-max max-w-full box-border border border-l-4 rounded-md',
                'py-3 px-4 gap-2',
                'transition-shadow duration-200 hover:shadow-md',
                isDark ? TOAST_DARK : TOAST_LIGHT,
                leftBorderClass,
                className
            )}
        >
            <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span
                    className={cn(
                        'flex shrink-0 items-center justify-center opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-default',
                        iconClass
                    )}
                >
                    {icon}
                </span>
                <p className={cn('min-w-0 shrink text-sm font-medium', isDark ? 'text-slate-100' : 'text-gray-900')}>
                    {title && <span>{title}: </span>}
                    {message}
                </p>
                {showClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            'shrink-0 rounded p-1 transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1',
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
