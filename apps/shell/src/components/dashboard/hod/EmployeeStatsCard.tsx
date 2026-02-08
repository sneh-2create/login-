import React from 'react';
import { Card } from '@od-erp/ui';

interface EmployeeStatsCardProps {
    title: string;
    total: number;
    male: number;
    female: number;
    others: number;
    malePercentage?: number;
    femalePercentage?: number;
    othersPercentage?: number;
}

const ProgressBar = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export const EmployeeStatsCard: React.FC<EmployeeStatsCardProps> = ({
    title,
    total,
    male,
    female,
    others,
    malePercentage,
    femalePercentage,
    othersPercentage
}) => {
    // Calculate percentages if not provided
    const totalCount = total || 1;
    const mP = malePercentage ?? Math.round((male / totalCount) * 100);
    const fP = femalePercentage ?? Math.round((female / totalCount) * 100);
    const oP = othersPercentage ?? Math.round((others / totalCount) * 100);

    return (
        <Card className="flex flex-col h-full">
            <div className="px-6 py-4 flex-1">
                <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
                <div className="text-3xl font-bold mb-4">{total}</div>
                <div className="space-y-4">
                    <ProgressBar value={mP} color="bg-blue-500" label={`Male (${male})`} />
                    <ProgressBar value={fP} color="bg-pink-500" label={`Female (${female})`} />
                    <ProgressBar value={oP} color="bg-yellow-500" label={`Others (${others})`} />
                </div>
            </div>
        </Card>
    );
};
