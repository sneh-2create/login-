import React from 'react';
import { Card } from '@od-erp/ui';

interface MessStatsCardProps {
    count: number;
    label: string;
    icon?: any;
    color?: string;
    bgColor?: string;
}

export const MessStatsCard: React.FC<MessStatsCardProps> = ({
    count,
    label,
    icon: Icon,
    color,
    bgColor,
}) => {
    return (
        <Card className="h-full border-none shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="p-6 flex flex-col items-center justify-center gap-2 h-full text-center">
                <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wide">{label}</h3>
                <span className="text-4xl font-bold text-gray-900">{count}</span>
                {Icon && (
                    <div className={`p-2 rounded-full ${bgColor || 'bg-blue-50'}`}>
                        <Icon className={`w-6 h-6 ${color || 'text-blue-500'}`} />
                    </div>
                )}
            </div>
        </Card>
    );
};
