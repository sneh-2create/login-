import React, { useState, useRef, useCallback } from 'react';
import { TooltipProps as TooltipPropsType, TooltipPlacement } from '@od-erp/types';
import { cn } from '../../utils';

const PLACEMENT_CLASSES: Record<
    TooltipPlacement,
    { tooltip: string; arrowBase: string; arrowLight: string; arrowDark: string }
> = {
    top: {
        tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        arrowBase: 'left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-[6px] border-transparent border-t-[6px]',
        arrowLight: 'border-t-white',
        arrowDark: 'border-t-gray-800'
    },
    bottom: {
        tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
        arrowBase: 'left-1/2 -translate-x-1/2 top-0 -translate-y-full w-0 h-0 border-[6px] border-transparent border-b-[6px]',
        arrowLight: 'border-b-white',
        arrowDark: 'border-b-gray-800'
    },
    left: {
        tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
        arrowBase: 'right-0 translate-x-full top-1/2 -translate-y-1/2 w-0 h-0 border-[6px] border-transparent border-l-[6px]',
        arrowLight: 'border-l-white',
        arrowDark: 'border-l-gray-800'
    },
    right: {
        tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
        arrowBase: 'left-0 -translate-x-full top-1/2 -translate-y-1/2 w-0 h-0 border-[6px] border-transparent border-r-[6px]',
        arrowLight: 'border-r-white',
        arrowDark: 'border-r-gray-800'
    }
};

const ARROW_COLOR_STYLE_KEYS: Record<TooltipPlacement, keyof React.CSSProperties> = {
    top: 'borderTopColor',
    bottom: 'borderBottomColor',
    left: 'borderLeftColor',
    right: 'borderRightColor'
};

const PLACEMENTS: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];

function getBestPlacement(triggerRect: DOMRect): TooltipPlacement {
    if (typeof window === 'undefined') return 'top';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceTop = triggerRect.top;
    const spaceBottom = vh - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = vw - triggerRect.right;
    const spaces: Record<TooltipPlacement, number> = {
        top: spaceTop,
        bottom: spaceBottom,
        left: spaceLeft,
        right: spaceRight
    };
    let best: TooltipPlacement = 'top';
    let maxSpace = 0;
    for (const p of PLACEMENTS) {
        if (spaces[p] > maxSpace) {
            maxSpace = spaces[p];
            best = p;
        }
    }
    return best;
}

function getTriggerAriaLabel(triggerEl: HTMLElement | null): string | null {
    if (!triggerEl) return null;
    const withLabel = triggerEl.querySelector?.('[aria-label]') ?? (triggerEl as HTMLElement).closest?.('[aria-label]');
    if (withLabel && withLabel instanceof HTMLElement) return withLabel.getAttribute('aria-label');
    if (triggerEl instanceof HTMLElement && triggerEl.hasAttribute?.('aria-label')) return triggerEl.getAttribute('aria-label');
    return null;
}

export const Tooltip: React.FC<TooltipPropsType> = ({
    content: contentProp,
    appearance,
    placement: placementProp = 'auto',
    delayShow = 0,
    delayHide = 0,
    children,
    className = '',
    tooltipClassName = '',
    disabled = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>('top');
    const [labelFromTrigger, setLabelFromTrigger] = useState<string | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const displayContent = contentProp ?? labelFromTrigger ?? '';

    const clearTimeouts = useCallback(() => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (disabled) return;
        clearTimeouts();
        hideTimeoutRef.current = null;

        const show = () => {
            if (triggerRef.current) {
                const el = triggerRef.current.firstElementChild as HTMLElement | null;
                const label = getTriggerAriaLabel(el ?? triggerRef.current);
                setLabelFromTrigger(label);
                if (placementProp === 'auto') {
                    const rect = triggerRef.current.getBoundingClientRect();
                    setResolvedPlacement(getBestPlacement(rect));
                }
            }
            setIsVisible(true);
        };

        if (delayShow > 0) {
            showTimeoutRef.current = setTimeout(show, delayShow);
        } else {
            show();
        }
    }, [disabled, delayShow, placementProp, clearTimeouts]);

    const handleMouseLeave = useCallback(() => {
        clearTimeouts();
        showTimeoutRef.current = null;
        if (delayHide > 0) {
            hideTimeoutRef.current = setTimeout(() => setIsVisible(false), delayHide);
        } else {
            setIsVisible(false);
        }
    }, [delayHide, clearTimeouts]);

    const placement: TooltipPlacement =
        placementProp === 'auto' ? resolvedPlacement : placementProp;
    const placementStyles = PLACEMENT_CLASSES[placement];
    const followTheme = appearance == null;
    const bubbleClass =
        followTheme
            ? 'bg-[var(--tooltip-bg)] text-[var(--tooltip-text)]'
            : appearance === 'light'
              ? 'bg-[var(--tooltip-light-bg)] text-[var(--tooltip-light-text)]'
              : 'bg-[var(--tooltip-bg)] text-[var(--tooltip-text)]';
    const arrowStyle =
        followTheme
            ? { [ARROW_COLOR_STYLE_KEYS[placement]]: 'var(--tooltip-arrow)' } as React.CSSProperties
            : undefined;
    const arrowClass =
        followTheme
            ? placementStyles.arrowBase
            : cn(placementStyles.arrowBase, appearance === 'light' ? placementStyles.arrowLight : placementStyles.arrowDark);

    if (disabled) {
        return <>{children}</>;
    }

    const showBubble = isVisible && displayContent !== '';

    return (
        <div
            ref={triggerRef}
            className={cn('relative inline-flex', className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <div
                role="tooltip"
                className={cn(
                    'absolute z-[100] inline-flex px-3 py-2',
                    'text-sm font-medium whitespace-nowrap rounded shadow-md',
                    'transition-opacity duration-300',
                    placementStyles.tooltip,
                    showBubble ? 'opacity-100 pointer-events-none' : 'opacity-0 invisible pointer-events-none',
                    bubbleClass,
                    tooltipClassName
                )}
            >
                {displayContent}
                <div className={cn('absolute', arrowClass)} style={arrowStyle} aria-hidden />
            </div>
        </div>
    );
};
