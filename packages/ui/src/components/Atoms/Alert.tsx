import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AlertProps as AlertPropsType, AlertVariant } from '@od-erp/types';
import { cn } from '../../utils';
import { NOTIFICATION_TYPE_CONFIG } from '../config/NotificationTypeConfig';
import type { NotificationVariant } from '../config/NotificationTypeConfig';
import { ALERT_LIGHT_THEME_VAR_NAMES, ALERT_DARK_THEME_VAR_NAMES } from '@od-erp/constants';

type AlertVars = { bg: string; border: string; borderHover: string; text: string; accent?: string };

function getLightVars(variant: AlertVariant): AlertVars | null {
    const v = ALERT_LIGHT_THEME_VAR_NAMES[variant as keyof typeof ALERT_LIGHT_THEME_VAR_NAMES];
    return v ?? null;
}

function getDarkVars(variant: AlertVariant): AlertVars | null {
    const v = ALERT_DARK_THEME_VAR_NAMES[variant as keyof typeof ALERT_DARK_THEME_VAR_NAMES];
    return v ?? null;
}

export const Alert: React.FC<AlertPropsType> = ({
    variant,
    title,
    message,
    onClose,
    dismissible = true,
    appearance = 'light',
    className = '',
    icon: iconOverride
}) => {
    const isDark = appearance === 'dark';
    const vars = isDark ? getDarkVars(variant) : getLightVars(variant);
    const icon = iconOverride ?? NOTIFICATION_TYPE_CONFIG[variant as NotificationVariant].icon;
    const showClose = dismissible;
    const [hover, setHover] = useState(false);

    const handleClose = () => onClose?.();

    const containerStyle: React.CSSProperties = vars
        ? {
              backgroundColor: `var(${vars.bg})`,
              borderColor: hover ? `var(${vars.borderHover})` : `var(${vars.border})`,
              color: `var(${vars.text})`
          }
        : {};

    const iconColor = vars ? (isDark && vars.accent ? `var(${vars.accent})` : `var(${vars.text})`) : undefined;
    const iconStyle: React.CSSProperties = iconColor ? { color: iconColor } : {};

    return (
        <div
            role="alert"
            className={cn(
                'inline-flex w-max max-w-full box-border border border-solid',
                'py-3 px-4 rounded-md gap-2',
                'transition-[border-color,box-shadow,background-color] duration-200 hover:shadow-md',
                isDark && 'hover:opacity-95',
                className
            )}
            style={containerStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span
                    className="flex shrink-0 items-center justify-center transition-transform duration-200 hover:scale-110 opacity-90 hover:opacity-100 cursor-default"
                    style={iconStyle}
                >
                    {icon}
                </span>
                <p className="min-w-0 shrink text-sm font-medium">
                    {title && <span>{title}: </span>}
                    {message}
                </p>
                {showClose && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className={cn(
                            'shrink-0 rounded p-1 transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent',
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                        )}
                        style={iconStyle}
                        aria-label="Dismiss alert"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};
