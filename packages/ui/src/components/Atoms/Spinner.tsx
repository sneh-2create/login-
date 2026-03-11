import React from 'react';
import type { SpinnerProps, SpinnerSize } from '@od-erp/types';
import { cn } from '../../utils';

/** Figma 652-6404: circular ring, fills in 4 quarters (right → bottom → left → top) then complete. Primary color. */
const SIZE_CONFIG: Record<SpinnerSize, { size: number; stroke: number }> = {
    sm: { size: 24, stroke: 2 },
    md: { size: 32, stroke: 2.5 },
    lg: { size: 40, stroke: 3 }
};

/**
 * Spinner (Figma 652-6404). Circular ring, primary color. Loads in 4 steps: half from right, half from left, half from top, half from bottom, then fully complete. Running / looping.
 */
export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    className = '',
    'aria-label': ariaLabel = 'Loading'
}) => {
    const { size: px, stroke } = SIZE_CONFIG[size];
    const cx = px / 2;
    const cy = px / 2;
    const r = px / 2 - stroke / 2;
    const circumference = 2 * Math.PI * r;

    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className={cn('inline-flex shrink-0', className)}
        >
            <svg
                width={px}
                height={px}
                viewBox={`0 0 ${px} ${px}`}
                fill="none"
                aria-hidden
            >
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    stroke="var(--spinner-color)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    className="spinner-quarter-ring"
                    style={
                        { '--spinner-circumference': circumference } as React.CSSProperties
                    }
                />
            </svg>
        </div>
    );
};
