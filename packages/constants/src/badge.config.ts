// Badge variant keys, appearances, and theme CSS var names. Colors live in theme; we only store var names here.

/*
 * Tailwind JIT safelist — classes are dynamically constructed in Badge.tsx, so Tailwind
 * needs to see the full class strings somewhere in a scanned file. DO NOT DELETE.
 *
 * Filled:
 * bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] border-[var(--badge-default-border)] hover:bg-[var(--badge-default-bg-hover)] hover:border-[var(--badge-default-border-hover)]
 * bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)] hover:bg-[var(--badge-success-bg-hover)] hover:border-[var(--badge-success-border-hover)]
 * bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border-[var(--badge-warning-border)] hover:bg-[var(--badge-warning-bg-hover)] hover:border-[var(--badge-warning-border-hover)]
 * bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] border-[var(--badge-error-border)] hover:bg-[var(--badge-error-bg-hover)] hover:border-[var(--badge-error-border-hover)]
 * bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--badge-info-border)] hover:bg-[var(--badge-info-bg-hover)] hover:border-[var(--badge-info-border-hover)]
 *
 * Outline:
 * border-[var(--badge-outline-default-border)] text-[var(--badge-outline-default-text)] hover:bg-[var(--badge-outline-default-hover-bg)]
 * border-[var(--badge-outline-success-border)] text-[var(--badge-outline-success-text)] hover:bg-[var(--badge-outline-success-hover-bg)]
 * border-[var(--badge-outline-warning-border)] text-[var(--badge-outline-warning-text)] hover:bg-[var(--badge-outline-warning-hover-bg)]
 * border-[var(--badge-outline-error-border)] text-[var(--badge-outline-error-text)] hover:bg-[var(--badge-outline-error-hover-bg)]
 * border-[var(--badge-outline-info-border)] text-[var(--badge-outline-info-text)] hover:bg-[var(--badge-outline-info-hover-bg)]
 *
 * Subtle:
 * bg-[var(--badge-subtle-default-bg)] text-[var(--badge-subtle-default-text)] hover:bg-[var(--badge-subtle-default-bg-hover)]
 * bg-[var(--badge-subtle-success-bg)] text-[var(--badge-subtle-success-text)] hover:bg-[var(--badge-subtle-success-bg-hover)]
 * bg-[var(--badge-subtle-warning-bg)] text-[var(--badge-subtle-warning-text)] hover:bg-[var(--badge-subtle-warning-bg-hover)]
 * bg-[var(--badge-subtle-error-bg)] text-[var(--badge-subtle-error-text)] hover:bg-[var(--badge-subtle-error-bg-hover)]
 * bg-[var(--badge-subtle-info-bg)] text-[var(--badge-subtle-info-text)] hover:bg-[var(--badge-subtle-info-bg-hover)]
 *
 * Layout (used in Badge.tsx getBaseClasses):
 * rounded-[var(--badge-radius)] px-[var(--badge-px)] h-[var(--badge-height)] min-w-[var(--badge-min-width)]
 * text-[length:var(--badge-font-size)] font-[var(--badge-font-weight)] tracking-[var(--badge-letter-spacing)]
 */
export const BADGE_VARIANT_KEYS = ['default', 'success', 'warning', 'error', 'info'] as const;
export type BadgeVariantKey = (typeof BADGE_VARIANT_KEYS)[number];

export const BADGE_APPEARANCES = ['filled', 'outline', 'subtle'] as const;
export type BadgeAppearanceKey = (typeof BADGE_APPEARANCES)[number];

// Map API/backend labels to a variant so we reuse the same theme styles (e.g. "pending" -> warning)
export const BADGE_VARIANT_MAP: Record<string, BadgeVariantKey> = {
    default: 'default',
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    pending: 'warning',
    failed: 'error',
    incomplete: 'warning',
    lead: 'info',
    registered: 'info',
    'data requested': 'warning',
    approved: 'success',
    rejected: 'error',
    withdrawn: 'error'
};

// CSS var names for each appearance + variant. Theme defines the actual hex values.
export const BADGE_THEME_VAR_NAMES = {
    filled: {
        default: {
            bg: '--badge-default-bg',
            text: '--badge-default-text',
            border: '--badge-default-border',
            bgHover: '--badge-default-bg-hover',
            borderHover: '--badge-default-border-hover'
        },
        success: {
            bg: '--badge-success-bg',
            text: '--badge-success-text',
            border: '--badge-success-border',
            bgHover: '--badge-success-bg-hover',
            borderHover: '--badge-success-border-hover'
        },
        warning: {
            bg: '--badge-warning-bg',
            text: '--badge-warning-text',
            border: '--badge-warning-border',
            bgHover: '--badge-warning-bg-hover',
            borderHover: '--badge-warning-border-hover'
        },
        error: {
            bg: '--badge-error-bg',
            text: '--badge-error-text',
            border: '--badge-error-border',
            bgHover: '--badge-error-bg-hover',
            borderHover: '--badge-error-border-hover'
        },
        info: {
            bg: '--badge-info-bg',
            text: '--badge-info-text',
            border: '--badge-info-border',
            bgHover: '--badge-info-bg-hover',
            borderHover: '--badge-info-border-hover'
        }
    } as Record<BadgeVariantKey, { bg: string; text: string; border: string; bgHover: string; borderHover: string }>,
    outline: {
        default: {
            border: '--badge-outline-default-border',
            text: '--badge-outline-default-text',
            hoverBg: '--badge-outline-default-hover-bg'
        },
        success: {
            border: '--badge-outline-success-border',
            text: '--badge-outline-success-text',
            hoverBg: '--badge-outline-success-hover-bg'
        },
        warning: {
            border: '--badge-outline-warning-border',
            text: '--badge-outline-warning-text',
            hoverBg: '--badge-outline-warning-hover-bg'
        },
        error: {
            border: '--badge-outline-error-border',
            text: '--badge-outline-error-text',
            hoverBg: '--badge-outline-error-hover-bg'
        },
        info: {
            border: '--badge-outline-info-border',
            text: '--badge-outline-info-text',
            hoverBg: '--badge-outline-info-hover-bg'
        }
    } as Record<BadgeVariantKey, { border: string; text: string; hoverBg: string }>,
    subtle: {
        default: {
            bg: '--badge-subtle-default-bg',
            text: '--badge-subtle-default-text',
            bgHover: '--badge-subtle-default-bg-hover'
        },
        success: {
            bg: '--badge-subtle-success-bg',
            text: '--badge-subtle-success-text',
            bgHover: '--badge-subtle-success-bg-hover'
        },
        warning: {
            bg: '--badge-subtle-warning-bg',
            text: '--badge-subtle-warning-text',
            bgHover: '--badge-subtle-warning-bg-hover'
        },
        error: {
            bg: '--badge-subtle-error-bg',
            text: '--badge-subtle-error-text',
            bgHover: '--badge-subtle-error-bg-hover'
        },
        info: {
            bg: '--badge-subtle-info-bg',
            text: '--badge-subtle-info-text',
            bgHover: '--badge-subtle-info-bg-hover'
        }
    } as Record<BadgeVariantKey, { bg: string; text: string; bgHover: string }>
} as const;

export const BADGE_LAYOUT_VAR_NAMES = {
    height: '--badge-height',
    minWidth: '--badge-min-width',
    fontSize: '--badge-font-size',
    fontWeight: '--badge-font-weight',
    letterSpacing: '--badge-letter-spacing',
    radius: '--badge-radius',
    paddingX: '--badge-px'
} as const;
