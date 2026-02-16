import React from 'react';
import { SnackbarContainerProps as SnackbarContainerPropsType } from '@od-erp/types';
import { cn } from '../../utils';

const POSITION_CLASSES: Record<
    SnackbarContainerPropsType['position'],
    string
> = {
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
};

export const SnackbarContainer: React.FC<SnackbarContainerPropsType> = ({
    position,
    children,
    className = ''
}) => {
    return (
        <div
            role="region"
            aria-label="Snackbars"
            className={cn(
                'fixed z-[var(--snackbar-z-index)] flex flex-col-reverse gap-[var(--snackbar-gap)]',
                POSITION_CLASSES[position],
                className
            )}
        >
            {children}
        </div>
    );
};
