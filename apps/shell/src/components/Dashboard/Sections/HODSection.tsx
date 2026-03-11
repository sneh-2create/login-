import React, { useState } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useHodDashboardData, useHrmMaster, useActiveEmployee } from '@od-erp/query';
import { EmployeeStatsCard } from '../hod/EmployeeStatsCard';
import { EventList } from '../hod/EventList';
import { AttendanceChart } from '../hod/AttendanceChart';
import { RequestCards } from '../hod/RequestCards';
import { LeaveTable } from '../hod/LeaveTable';
import { AttendanceTable } from '../hod/AttendanceTable';
import { Loader2 } from 'lucide-react';

export const HODSection: React.FC = () => {
    const { permissions, entityDetails, user } = useAppSelector((state: any) => state.auth);
    // console.log('DEBUG: User object:', user);

    // entityPreferences might be inside entityDetails or directly on auth state depending on store structure
    // Based on AdmissionSection, it uses state.auth.preferences (if any) or entityDetails
    const preferences = useAppSelector((state: any) => state.auth.preferences || state.auth.entityPreferences);

    const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string | undefined>(undefined);

    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';
    const userId = user?.id || '';

    // Try to get employee ID from user object first
    const userEmployeeId = user?.employeeId || user?.employee_id;

    const hasPermission = (perm: string) => permissions?.includes(perm);
    const canViewDashboard = hasPermission('getHODDashboard');

    // If userEmployeeId is missing, try to fetch active employee record
    const { data: activeEmployeeData, isLoading: isActiveEmployeeLoading } = useActiveEmployee(
        userId,
        canViewDashboard && !userEmployeeId && !!userId
    );

    // Determine final hodEmployee ID
    // Note: activeEmployee API might return an object with _id or id as the employee ID.
    // Assuming activeEmployeeData is the employee object.
    const fetchedEmployeeId = activeEmployeeData?._id || activeEmployeeData?.id;
    const hodEmployee = userEmployeeId || fetchedEmployeeId || '';

    // Extract leave cycle details
    // Fallback values or safe access
    const leaveCycleName = preferences?.leaveCycleName || '';
    const leaveCycleStartDate = preferences?.leaveCycleStartDate || '';
    const leaveCycleEndDate = preferences?.leaveCycleEndDate || '';

    const { data: dashboardData, isLoading: isDashboardLoading } = useHodDashboardData(
        entityId,
        session,
        leaveCycleName,
        leaveCycleStartDate,
        leaveCycleEndDate,
        hodEmployee,
        employeeTypeFilter,
        canViewDashboard && !!entityId && !!session && !!hodEmployee
    );

    const { data: hrmMaster } = useHrmMaster(entityId, canViewDashboard && !!entityId);

    if (!canViewDashboard) {
        return (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">You do not have permission to view the HOD Dashboard.</p>
            </div>
        );
    }

    if (isActiveEmployeeLoading || isDashboardLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Safely destructure or provide defaults
    const {
        headCount = { total: 0, male: 0, female: 0, others: 0, newJoining: 0, newJoiningMale: 0, newJoiningFemale: 0, newJoiningOthers: 0 },
        birthdayEmployees = [],
        attendanceCount = { present: 0, absent: 0, leave: 0, holiday: 0, weeklyOff: 0, unMarked: 0, others: 0, halfDay: 0 },
        arCount = { total: 0, pending: 0, approved: 0, rejected: 0 },
        leaveCount = { total: 0, pending: 0, approved: 0, rejected: 0 },
        laCount = { total: 0, pending: 0, approved: 0, rejected: 0 },
        odCount = { total: 0, pending: 0, approved: 0, rejected: 0 },
        leaveList = [],
        punchDataEmployees = []
    } = dashboardData || {};

    return (
        <div className="space-y-6">
            {/* Top Row: Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EmployeeStatsCard
                    title="Total Employees"
                    total={headCount?.total || 0}
                    male={headCount?.male || 0}
                    female={headCount?.female || 0}
                    others={headCount?.others || 0}
                />
                <EmployeeStatsCard
                    title="New Joinings"
                    total={headCount?.newJoining || 0}
                    male={headCount?.newJoiningMale || 0}
                    female={headCount?.newJoiningFemale || 0}
                    others={headCount?.newJoiningOthers || 0}
                />
                <div className="lg:col-span-1 h-full">
                    <AttendanceChart data={attendanceCount || {}} />
                </div>
                <div className="lg:col-span-1 h-full">
                    {/* Create a tab-like or split view for Birthdays/Anniversaries if needed, or just list birthdays first */}
                    {/* Angular side had 'Current Month Birthday(s) And Anniversaries' */}
                    <EventList
                        title="Birthdays & Anniversaries"
                        events={birthdayEmployees || []}
                        type="birthday"
                    />
                </div>
            </div>

            {/* Middle Row: Request Cards */}
            <RequestCards
                arCount={arCount || { total: 0, pending: 0, approved: 0, rejected: 0 }}
                leaveCount={leaveCount || { total: 0, pending: 0, approved: 0, rejected: 0 }}
                laCount={laCount || { total: 0, pending: 0, approved: 0, rejected: 0 }}
                odCount={odCount || { total: 0, pending: 0, approved: 0, rejected: 0 }}
            />

            {/* Bottom Row: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaveTable leaves={leaveList || []} />
                <AttendanceTable
                    attendance={punchDataEmployees || []}
                    employeeTypes={hrmMaster?.employeeTypes || []}
                    onFilterChange={setEmployeeTypeFilter}
                />
            </div>
        </div>
    );
};
