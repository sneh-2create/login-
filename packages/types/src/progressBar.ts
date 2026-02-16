import type { ReactNode } from 'react';

export interface ProgressBarProps {
    /** Current value (0 to max). */
    value: number;
    /** Maximum value. Default: 100 */
    max?: number;
    /** Optional label above or beside the bar (e.g. "Uploading..."). If not provided, shows percentage. */
    label?: ReactNode;
    /** Show percentage text (e.g. "75%"). Default: true */
    showPercent?: boolean;
    /** Optional class for the container */
    className?: string;
    /** Optional class for the track/fill wrapper */
    barClassName?: string;
    /** Accessible label for screen readers */
    'aria-label'?: string;
}
