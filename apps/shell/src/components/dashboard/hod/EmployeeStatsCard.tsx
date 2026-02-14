import React from 'react';
import { Card, cn } from '@od-erp/ui';
import { User, UserCheck, Users } from 'lucide-react';

interface EmployeeStatsCardProps {
    title: string;
    total: number;
    male: number;
    female: number;
    others: number;
    backgroundColor?: string;
    malePercentage?: number;
    femalePercentage?: number;
    othersPercentage?: number;
    className?: string;
}

const StatItem = ({ label, count, percentage, icon: Icon, colorClass }: { label: string; count: number; percentage?: number; icon: any; colorClass: string }) => (
    <div className="flex flex-col items-start gap-1">
        <div className={cn("p-2 rounded-full", colorClass.replace('text-', 'bg-').replace('600', '100'))}>
            <Icon size={20} className={colorClass} />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">{count}</span>
            {percentage !== undefined && (
                <span className="text-xs text-gray-500">
                    ({percentage}%)
                </span>
            )}
        </div>
    </div>
);

export const EmployeeStatsCard: React.FC<EmployeeStatsCardProps> = ({
    title,
    total,
    male,
    female,
    others,
    backgroundColor = "bg-white",
    malePercentage,
    femalePercentage,
    othersPercentage,
    className
}) => {
    // Calculate percentages
    const totalCount = total || 1;
    const mP = malePercentage ?? Math.round((male / totalCount) * 100);
    const fP = femalePercentage ?? Math.round((female / totalCount) * 100);
    const oP = othersPercentage ?? Math.round((others / totalCount) * 100);

    return (
        <Card className={cn("flex flex-col h-full border-none shadow-sm", backgroundColor, className)}>
            <div className="px-6 py-4 flex-1">
                <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">Total : {total}</div>

                <div className="grid grid-cols-3 gap-4">
                    <StatItem
                        label="Male"
                        count={male}
                        percentage={total > 0 ? mP : undefined}
                        icon={User}
                        colorClass="text-green-600"
                    />
                    <StatItem
                        label="Female"
                        count={female}
                        percentage={total > 0 ? fP : undefined}
                        icon={UserCheck}
                        colorClass="text-yellow-600"
                    />
                    <StatItem
                        label="Others"
                        count={others}
                        percentage={total > 0 ? oP : undefined}
                        icon={Users}
                        colorClass="text-purple-600"
                    />
                </div>
            </div>
        </Card>
    );
};
