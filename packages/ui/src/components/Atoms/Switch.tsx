import React, { useState, useEffect } from 'react';
import type { SwitchProps } from '@od-erp/types';
import { cn } from '../../utils';

/**
 * Switch / Toggle (Figma 659-6591) – all variants for use across the app.
 * States: default (off), on, hover (when not disabled), disabled (off & on).
 * White circle (thumb) is vertically centered in the track.
 */
export const Switch: React.FC<SwitchProps> = ({
    checked: checkedProp,
    defaultChecked = false,
    onChange,
    label,
    disabled = false,
    containerClassName = '',
    className = '',
    ...rest
}) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const controlled = checkedProp !== undefined;
    const checked = controlled ? checkedProp : internalChecked;

    useEffect(() => {
        if (controlled && checkedProp !== undefined) setInternalChecked(checkedProp);
    }, [controlled, checkedProp]);

    const handleClick = () => {
        if (disabled) return;
        const next = !checked;
        if (!controlled) setInternalChecked(next);
        onChange?.(next);
    };

    return (
        <div className={cn('flex items-center gap-2 min-w-0', containerClassName)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    'group relative inline-flex shrink-0 rounded-full border-2 transition-colors duration-150 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40 focus-visible:ring-offset-1',
                    'disabled:opacity-[var(--control-disabled-opacity)] disabled:cursor-not-allowed',
                    checked
                        ? 'bg-[var(--switch-track-on)] border-[var(--control-checked-border)]'
                        : 'bg-[var(--switch-track-off)] border-[var(--control-border)]',
                    !disabled && !checked && 'hover:bg-[var(--switch-track-off-hover)] hover:border-[var(--control-hover-border)]',
                    !disabled && checked && 'hover:opacity-90',
                    className
                )}
                style={{
                    width: 'var(--switch-track-width)',
                    height: 'var(--switch-track-height)'
                }}
                {...rest}
            >
                <span
                    className="absolute top-1/2 -translate-y-1/2 rounded-full bg-[var(--switch-thumb-bg)] shadow border border-[var(--switch-thumb-border)] transition-[left] duration-150"
                    style={{
                        width: 'var(--switch-thumb-size)',
                        height: 'var(--switch-thumb-size)',
                        left: checked ? 'calc(100% - var(--switch-thumb-size) - 2px)' : '2px'
                    }}
                />
            </button>
            {label != null && (
                <span
                    className={cn('text-sm text-[var(--color-dark)] cursor-pointer select-none', disabled && 'opacity-[var(--control-disabled-opacity)]')}
                    onClick={() => !disabled && handleClick()}
                >
                    {label}
                </span>
            )}
        </div>
    );
};
