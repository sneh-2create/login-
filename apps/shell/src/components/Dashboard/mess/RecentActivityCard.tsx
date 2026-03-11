import React from 'react';
import { Card } from '@od-erp/ui';
import { RecentActivity } from '@od-erp/types';
import { format } from 'date-fns';

interface RecentActivityCardProps {
    activities: RecentActivity[];
}

const badgeColors = ["bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-gray-500"];

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
    activities,
}) => {
    return (
        <Card className="h-full border-none shadow-sm">
            <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.map((activity, index) => (
                        <div key={index} className="flex gap-3">
                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${badgeColors[index % badgeColors.length]}`} />
                            <div className="flex-1 space-y-1">
                                <div className="text-sm text-gray-900">
                                    {activity.attendanceType === 'manual' ? (
                                        <>
                                            Manual Entry added of <span className="font-medium">{activity.name}</span>
                                            {activity.studentDetails?.id && <span> - {activity.studentDetails.id}</span>}
                                            {' '}for <span className="font-medium">{activity.foodTypeName}</span>
                                        </>
                                    ) : activity.attendanceType === 'qr' ? (
                                        <>
                                            QR code scanned by <span className="font-medium">{activity.name}</span>
                                            {' '}for <span className="font-medium">{activity.foodTypeName}</span>
                                        </>
                                    ) : (
                                        <span>{activity.foodTypeName} entry for {activity.name}</span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {format(new Date(activity.date), 'dd/MMM/yyyy')}
                                </div>
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No recent activity
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
