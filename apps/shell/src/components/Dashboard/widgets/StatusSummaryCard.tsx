import React from 'react';
import { Card, cn } from '@od-erp/ui';
import { LucideIcon } from 'lucide-react';

interface StatusSummaryCardProps {
    title: string;
    count: number | string;
    icon: LucideIcon;
    color: string; // Tailwind text color class e.g., 'text-yellow-500'
    bgColor: string; // Tailwind bg color class e.g., 'bg-yellow-50'
    onClick?: () => void;
    className?: string;
}

export const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({
    title,
    count,
    icon: Icon,
    color,
    bgColor,
    onClick,
    className
}) => {
    return (
        <Card
            className={cn(
                "p-4 flex flex-col justify-between h-full transition-shadow hover:shadow-md",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>

                </div>
                <div className={cn("p-3 rounded-full flex items-center justify-center", bgColor)}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
            </div>
        </Card>
    );
};
