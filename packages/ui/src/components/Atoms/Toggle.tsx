import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
    ({ label, error, containerClassName, id, ...props }, ref) => {
        const toggleId = id || props.name || Math.random().toString(36).substr(2, 9);

        return (
            <div className={twMerge('flex flex-col gap-1', containerClassName)}>
                <div className="flex items-center gap-3">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id={toggleId}
                            ref={ref}
                            className="peer sr-only"
                            {...props}
                        />
                        <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                    </div>
                    {label && (
                        <label
                            htmlFor={toggleId}
                            className={clsx(
                                "text-sm font-medium text-gray-700 cursor-pointer select-none",
                                props.disabled && "cursor-not-allowed opacity-50"
                            )}
                        >
                            {label}
                        </label>
                    )}
                </div>
                {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
        );
    }
);

Toggle.displayName = 'Toggle';
