import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DropdownOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface DropdownProps {
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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        searchable ? option.label.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, multiple, filteredOptions, value, onChange]);

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
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return <span className="text-gray-400">{placeholder}</span>;
        }

        if (multiple && Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map(val => {
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
                </div>
            );
        }

        const selectedOption = options.find(o => o.value === value);
        return selectedOption?.label || value;
    };

    return (
        <div className={twMerge('flex flex-col gap-1.5', containerClassName)} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={clsx(
                        "relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]",
                        disabled && "cursor-not-allowed opacity-50 bg-gray-50",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <span className="block truncate">{getDisplayValue()}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-[10002] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {searchable && (
                            <div className="sticky top-0 z-10 bg-white px-2 py-1.5 border-b border-gray-100">
                                <input
                                    type="text"
                                    className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        )}
                        {filteredOptions.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-500 italic">
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
                                            "relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-50",
                                            isSelected ? "bg-primary/5 text-primary" : "text-gray-900",
                                            option.disabled && "cursor-not-allowed opacity-50"
                                        )}
                                        onClick={() => !option.disabled && handleSelect(option.value)}
                                    >
                                        <div className="flex items-center">
                                            {multiple && (
                                              <div className={clsx(
                                                  "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                                                  isSelected ? "border-primary bg-primary text-white" : "border-gray-300 bg-white"
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
                )}
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};
