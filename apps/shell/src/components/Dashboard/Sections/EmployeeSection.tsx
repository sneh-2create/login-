import React, { useMemo, useState } from 'react';
import { useSession } from '@od-erp/store';
import { useAppSelector } from '@od-erp/store';
import { useEmployeeDashboardData, useHrmMaster } from '@od-erp/query';
import { Card, LoadingState } from '@od-erp/ui';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { EmployeeStatsCard } from '../hod/EmployeeStatsCard';
import { DepartmentChart } from '../hod/DepartmentChart';
import { BirthdayList } from '../hod/BirthdayList';
import { AttendancePieChart } from '../hod/AttendancePieChart';
import { StatCard } from '../hod/StatCard';
import { TaskCard } from '../hod/TaskCard';
import { LeaveRequestTable } from '../hod/LeaveRequestTable';
import { TaskListTable } from '../hod/TaskListTable';
import { TodayAttendanceTable } from '../hod/TodayAttendanceTable';
import { RefreshCcw, UserCheck, FileText, Clock, Bus, MapPin } from 'lucide-react';

export const EmployeeSection: React.FC = () => {
    const { session } = useSession();
    const { permissions, entityDetails } = useAppSelector((state) => state.auth);

    // Permission check
    const hasPermission = permissions?.includes('employeeDashboard');

    // Extract preferences
    const {
        leaveCycleName,
        leaveCycleStartDate,
        leaveCycleEndDate
    } = entityDetails?.entityPreferences || {};

    const entityId = entityDetails?.id || session?.user?.id || '';
    const currentSession = entityDetails?.activeSession?.name || '';

    // Safety check for required params
    // Note: Some params might be optional in API but we want to ensure basic session/entity are present.
    // Reducing strictness on leaveCycleName to see if it fixes initial load issues, assuming API handles defaults or it loads late.
    const canFetch = !!entityId && !!currentSession && hasPermission;

    const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>('');

    // Fetch Master Data for Filter
    const { data: hrmMasterData } = useHrmMaster(entityId, canFetch);
    const employeeTypes = hrmMasterData?.employeeTypes || [];

    const { data, isLoading, refetch } = useEmployeeDashboardData(
        entityId,
        currentSession,
        leaveCycleName || '', // Pass empty if not ready, query might handle it
        leaveCycleStartDate || '',
        leaveCycleEndDate || '',
        selectedEmployeeType || undefined, // employeeType
        canFetch
    );

    // Force refetch when dependencies that might be late identifiers (like leaveCycleName) change
    // This ensures that if the query ran with empty values initially, it re-runs when they populate.
    React.useEffect(() => {
        if (canFetch && leaveCycleName) {
            refetch();
        }
    }, [canFetch, leaveCycleName, refetch]);


    const chartData = useMemo(() => {
        return data?.groupByEmployeeType || [];
    }, [data]);

    const colors = ['#41A6ED', '#FCB965', '#35C87C', '#FE6C8A', '#761137', '#6c757d', '#17a2b8', '#ffc107'];

    if (!hasPermission) return null;

    if (isLoading && !data) { // Only show loading if we don't have data yet
        return <LoadingState />;
    }

    // Default values if data is missing
    const headCount = data?.headCount?.[0] || {
        totalEmployees: 0,
        male: 0,
        female: 0,
        others: 0,
        newJoinee: 0,
        newJoineeMale: 0,
        newJoineeFemale: 0,
        newJoineeOthers: 0
    };

    // Summary Counts
    const punchedIn = data?.punchInCount?.[0]?.count || 0;
    const totalLeaves = data?.leaveCount?.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const totalAR = data?.arCount?.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const totalOD = data?.odCount?.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const totalLA = data?.laCount?.reduce((acc, curr) => acc + curr.count, 0) || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans mt-8 pb-8">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold text-gray-800">Human Resource</h1>
                <div className="flex items-center gap-4">
                    <select
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={selectedEmployeeType}
                        onChange={(e) => setSelectedEmployeeType(e.target.value)}
                    >
                        <option value="">All Employee Types</option>
                        {employeeTypes.map((type) => (
                            <option key={type._id} value={type.name}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => refetch()}
                        title="Refresh"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    >
                        <RefreshCcw size={20} className="text-gray-500 hover:text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Row 1: Employee Statistics & Headcounts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 p-6 min-h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            Employee Statistics <span className="text-gray-500 font-normal">(Employee Type Wise)</span>
                        </h3>
                    </div>
                    <div className="h-[320px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="employeeType" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                                <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-40 opacity-50 mb-4" />
                                <p>No Data Available</p>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="flex flex-col gap-6 h-full">
                    <EmployeeStatsCard
                        title="Employee Headcount"
                        total={headCount.totalEmployees}
                        male={headCount.male}
                        female={headCount.female}
                        others={headCount.others}
                        backgroundColor="bg-[#FFF8DD]"
                        className="flex-1"
                    />

                    <EmployeeStatsCard
                        title="New Joinings"
                        total={headCount.newJoinee}
                        male={headCount.newJoineeMale}
                        female={headCount.newJoineeFemale}
                        others={headCount.newJoineeOthers}
                        backgroundColor="bg-[#CCFBF1]"
                        className="flex-1"
                    // For new joinings, male% = (male/total_new)*100.
                    // The component handles % calc based on 'total' prop.
                    />
                </div>
            </div>

            {/* Row 2: Department Stats, Birthdays, Attendance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[400px]">
                <DepartmentChart data={data?.groupByDepartment || []} colors={colors} />
                <BirthdayList employees={data?.birthdayEmployees || []} />
                <AttendancePieChart data={data?.attendanceCount || []} />
            </div>

            {/* Row 3: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Task Card - Spans 1 column but acts as summary */}
                <div className="row-span-2 md:col-span-1">
                    <TaskCard data={data?.dueTask!} />
                </div>

                {/* Stats Grid */}
                <div className="md:col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Employees Punched In Today"
                        total={punchedIn}
                        icon={UserCheck}
                        colorTheme="green"
                    />
                    <StatCard
                        title="Attendance Regularization"
                        total={totalAR}
                        items={data?.arCount?.map(i => ({ status: i.status, count: i.count }))}
                        icon={Clock}
                        colorTheme="blue"
                    />
                    <StatCard
                        title="Leaves"
                        total={totalLeaves}
                        items={data?.leaveCount?.map(i => ({ status: i.leaveStatus, count: i.count }))}
                        icon={FileText}
                        colorTheme="orange"
                    />
                    <StatCard
                        title="OD Count"
                        total={totalOD}
                        items={data?.odCount?.map(i => ({ status: i.status, count: i.count }))}
                        icon={Bus}
                        colorTheme="purple"
                    />
                    <StatCard
                        title="Late Arrival Count"
                        total={totalLA}
                        items={data?.laCount?.map(i => ({ status: i.status, count: i.count }))}
                        icon={MapPin}
                        colorTheme="red"
                    />
                </div>
            </div>

            {/* Row 4: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <LeaveRequestTable data={data?.leaveList || []} />
                <TaskListTable data={data?.taskList || []} />
            </div>

            <div className="h-[400px]">
                <TodayAttendanceTable data={data?.punchDataEmployees || []} />
            </div>
        </div>
    );
};
