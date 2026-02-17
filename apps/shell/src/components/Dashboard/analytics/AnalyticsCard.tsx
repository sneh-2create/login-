import React from 'react';
import { Card } from '@od-erp/ui';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
    count: number | string;
    label: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
    count,
    label,
    icon: Icon,
    color,
    bgColor,
}) => {
    return (
        <Card className="h-full border-none shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="p-6 flex flex-col items-start gap-4 h-full">
                <div className="w-full flex items-center justify-between">
                    <span className="text-3xl font-bold text-gray-900">{count}</span>
                    <div
                        className="p-3 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: bgColor }}
                    >
                        <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                </div>
                <h3 className="text-gray-600 font-medium mt-auto">{label}</h3>
            </div>
        </Card>
    );
};
