import React from 'react';
import { cn } from '../../utils';
import type { BadgeProps } from '@od-erp/types';
import {
    BADGE_APPEARANCES,
    BADGE_VARIANT_MAP,
    BADGE_THEME_VAR_NAMES,
    type BadgeVariantKey,
    type BadgeAppearanceKey
} from '@od-erp/constants';

const getBaseClasses = () =>
    [
        'inline-flex items-center justify-center rounded-[var(--badge-radius)] px-[var(--badge-px)] py-0',
        'text-center whitespace-nowrap transition-[background-color,border-color,box-shadow,opacity] duration-150 cursor-default',
        'h-[var(--badge-height)] min-w-[var(--badge-min-width)] w-auto max-w-full',
        'text-[length:var(--badge-font-size)] font-[var(--badge-font-weight)] tracking-[var(--badge-letter-spacing)]',
        'capitalize hover:shadow-sm border border-transparent'
    ].join(' ');

function getNormalizedVariant(variant: BadgeProps['variant']): BadgeVariantKey {
    if (typeof variant !== 'string') return 'default';
    const key = variant.toLowerCase().trim();
    return BADGE_VARIANT_MAP[key] ?? 'default';
}

function getNormalizedAppearance(appearance: BadgeProps['appearance']): BadgeAppearanceKey {
    const a = appearance ?? 'filled';
    return BADGE_APPEARANCES.includes(a as BadgeAppearanceKey) ? (a as BadgeAppearanceKey) : 'filled';
}

function getStyleClassesFromConstants(
    variant: BadgeProps['variant'],
    appearance: BadgeProps['appearance']
): string {
    const v = getNormalizedVariant(variant);
    const a = getNormalizedAppearance(appearance);
    const vars = BADGE_THEME_VAR_NAMES[a][v];

    if (a === 'filled' && 'border' in vars && 'bgHover' in vars && 'borderHover' in vars) {
        const f = vars as { bg: string; text: string; border: string; bgHover: string; borderHover: string };
        return `bg-[var(${f.bg})] text-[var(${f.text})] border-[var(${f.border})] hover:bg-[var(${f.bgHover})] hover:border-[var(${f.borderHover})]`;
    }
    if (a === 'outline' && 'hoverBg' in vars) {
        const o = vars as { border: string; text: string; hoverBg: string };
        return `border border-[var(${o.border})] bg-transparent text-[var(${o.text})] hover:bg-[var(${o.hoverBg})]`;
    }
    if (a === 'subtle' && 'bgHover' in vars) {
        const s = vars as { bg: string; text: string; bgHover: string };
        return `bg-[var(${s.bg})] text-[var(${s.text})] hover:bg-[var(${s.bgHover})]`;
    }
    return '';
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    appearance = 'filled',
    className,
    customBgColor,
    customTextColor,
    width = 'auto',
    children,
    style,
    ...props
}) => {
    const isCustom = variant === 'custom';
    const styleClasses = isCustom ? '' : getStyleClassesFromConstants(variant, appearance);

    const customStyle =
        isCustom && (customBgColor || customTextColor)
            ? {
                  ...style,
                  backgroundColor: customBgColor ?? undefined,
                  color: customTextColor ?? undefined
              }
            : style;

    return (
        <span
            className={cn(
                getBaseClasses(),
                !isCustom && styleClasses,
                isCustom && (customBgColor || customTextColor) && 'hover:opacity-90',
                className
            )}
            style={{
                ...customStyle,
                width: width !== 'auto' ? width : undefined
            }}
            {...props}
        >
            {children}
        </span>
    );
};
