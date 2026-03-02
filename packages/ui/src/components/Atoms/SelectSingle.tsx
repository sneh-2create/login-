import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectSingleProps, SelectSingleOption } from '@od-erp/types';
import { cn } from '../../utils';
import { useDropdownPosition } from '../../hooks/useDropdownPosition';

/** Single-select dropdown: click to open, choose one option. Opens above when no space below (dynamic). */
export const SelectSingle: React.FC<SelectSingleProps> = ({
    label,
    options,
    value: valueProp,
    defaultValue,
    onChange,
    placeholder = 'Select',
    error,
    containerClassName = '',
    id,
    disabled = false,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | number | undefined>(valueProp ?? defaultValue);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : internalValue;
    const selectId = id ?? `select-single-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const { placement, triggerWidth } = useDropdownPosition(triggerRef, open);

    const selected = options.find((o) => o.value === value);
    const displayLabel = selected ? selected.label : '';

    useEffect(() => {
        if (controlled && valueProp !== undefined) setInternalValue(valueProp);
    }, [controlled, valueProp]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const handleSelect = (option: SelectSingleOption) => {
        if (option.disabled) return;
        if (!controlled) setInternalValue(option.value);
        onChange?.(option.value);
        setOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={cn('relative flex flex-col min-w-0 w-full', containerClassName)}
            {...Object.keys(rest).reduce((acc, key) => {
                if (key !== 'className') acc[key] = (rest as any)[key];
                return acc;
            }, {} as any)}
        >
            {label && (
                <label
                    htmlFor={selectId}
                    className={cn(
                        'block mb-1.5 text-sm font-medium text-[var(--color-dark)]',
                        disabled && 'opacity-60'
                    )}
                >
                    {label}
                </label>
            )}
            <button
                ref={triggerRef}
                type="button"
                id={selectId}
                disabled={disabled}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={label}
                onClick={() => !disabled && setOpen((o) => !o)}
                className={cn(
                    'relative w-full cursor-pointer rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[var(--color-foreground)]',
                    disabled && 'cursor-not-allowed opacity-50 bg-[var(--color-background)]',
                    error && !open && 'border-red-500 focus:ring-red-500',
                    open && 'ring-1 ring-primary border-primary',
                    rest.className
                )}
            >
                <div className={cn('block truncate mr-2', !displayLabel && 'text-[var(--ui-placeholder-color)]')}>
                    {displayLabel || placeholder}
                </div>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown
                        className={cn('h-4 w-4 text-[var(--color-muted-foreground)] transition-transform', open && 'rotate-180')}
                        aria-hidden
                    />
                </span>
            </button>
            {open && !disabled && triggerWidth != null && (
                <ul
                    role="listbox"
                    aria-activedescendant={selected ? `${selectId}-opt-${String(selected.value)}` : undefined}
                    className={cn(
                        'absolute left-0 z-[10002] overflow-auto rounded-md bg-[var(--color-card)] text-base shadow-lg ring-1 ring-[var(--color-border)] ring-opacity-100 focus:outline-none sm:text-sm py-1',
                        placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
                    )}
                    style={{ minWidth: triggerWidth, width: 'max-content', maxWidth: '300px', maxHeight: '240px', boxSizing: 'border-box' }}
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        const isDisabled = option.disabled ?? false;
                        return (
                            <li
                                key={String(option.value)}
                                id={`${selectId}-opt-${String(option.value)}`}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={isDisabled}
                                className={cn(
                                    'relative select-none py-2 pl-3 pr-9',
                                    isDisabled
                                        ? 'cursor-not-allowed opacity-40 line-through text-[var(--color-muted-foreground)]'
                                        : 'cursor-pointer hover:bg-[var(--color-background)]',
                                    !isDisabled && isSelected ? 'bg-primary/5 text-primary' : !isDisabled && 'text-[var(--color-foreground)]'
                                )}
                                onClick={() => !isDisabled && handleSelect(option)}
                            >
                                <span className={cn('block truncate', isSelected && !isDisabled && 'font-medium')}>
                                    {option.label}
                                </span>
                                {isSelected && !isDisabled && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {error && (
                <p className="mt-1 text-xs text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};
