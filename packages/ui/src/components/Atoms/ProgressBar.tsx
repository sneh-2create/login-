import React from 'react';
import type { ProgressBarProps } from '@od-erp/types';
import { cn } from '../../utils';

/**
 * Progress bar (Figma 652-4229). Primary color fill, dynamic label and percentage as the bar fills.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    label,
    showPercent = true,
    className = '',
    barClassName = '',
    'aria-label': ariaLabel = 'Progress'
}) => {
    const safeMax = max <= 0 ? 100 : max;
    const clamped = Math.min(safeMax, Math.max(0, Number(value)));
    const percent = safeMax === 0 ? 0 : Math.round((clamped / safeMax) * 100);
    const percentText = `${percent}%`;

    return (
        <div
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={safeMax}
            aria-label={ariaLabel}
            className={cn('flex flex-col gap-1.5 min-w-0 w-full', className)}
        >
            {(label != null || showPercent) && (
                <div className="flex items-center justify-between gap-2 text-sm">
                    {label != null && (
                        <span className="text-[var(--color-dark)] font-medium truncate">
                            {label}
                        </span>
                    )}
                    {showPercent && (
                        <span
                            className={cn(
                                'shrink-0 text-[var(--color-secondary)] font-medium tabular-nums'
                            )}
                        >
                            {percentText}
                        </span>
                    )}
                </div>
            )}
            <div
                className={cn(
                    'h-2 w-full min-w-0 rounded-full overflow-hidden bg-[var(--progress-track)]',
                    barClassName
                )}
            >
                <div
                    className="h-full rounded-full bg-[var(--progress-fill)] transition-[width] duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};
