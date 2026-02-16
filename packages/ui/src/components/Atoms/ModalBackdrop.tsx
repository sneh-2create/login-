import React from 'react';
import type { ModalBackdropProps } from '@od-erp/types';
import { cn } from '../../utils';

/**
 * Figma 659-6660: modal backdrop only (dimmed layer).
 * Render your modal or drawer content as a sibling with higher z-index.
 */
export const ModalBackdrop: React.FC<ModalBackdropProps> = ({
    open,
    onClose,
    className = '',
    closeOnClick = true
}) => {
    if (!open) return null;

    return (
        <div
            className={cn(
                'fixed inset-0 z-[var(--modal-backdrop-z-index)]',
                'bg-[var(--modal-backdrop-bg)]',
                'transition-opacity duration-200',
                className
            )}
            onClick={closeOnClick ? onClose : undefined}
            role="presentation"
            aria-hidden
        />
    );
};
