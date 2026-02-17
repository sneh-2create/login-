export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
    /** Size of the spinner. Default: md */
    size?: SpinnerSize;
    /** Optional class for the wrapper */
    className?: string;
    /** Accessible label for screen readers */
    'aria-label'?: string;
}
