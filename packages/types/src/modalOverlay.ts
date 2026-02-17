import type { ReactNode } from 'react';

export interface ModalOverlayProps {
    /** Whether overlay is visible */
    open: boolean;
    /** Called when overlay is clicked (e.g. close modal) */
    onClose?: () => void;
    /** Overlay content (e.g. modal panel or drawer). Clicking overlay (not content) triggers onClose. */
    children?: ReactNode;
    /** Class for the backdrop div */
    className?: string;
    /** Class for the inner content wrapper (optional) */
    contentClassName?: string;
    /** If true, clicking backdrop does not call onClose */
    closeOnBackdropClick?: boolean;
}
