import React from 'react';
import { ToastContainerProps as ToastContainerPropsType } from '@od-erp/types';
import { cn } from '../../utils';

const POSITION_CLASSES: Record<
    ToastContainerPropsType['position'],
    string
> = {
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4'
};

export const ToastContainer: React.FC<ToastContainerPropsType> = ({
    position,
    children,
    className = ''
}) => {
    return (
        <div
            role="region"
            aria-label="Toasts"
            className={cn(
                'fixed z-[var(--toast-z-index)] flex flex-col gap-[var(--toast-gap)]',
                POSITION_CLASSES[position],
                className
            )}
        >
            {children}
        </div>
    );
};
