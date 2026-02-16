import React from 'react';
import type { ModalOverlayProps } from '@od-erp/types';
import { cn } from '../../utils';

/**
 * Modal overlay (Figma 652-4257, 667-148): full-viewport dimmed layer with optional content.
 * Use for modals and drawers. Clicking the backdrop (not the content) calls onClose when closeOnBackdropClick is true.
 */
export const ModalOverlay: React.FC<ModalOverlayProps> = ({
    open,
    onClose,
    children,
    className = '',
    contentClassName = '',
    closeOnBackdropClick = true
}) => {
    if (!open) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) onClose?.();
    };

    return (
        <div
            className={cn(
                'fixed inset-0 z-[var(--overlay-z-index)]',
                'bg-[var(--overlay-bg)]',
                'transition-opacity duration-200',
                className
            )}
            onClick={handleBackdropClick}
            role="presentation"
            aria-hidden
        >
            {children && (
                <div className={cn('absolute inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-auto')}>
                    <div className={cn('pointer-events-auto w-full max-w-full', contentClassName)} onClick={(e) => e.stopPropagation()}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};
