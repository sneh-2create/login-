import React from 'react';
import { Card, cn } from '@od-erp/ui';
import { User, UserCheck, UserX } from 'lucide-react';

interface StudentData {
    total: number;
    boys: number;
    girls: number;
    others: number;
    percentageBoys?: number;
    percentageGirls?: number;
    percentageOthers?: number;
}

interface StudentStatusCardProps {
    title: string;
    data: StudentData;
    type: 'active' | 'inactive';
    loading?: boolean;
}

export const StudentStatusCard: React.FC<StudentStatusCardProps> = ({ title, data, type, loading }) => {
    const isActive = type === 'active';
    const bgColor = isActive ? 'bg-emerald-50/50' : 'bg-blue-50/50';
    const barColorBoys = isActive ? 'bg-[#03CEA4]' : 'bg-[#5065FE]';
    const barColorGirls = isActive ? 'bg-[#b26836]' : 'bg-[#b26836]'; // Check if different
    const barColorOthers = isActive ? 'bg-[#121331]' : 'bg-[#121331]';

    if (loading) {
        return (
            <Card className={cn("h-64 animate-pulse bg-gray-100 p-4 border-none shadow-none", bgColor)}>
                <div className="h-full w-full"></div>
            </Card>
        );
    }

    return (
        <Card className={cn("border-none shadow-[0px_0px_10px_-2px_#0000001A] h-full", bgColor)}>
            <div className="p-6 pb-2">
                <h6 className="text-sm font-semibold text-gray-500">{title}</h6>
                <h4 className="text-xl font-bold mt-1">Total : {data.total}</h4>
            </div>
            <div className="p-6 pt-4">
                <div className="flex justify-between items-end gap-2">
                    {/* Boys */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="flex flex-col items-center justify-end h-32 w-full">
                            <UserCheck className={cn("w-8 h-8 mb-2", isActive ? "text-[#03CEA4]" : "text-[#5065FE]")} />
                            <div
                                className={cn("w-8 rounded-t-sm transition-all duration-500", barColorBoys)}
                                style={{ height: `${Math.max(data.percentageBoys || 0, 5)}px` }} // Min height for visibility
                            ></div>
                        </div>
                        <div className="text-center">
                            <h6 className="text-xs font-semibold text-gray-600">Boys</h6>
                            <h6 className="text-[10px] text-gray-500 font-medium">
                                {data.boys} {isActive && `(${data.percentageBoys}%)`}
                            </h6>
                        </div>
                    </div>

                    {/* Girls */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="flex flex-col items-center justify-end h-32 w-full">
                            <User className={cn("w-8 h-8 mb-2", "text-[#b26836]")} />
                            <div
                                className={cn("w-8 rounded-t-sm transition-all duration-500", barColorGirls)}
                                style={{ height: `${Math.max(data.percentageGirls || 0, 5)}px` }}
                            ></div>
                        </div>
                        <div className="text-center">
                            <h6 className="text-xs font-semibold text-gray-600">Girls</h6>
                            <h6 className="text-[10px] text-gray-500 font-medium">
                                {data.girls} {isActive && `(${data.percentageGirls}%)`}
                            </h6>
                        </div>
                    </div>

                    {/* Others */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="flex flex-col items-center justify-end h-32 w-full">
                            <UserX className={cn("w-8 h-8 mb-2", "text-[#121331]")} />
                            <div
                                className={cn("w-8 rounded-t-sm transition-all duration-500", barColorOthers)}
                                style={{ height: `${Math.max(data.percentageOthers || 0, 5)}px` }}
                            ></div>
                        </div>
                        <div className="text-center">
                            <h6 className="text-xs font-semibold text-gray-600">Others</h6>
                            <h6 className="text-[10px] text-gray-500 font-medium">
                                {data.others} {isActive && `(${data.percentageOthers}%)`}
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
