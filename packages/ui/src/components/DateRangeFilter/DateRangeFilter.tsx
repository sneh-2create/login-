import React from 'react';
import { Input } from '../Atoms/Input';
import { Button } from '../Atoms/Button';

export interface DateRangeFilterProps {
    startDate: string;
    endDate: string;
    onStartChange: (_date: string) => void;
    onEndChange: (_date: string) => void;
    onGo: () => void;
    isLoading?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    onGo,
    isLoading
}) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartChange(e.target.value)}
                className="h-8 text-xs w-32"
                aria-label="Start Date"
            />
            <span className="text-gray-400">-</span>
            <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndChange(e.target.value)}
                className="h-8 text-xs w-32"
                aria-label="End Date"
            />
            <Button
                variant="primary"
                size="sm"
                onClick={onGo}
                isLoading={isLoading}
                className="h-8 px-3"
            >
                Go
            </Button>
        </div>
    );
};
