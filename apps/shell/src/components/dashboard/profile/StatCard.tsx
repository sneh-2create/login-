
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color: 'orange' | 'blue' | 'green' | 'pink';
    icon: React.ReactNode;
}

const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    pink: 'bg-pink-50 text-pink-600',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon }) => {
    return (
        <div className={`${colorClasses[color]} p-4 rounded-lg flex items-center justify-between h-full`}>
            <div className={`p-3 rounded-full bg-white bg-opacity-60`}>
                {icon}
            </div>
            <div className="text-right">
                <p className="text-sm font-medium opacity-80">{title}</p>
                <div className="flex flex-col items-end">
                    <h4 className="text-xl font-bold">{value}</h4>
                    {subtitle && <span className="text-xs opacity-75">{subtitle}</span>}
                </div>
            </div>
        </div>
    );
};
