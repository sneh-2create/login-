import React from 'react';
import { Card } from '@od-erp/ui';
import { LucideIcon } from 'lucide-react';

interface CommunicationCardProps {
    title: string;
    count: number | string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}

export const CommunicationCard: React.FC<CommunicationCardProps> = ({
    title,
    count,
    icon: Icon,
    color,
    bgColor,
}) => {
    return (
        <Card
            className="h-full border-none shadow-sm transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: bgColor }}
        >
            <div className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <span className="text-xl font-medium text-gray-700">{title}</span>
                    </div>

                    <div className="bg-white/50 px-6 py-2 rounded-lg backdrop-blur-sm min-w-[80px] text-center">
                        <span className="text-2xl font-bold text-gray-900">{count || 0}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
