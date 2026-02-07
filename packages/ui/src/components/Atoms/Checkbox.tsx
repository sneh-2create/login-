import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, containerClassName, id, ...props }, ref) => {
        const checkboxId = id || props.name || Math.random().toString(36).substr(2, 9);

        return (
            <div className={twMerge('flex flex-col gap-1', containerClassName)}>
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id={checkboxId}
                            ref={ref}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-all checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...props}
                        />
                        <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                    </div>
                    {label && (
                        <label
                            htmlFor={checkboxId}
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

Checkbox.displayName = 'Checkbox';
