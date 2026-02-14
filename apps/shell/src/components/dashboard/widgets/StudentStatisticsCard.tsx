import React from 'react';
import { Card, cn } from '@od-erp/ui';
import { User, UserCheck, UserX } from 'lucide-react';
import { StudentSessionData } from '@od-erp/types';

interface StudentStatisticsCardProps {
    currentMeasure: StudentSessionData;
    previousMeasure: StudentSessionData;
    loading?: boolean;
}

export const StudentStatisticsCard: React.FC<StudentStatisticsCardProps> = ({ currentMeasure, previousMeasure, loading }) => {

    if (loading) {
        return (
            <Card className="h-64 animate-pulse bg-gray-100 p-4 border-none shadow-none bg-yellow-50/50">
                <div className="h-full w-full"></div>
            </Card>
        );
    }

    const StatRow = ({ icon: Icon, label, currentValue, previousValue, colorClass }: any) => (
        <div className="flex items-center justify-between py-3 border-b border-yellow-100 last:border-0">
            <div className="flex items-center gap-3 w-1/3">
                <div className={cn("p-2 rounded-full bg-white/50", colorClass)}>
                    <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
            </div>
            <div className="flex-1 text-center">
                <span className="text-sm font-bold text-gray-800">{currentValue || '-'}</span>
            </div>
            <div className="flex-1 text-center">
                <span className="text-sm font-bold text-gray-500">{previousValue || '-'}</span>
            </div>
        </div>
    );

    return (
        <Card className="border-none shadow-[0px_0px_10px_-2px_#0000001A] h-full bg-yellow-50/50">
            <div className="p-6 pb-2">
                <h6 className="text-sm font-semibold text-gray-500">Student Statistics (Vs. Prev Year)</h6>
            </div>
            <div className="p-6 pt-2">
                {/* Header Row */}
                <div className="flex items-center justify-between py-2 mb-2">
                    <div className="w-1/3"></div>
                    <div className="flex-1 text-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">This Session</span>
                    </div>
                    <div className="flex-1 text-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prev Session</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <StatRow
                        icon={UserCheck}
                        label="Boys"
                        currentValue={currentMeasure.boys}
                        previousValue={previousMeasure.boys}
                        colorClass="text-yellow-600"
                    />
                    <StatRow
                        icon={User}
                        label="Girls"
                        currentValue={currentMeasure.girls}
                        previousValue={previousMeasure.girls}
                        colorClass="text-orange-600"

                    />
                    <StatRow
                        icon={UserX}
                        label="Others"
                        currentValue={currentMeasure.others}
                        previousValue={previousMeasure.others}
                        colorClass="text-gray-600"
                    />
                </div>
            </div>
        </Card>
    );
};
