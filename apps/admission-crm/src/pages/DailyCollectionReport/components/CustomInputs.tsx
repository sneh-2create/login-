
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';

export const CustomDateInput = ({ 
    value, 
    onChange, 
    className, 
    ...props 
}: { 
    value: number, 
    onChange: (_timestamp: number) => void, 
    className?: string 
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    const displayValue = value ? format(new Date(value), 'dd/MM/yyyy') : '';
    const isoValue = value ? format(new Date(value), 'yyyy-MM-dd') : '';

    return (
        <div 
            className={`relative flex items-center border border-gray-300 rounded bg-white h-10 px-3 cursor-pointer hover:border-gray-400 transition-colors ${className}`} 
            onClick={() => inputRef.current?.showPicker()}
        >
            <span className={`flex-1 text-sm ${!displayValue ? 'text-gray-400' : 'text-gray-700'}`}>
                {displayValue || 'dd/mm/yyyy'}
            </span>
            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            <input 
                ref={inputRef}
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={isoValue}
                onChange={(e) => {
                    if (e.target.value) {
                         const d = new Date(e.target.value);
                         d.setHours(0,0,0,0);
                         onChange(d.getTime());
                    }
                }}
                {...props}
            />
        </div>
    );
};

export const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Select...", 
    className 
}: { 
    value: string, 
    onChange: (_val: string) => void, 
    options: { label: string; value: string }[], 
    placeholder?: string, 
    className?: string 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div 
                className="border border-gray-300 rounded bg-white h-10 px-3 flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm truncate ${!value ? 'text-gray-500' : 'text-gray-700'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 z-50">
                    {options.length > 0 ? options.map(option => (
                        <div 
                            key={option.value} 
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <Check className="w-3 h-3" />}
                        </div>
                    )) : (
                        <div className="px-3 py-2 text-sm text-gray-400 italic">No options</div>
                    )}
                </div>
            )}
        </div>
    );
};
