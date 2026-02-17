// Alert: we only store theme CSS var names here; theme holds the actual colors (light + dark)
import type { NotificationVariantConstant } from './theme.constants';

export const ALERT_LIGHT_THEME_VAR_NAMES: Record<
    NotificationVariantConstant,
    { bg: string; border: string; borderHover: string; text: string }
> = {
    success: {
        bg: '--alert-success-bg',
        border: '--alert-success-border',
        borderHover: '--alert-success-border-hover',
        text: '--alert-success-text'
    },
    error: {
        bg: '--alert-error-bg',
        border: '--alert-error-border',
        borderHover: '--alert-error-border-hover',
        text: '--alert-error-text'
    },
    warning: {
        bg: '--alert-warning-bg',
        border: '--alert-warning-border',
        borderHover: '--alert-warning-border-hover',
        text: '--alert-warning-text'
    },
    info: {
        bg: '--alert-info-bg',
        border: '--alert-info-border',
        borderHover: '--alert-info-border-hover',
        text: '--alert-info-text'
    },
    permission: {
        bg: '--alert-permission-bg',
        border: '--alert-permission-border',
        borderHover: '--alert-permission-border-hover',
        text: '--alert-permission-text'
    },
    destructive: {
        bg: '--alert-destructive-bg',
        border: '--alert-destructive-border',
        borderHover: '--alert-destructive-border-hover',
        text: '--alert-destructive-text'
    },
    update: {
        bg: '--alert-update-bg',
        border: '--alert-update-border',
        borderHover: '--alert-update-border-hover',
        text: '--alert-update-text'
    }
} as const;

export const ALERT_DARK_THEME_VAR_NAMES: Record<
    NotificationVariantConstant,
    { bg: string; border: string; borderHover: string; text: string; accent: string }
> = {
    success: {
        bg: '--alert-dark-success-bg',
        border: '--alert-dark-success-border',
        borderHover: '--alert-dark-success-border-hover',
        text: '--alert-dark-success-text',
        accent: '--alert-dark-success-accent'
    },
    error: {
        bg: '--alert-dark-error-bg',
        border: '--alert-dark-error-border',
        borderHover: '--alert-dark-error-border-hover',
        text: '--alert-dark-error-text',
        accent: '--alert-dark-error-accent'
    },
    warning: {
        bg: '--alert-dark-warning-bg',
        border: '--alert-dark-warning-border',
        borderHover: '--alert-dark-warning-border-hover',
        text: '--alert-dark-warning-text',
        accent: '--alert-dark-warning-accent'
    },
    info: {
        bg: '--alert-dark-info-bg',
        border: '--alert-dark-info-border',
        borderHover: '--alert-dark-info-border-hover',
        text: '--alert-dark-info-text',
        accent: '--alert-dark-info-accent'
    },
    permission: {
        bg: '--alert-dark-permission-bg',
        border: '--alert-dark-permission-border',
        borderHover: '--alert-dark-permission-border-hover',
        text: '--alert-dark-permission-text',
        accent: '--alert-dark-permission-accent'
    },
    destructive: {
        bg: '--alert-dark-destructive-bg',
        border: '--alert-dark-destructive-border',
        borderHover: '--alert-dark-destructive-border-hover',
        text: '--alert-dark-destructive-text',
        accent: '--alert-dark-destructive-accent'
    },
    update: {
        bg: '--alert-dark-update-bg',
        border: '--alert-dark-update-border',
        borderHover: '--alert-dark-update-border-hover',
        text: '--alert-dark-update-text',
        accent: '--alert-dark-update-accent'
    }
} as const;
