import React from 'react';
import type { LoaderProps, LoaderSize } from '@od-erp/types';
import { cn } from '../../utils';

const SIZE_CLASSES: Record<LoaderSize, { track: string; bar: string }> = {
    sm: { track: 'h-1 w-12 rounded-full', bar: 'h-1 rounded-full' },
    md: { track: 'h-1.5 w-16 rounded-full', bar: 'h-1.5 rounded-full' },
    lg: { track: 'h-2 w-20 rounded-full', bar: 'h-2 rounded-full' }
};

/**
 * Rolling loader (Figma 652-4236). Primary color, animated bar that rolls along the track.
 */
export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className = '',
    'aria-label': ariaLabel = 'Loading'
}) => {
    const sizes = SIZE_CLASSES[size];
    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className={cn('inline-flex overflow-hidden', className)}
        >
            <div
                className={cn(
                    'relative bg-[var(--color-grey-2)]',
                    sizes.track
                )}
            >
                <div
                    className={cn(
                        'absolute left-0 top-0 w-1/2 bg-[var(--loader-color)]',
                        sizes.bar
                    )}
                    style={{
                        animation: 'loader-roll 1.2s ease-in-out infinite'
                    }}
                />
            </div>
        </div>
    );
};
