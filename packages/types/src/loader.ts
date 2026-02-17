export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps {
    /** Size of the loader. Default: md */
    size?: LoaderSize;
    /** Optional class for the wrapper */
    className?: string;
    /** Accessible label for screen readers */
    'aria-label'?: string;
}
