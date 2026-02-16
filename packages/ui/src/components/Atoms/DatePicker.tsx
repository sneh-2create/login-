import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DatePickerProps {
    value?: Date | null;
    onChange: (_date: Date | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    className?: string;
    containerClassName?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select date',
    error,
    minDate,
    maxDate,
    disabled = false,
    className,
    containerClassName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            setCurrentMonth(value);
        }
    }, [value]);

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

    const onDateClick = (day: Date) => {
        if (disabled) return;
        onChange(day);
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";

        return (
            <div className="flex items-center justify-between mb-2">
                <button onClick={prevMonth} type="button" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="text-sm font-semibold text-gray-700">
                    {format(currentMonth, dateFormat)}
                </div>
                <button onClick={nextMonth} type="button" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "eeee";
        const days = [];
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-xs font-medium text-gray-400 text-center w-8 py-1">
                    {format(addDays(startDate, i), dateFormat).substr(0, 2)}
                </div>
            );
        }

        return <div className="flex mb-1 justify-between">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);

                days.push(
                    <div
                        key={day.toString()}
                        className={clsx(
                            "w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-all",
                            !isSameMonth(day, monthStart) ? "text-gray-300" : isDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100",
                            isSameDay(day, value!) && "bg-primary text-white hover:bg-primary-dark",
                            isSameDay(day, new Date()) && !isSameDay(day, value!) && "border border-primary text-primary"
                        )}
                        onClick={() => !isDisabled && onDateClick(cloneDay)}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="flex justify-between mb-1">
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
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
                        "flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 px-3 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]",
                        disabled && "cursor-not-allowed opacity-50 bg-gray-50",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                >
                    <span className={clsx("block truncate", !value && "text-gray-400")}>
                        {value ? format(value, "dd/MM/yyyy") : placeholder}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                </button>

                {isOpen && (
                    <div className="absolute z-[10001] mt-1 w-64 rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}
                    </div>
                )}
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};
