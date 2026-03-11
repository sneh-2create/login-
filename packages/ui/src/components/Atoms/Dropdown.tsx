import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDropdownPosition } from '../../hooks/useDropdownPosition';

export interface DropdownOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface DropdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value'> {
    options: ReadonlyArray<DropdownOption> | DropdownOption[];
    value?: string | number | (string | number)[];
    onChange: (_value: string | number | (string | number)[]) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    multiple?: boolean;
    disabled?: boolean;
    className?: string;
    containerClassName?: string;
    searchable?: boolean;
    displayMode?: 'tags' | 'text';
    maxTags?: number;
    id?: string;
    usePortal?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    label,
    error,
    multiple = false,
    disabled = false,
    className,
    containerClassName,
    searchable = false,
    displayMode = 'text',
    maxTags = 3,
    id,
    usePortal = false,
    ...rest
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = !disabled && internalOpen;
    const setIsOpen = (val: boolean) => !disabled && setInternalOpen(val);

    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { placement, triggerWidth } = useDropdownPosition(triggerRef, isOpen);
    
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    
    useEffect(() => {
        if (!isOpen || !usePortal || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const isTop = placement === 'top';
        
        setMenuStyle({
            position: 'fixed',
            zIndex: 100002,
            width: triggerWidth ?? undefined,
            ...(isTop
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 }),
            left: rect.left
        });
    }, [isOpen, placement, triggerWidth, usePortal]);
    
    // Generate unique ID if not provided
    const uniqueId = useRef(`dropdown-${Math.random().toString(36).substr(2, 9)}`).current;
    const inputId = id ?? uniqueId;

    const filteredOptions = useMemo(() => options.filter(option =>
        searchable ? option.label.toLowerCase().includes(searchTerm.toLowerCase()) : true
    ), [options, searchable, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const insideTrigger = containerRef.current?.contains(target);
            const insideMenu = usePortal && menuRef.current?.contains(target);
            if (!insideTrigger && !insideMenu) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
             if (e.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
             document.addEventListener('mousedown', handleClickOutside);
             document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && multiple && (e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                const allValues = filteredOptions.filter(o => !o.disabled).map(o => o.value);
                const currentValues = Array.isArray(value) ? value : [];
                
                // If all filtered options are already selected, deselect them. Otherwise, select all.
                const allSelected = allValues.every(v => currentValues.includes(v));
                
                if (allSelected) {
                    onChange(currentValues.filter(v => !allValues.includes(v)));
                } else {
                    const newValues = Array.from(new Set([...currentValues, ...allValues]));
                    onChange(newValues);
                }
            }
        };

        if (isOpen) {
             window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, multiple, filteredOptions, value, onChange]);

    // Reset search when closed
    useEffect(() => {
        if (!isOpen) setSearchTerm('');
    }, [isOpen]);


    const handleSelect = (optionValue: string | number) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValue);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const removeValue = (e: React.MouseEvent, valToRemove: string | number) => {
        e.stopPropagation();
        if (Array.isArray(value)) {
            onChange(value.filter(v => v !== valToRemove));
        }
    };

    const getDisplayValue = () => {
        // Nothing selected
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return <span className="text-gray-400">{placeholder}</span>;
        }

        // Single Select
        if (!multiple || !Array.isArray(value)) {
             const selectedOption = options.find(o => o.value === value);
             return selectedOption?.label || value;
        }

        // Multi Select - Text Mode
        if (displayMode === 'text') {
             const selectedOptions = options.filter(o => value.includes(o.value));
             if (selectedOptions.length === 0) return '';
             if (selectedOptions.length <= 2) {
                 return selectedOptions.map(o => o.label).join(', ');
             }
             return `${selectedOptions.length} selected`;
        }

        // Multi Select - Tags Mode
        const visibleValues = value.slice(0, maxTags);
        const hasMore = value.length > maxTags;

        return (
            <div className="flex flex-wrap gap-1">
                {visibleValues.map(val => {
                    const option = options.find(o => o.value === val);
                    return (
                        <span key={val} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {option?.label || val}
                            <X
                                size={12}
                                className="cursor-pointer hover:text-primary-dark"
                                onClick={(e) => removeValue(e, val)}
                            />
                        </span>
                    );
                })}
                {hasMore && (
                     <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        +{value.length - maxTags} more
                    </span>
                )}
            </div>
        );
    };

    return (
        <div 
            className={twMerge('flex flex-col gap-1.5', containerClassName)} 
            ref={containerRef}
            {...rest}
        >
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-foreground)]">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    id={inputId}
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        "relative w-full cursor-pointer rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px] text-[var(--color-foreground)]",
                        disabled && "cursor-not-allowed opacity-50 bg-[var(--color-background)]",
                        error && "border-red-500 focus:ring-red-500",
                        isOpen && "ring-1 ring-primary border-primary",
                        className
                    )}
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <div className="block truncate mr-2">{getDisplayValue()}</div>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className={clsx("h-4 w-4 text-[var(--color-muted-foreground)] transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                    </span>
                </button>

                {isOpen && (() => {
                    const menuContent = (
                        <div 
                            ref={menuRef}
                            className={clsx(
                                "w-full overflow-hidden rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm",
                                !usePortal && "absolute z-[100002]",
                                !usePortal && (placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1')
                            )}
                            style={{ 
                                width: triggerWidth ?? undefined, 
                                maxHeight: '240px', 
                                display: 'flex', 
                                flexDirection: 'column',
                                ...(usePortal ? menuStyle : {})
                            }}
                        >
                        {searchable && (
                            <div className="sticky top-0 z-10 bg-[var(--color-card)] px-2 py-1.5 border-b border-[var(--color-border)] shrink-0">
                                <input
                                    type="text"
                                    className="w-full rounded border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        )}
                        
                        <div className="overflow-auto py-1 flex-1">
                             {filteredOptions.length === 0 ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-[var(--color-muted-foreground)] italic">
                                    No options found.
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = multiple
                                        ? Array.isArray(value) && value.includes(option.value)
                                        : value === option.value;

                                    return (
                                        <div
                                            key={option.value}
                                            className={clsx(
                                                "relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-[var(--color-background)]",
                                                isSelected ? "bg-primary/5 text-primary" : "text-[var(--color-foreground)]",
                                                option.disabled && "cursor-not-allowed opacity-50"
                                            )}
                                            onClick={() => !option.disabled && handleSelect(option.value)}
                                        >
                                            <div className="flex items-center">
                                                {multiple && (
                                                  <div className={clsx(
                                                      "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                                                      isSelected ? "border-primary bg-primary text-white" : "border-[var(--color-border)] bg-[var(--color-card)]"
                                                  )}>
                                                      {isSelected && <Check size={12} />}
                                                  </div>
                                                )}
                                                <span className={clsx("block truncate", isSelected && "font-medium")}>
                                                    {option.label}
                                                </span>
                                            </div>
                                            {!multiple && isSelected && (
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    );
                    return usePortal ? createPortal(menuContent, document.body) : menuContent;
                })()}
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};
