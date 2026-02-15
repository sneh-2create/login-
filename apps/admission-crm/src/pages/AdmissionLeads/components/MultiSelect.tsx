import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    value: string[];
    onChange: (_value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    groupBy?: string;
    renderOption?: (_option: any) => React.ReactNode;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    value = [],
    onChange,
    placeholder = 'Select...',
    disabled = false,
    groupBy,
    renderOption
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
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

    const handleToggle = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const handleOptionClick = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
    };

    const getDisplayValue = () => {
        if (value.length === 0) return <span className="text-gray-400">{placeholder}</span>;
        
        // Show count if more than 2 selected, else show chips
        if (value.length > 2) {
             return <span className="text-gray-700">{value.length} selected</span>;
        }

        return (
            <div className="flex flex-wrap gap-1">
                {value.map((v) => {
                    const option = options.find((o) => o.value === v);
                    return (
                        <span key={v} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                            {option ? option.label : v}
                            <X size={12} className="ml-1 cursor-pointer hover:text-blue-900" onClick={(e) => handleRemove(v, e)} />
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-1.5" ref={containerRef}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <div
                    className={`min-h-[40px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm flex justify-between items-center cursor-pointer ${
                        disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
                    } ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
                    onClick={handleToggle}
                >
                    <div className="flex-1 mr-2 overflow-hidden">
                        {getDisplayValue()}
                    </div>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {options.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 text-center">No options available</div>
                        ) : groupBy ? (
                            // Grouped Options
                            Object.entries(
                                options.reduce((groups: any, option: any) => {
                                    const group = option[groupBy] || 'Other';
                                    if (!groups[group]) groups[group] = [];
                                    groups[group].push(option);
                                    return groups;
                                }, {})
                            ).map(([group, groupOptions]: [string, any]) => (
                                <div key={group}>
                                    <div className="px-3 py-1 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">
                                        {group}
                                    </div>
                                    {groupOptions.map((option: any) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm pl-6"
                                            onClick={() => handleOptionClick(option.value)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={value.includes(option.value)}
                                                onChange={() => {}}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                            />
                                            {renderOption ? renderOption(option) : <span className="text-gray-700">{option.label}</span>}
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            // Flat Options
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                    onClick={() => handleOptionClick(option.value)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={value.includes(option.value)}
                                        onChange={() => {}}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                    />
                                    {renderOption ? renderOption(option) : <span className="text-gray-700">{option.label}</span>}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiSelect;
