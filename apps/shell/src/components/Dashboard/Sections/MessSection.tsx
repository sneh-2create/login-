import React from 'react';
import { useMessDashboardData } from '@od-erp/query';
import { Users, UserPlus, FileText, Utensils } from 'lucide-react';
import { MessStatsCard } from '../mess/MessStatsCard';
import { MealDistributionCard } from '../mess/MealDistributionCard';
import { RecentActivityCard } from '../mess/RecentActivityCard';



import { useAppSelector } from '@od-erp/store';

export const MessSection: React.FC = () => {
    const { permissions, entityDetails } = useAppSelector((state) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    // Permission check
    const hasPermission = permissions?.includes('getMessMangementDashboard');

    const { data, isLoading, error } = useMessDashboardData(entityId, session, hasPermission);

    console.log('[MessSection] Init', { entityId, session, hasPermission, permissionsLength: permissions?.length });
    console.log('[MessSection] Data State', { isLoading, hasData: !!data, error });

    if (!hasPermission) {
        console.warn('[MessSection] No permission: getMessMangementDashboard');
        return <div className="p-4 text-red-500">No Permission: getMessMangementDashboard</div>;
    }

    if (isLoading) {
        return <div className="p-4 text-center">Loading mess dashboard...</div>;
    }

    if (error) {
        console.error('[MessSection] Error', error);
        return <div className="p-4 text-red-500">Error loading data: {(error as any).message}</div>;
    }

    if (!data) {
        console.warn('[MessSection] No data received');
        return <div className="p-4 text-yellow-500">No Data Available</div>;
    }

    const { overallAnalytics, todayMealDistribution, recentActivity } = data;

    const maxMealCount = (overallAnalytics?.totalRegisteredStudents || 0) + (overallAnalytics?.totalRegisteredEmployees || 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mess Dashboard</h2>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MessStatsCard
                    label="Total Registered Students"
                    count={overallAnalytics?.totalRegisteredStudents || 0}
                    icon={Users}
                />
                <MessStatsCard
                    label="Total Employees"
                    count={overallAnalytics?.totalRegisteredEmployees || 0}
                    icon={UserPlus}
                />
                <MessStatsCard
                    label="Today's Total Entries"
                    count={overallAnalytics?.todaysTotalEntries || 0}
                    icon={FileText}
                />
                <MessStatsCard
                    label="Active Meal Types"
                    count={overallAnalytics?.activeFoodTypeCount || 0}
                    icon={Utensils}
                />
            </div>

            {/* Split View Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-full">
                    <MealDistributionCard
                        distribution={todayMealDistribution || []}
                        maxCount={maxMealCount}
                    />
                </div>
                <div className="h-full">
                    <RecentActivityCard
                        activities={recentActivity || []}
                    />
                </div>
            </div>
        </div>
    );
};
