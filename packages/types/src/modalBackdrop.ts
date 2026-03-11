/** Figma 659-6660: dimmed backdrop layer only. Render modal/drawer content as sibling. */
export interface ModalBackdropProps {
    /** Whether backdrop is visible */
    open: boolean;
    /** Called when backdrop is clicked */
    onClose?: () => void;
    /** Backdrop class name */
    className?: string;
    /** If false, clicking backdrop does not call onClose */
    closeOnClick?: boolean;
}
