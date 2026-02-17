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
        if (!controlled) setInternalValue(option.value);
        onChange?.(option.value);
        setOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={cn('relative flex flex-col min-w-0 w-full', containerClassName)}
            {...rest}
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
                    'flex items-center gap-1.5 sm:gap-2 w-full min-w-0 box-border border pl-2 sm:pl-2.5 pr-2 py-1.5 sm:py-2 text-[var(--font-size-sm)]',
                    'rounded-[var(--border-radius-md)] transition-colors duration-150 text-left',
                    'bg-[var(--color-white)] border-[var(--border-color)] text-[var(--color-dark)]',
                    'hover:border-[var(--ui-gray-400)] outline-none focus:!outline-none focus:ring-0 focus-visible:!outline-none focus:border-[var(--color-primary)] focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                    'disabled:bg-[var(--color-grey-1)] disabled:border-[var(--ui-gray-300)] disabled:text-[var(--color-secondary)] disabled:cursor-not-allowed',
                    open && '!border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-40',
                    error && !open && '!border-[var(--color-error)]'
                )}
            >
                <span className={cn('flex-1 min-w-0 truncate', !displayLabel && 'text-[var(--ui-placeholder-color)]')}>
                    {displayLabel || placeholder}
                </span>
                <ChevronDown
                    className={cn('w-4 h-4 shrink-0 text-[var(--color-secondary)] transition-transform', open && 'rotate-180')}
                    aria-hidden
                />
            </button>
            {open && !disabled && triggerWidth != null && (
                <ul
                    role="listbox"
                    aria-activedescendant={selected ? `${selectId}-opt-${String(selected.value)}` : undefined}
                    className={cn(
                        'absolute left-0 z-50 py-1 overflow-auto rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg',
                        placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
                    )}
                    style={{ width: triggerWidth, maxWidth: triggerWidth, maxHeight: '240px', boxSizing: 'border-box' }}
                >
                    {options.map((option) => (
                        <li
                            key={String(option.value)}
                            id={`${selectId}-opt-${String(option.value)}`}
                            role="option"
                            aria-selected={option.value === value}
                            className={cn(
                                'px-2 sm:px-2.5 py-1.5 sm:py-2 text-sm cursor-pointer outline-none',
                                'focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                option.value === value
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]'
                            )}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </li>
                    ))}
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
