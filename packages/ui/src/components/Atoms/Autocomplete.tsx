import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AutocompleteProps, AutocompleteOption } from '@od-erp/types';
import { cn } from '../../utils';
import { useDropdownPosition } from '../../hooks/useDropdownPosition';

function filterOptions(options: AutocompleteOption[], query: string): AutocompleteOption[] {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
}

/** Autocomplete: input field, type to filter options, single select. Opens above when no space below (dynamic). */
export const Autocomplete: React.FC<AutocompleteProps> = ({
    label,
    options,
    value: valueProp,
    defaultValue,
    onChange,
    placeholder = 'Type to search...',
    error,
    containerClassName = '',
    id,
    disabled = false,
    ...rest
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | number | undefined>(valueProp ?? defaultValue);
    const [inputValue, setInputValue] = useState('');
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : internalValue;
    const inputId = id ?? `autocomplete-${Math.random().toString(36).slice(2, 9)}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { placement, triggerWidth } = useDropdownPosition(triggerRef, open);

    const selected = options.find((o) => o.value === value);
    const displayLabel = selected ? selected.label : '';

    useEffect(() => {
        if (controlled && valueProp !== undefined) setInternalValue(valueProp);
    }, [controlled, valueProp]);

    useEffect(() => {
        if (!open) {
            setInputValue(displayLabel ? String(displayLabel) : '');
        } else {
            setInputValue(displayLabel ? String(displayLabel) : '');
            inputRef.current?.focus();
        }
    }, [open, displayLabel]);

    const filteredOptions = useMemo(() => filterOptions(options, inputValue), [options, inputValue]);

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

    const handleSelect = (option: AutocompleteOption) => {
        if (!controlled) setInternalValue(option.value);
        onChange?.(option.value);
        setInputValue(String(option.label));
        setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!open) setOpen(true);
    };

    const handleInputFocus = () => {
        if (!disabled) setOpen(true);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filteredOptions.length === 1) {
            handleSelect(filteredOptions[0]);
            e.preventDefault();
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn('relative flex flex-col min-w-0 w-full', containerClassName)}
            {...rest}
        >
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'block mb-1.5 text-sm font-medium text-[var(--color-dark)]',
                        disabled && 'opacity-60'
                    )}
                >
                    {label}
                </label>
            )}
            <div
                ref={triggerRef}
                data-autocomplete-trigger
                className={cn(
                    'flex items-center gap-1.5 sm:gap-2 w-full min-w-0 box-border border pl-2 sm:pl-2.5 pr-2 py-1.5 sm:py-2 rounded-[var(--border-radius-md)] transition-colors duration-150',
                    'bg-[var(--color-white)] border-[var(--border-color)]',
                    'hover:border-[var(--ui-gray-400)] focus-within:!border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-opacity-40',
                    'disabled:bg-[var(--color-grey-1)] disabled:border-[var(--ui-gray-300)]',
                    open && '!border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-40',
                    error && !open && '!border-[var(--color-error)]'
                )}
            >
                <input
                    ref={inputRef}
                    type="text"
                    id={inputId}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleInputKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    aria-controls={open ? `${inputId}-listbox` : undefined}
                    aria-label={label}
                    className={cn(
                        'flex-1 min-w-0 bg-transparent border-0 p-0 text-[var(--font-size-sm)] text-[var(--color-dark)] placeholder:text-[var(--ui-placeholder-color)] outline-none'
                    )}
                />
                <ChevronDown
                    className={cn('w-4 h-4 shrink-0 text-[var(--color-secondary)] transition-transform pointer-events-none', open && 'rotate-180')}
                    aria-hidden
                />
            </div>
            {open && !disabled && triggerWidth != null && (
                <ul
                    id={`${inputId}-listbox`}
                    role="listbox"
                    aria-activedescendant={selected ? `${inputId}-opt-${String(selected.value)}` : undefined}
                    className={cn(
                        'absolute left-0 z-50 py-1 overflow-auto rounded-[var(--border-radius-md)] border border-[var(--border-color)] bg-[var(--color-white)] shadow-lg',
                        placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
                    )}
                    style={{ width: triggerWidth, maxWidth: triggerWidth, maxHeight: '240px', boxSizing: 'border-box' }}
                >
                    {filteredOptions.length === 0 ? (
                        <li className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-sm text-[var(--color-secondary)]">No matches</li>
                    ) : (
                        filteredOptions.map((option) => (
                            <li
                                key={String(option.value)}
                                id={`${inputId}-opt-${String(option.value)}`}
                                role="option"
                                aria-selected={option.value === value}
                                className={cn(
                                    'px-2 sm:px-2.5 py-1.5 sm:py-2 text-sm cursor-pointer outline-none transition-colors',
                                    'focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-40',
                                    option.value === value
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-dark)] hover:bg-[var(--color-grey-1)]'
                                )}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </li>
                        ))
                    )}
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
