import React, { useState, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useInstituteAttendanceSummary } from '@od-erp/query';
import { AttendanceInstituteSummary } from '@od-erp/types';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { RefreshCcw } from 'lucide-react';
import { cn } from '@od-erp/ui';
import { AppliedLeavesSection } from './AppliedLeavesSection';


const THEME = {
    blueDark: '#41A6ED', // Leave
    orangeDark: '#FCB965', // Present
    greenDark: '#35C87C', // Absent
    pinkDark: '#FE6C8A', // Not Marked
    shadow: '0px 0px 10px -2px #0000001A',
};

export const AttendanceSection: React.FC = () => {
    const { permissions, entityDetails } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    // Date Calculation: Start and End of today
    const { startDate, endDate } = useMemo(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { startDate: start.getTime(), endDate: end.getTime() };
    }, []);

    const todayFormatted = useMemo(() => {
        return new Date().toLocaleDateString('en-GB');
    }, []);

    const hasPermission = (perm: string) => permissions?.includes(perm);
    const shouldShow = hasPermission('attendanceDashboard');

    const { data, isLoading, refetch } = useInstituteAttendanceSummary(
        entityId,
        session,
        startDate,
        endDate,
        shouldShow
    );

    const [activeTab, setActiveTab] = useState<'pending' | 'taken'>('pending');

    const { chartData, pendingList, takenList, totalStudents } = useMemo(() => {
        if (!data) return { chartData: [], pendingList: [], takenList: [], totalStudents: 0 };

        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLeave = 0;
        let totalNotMarked = 0;

        const pending: AttendanceInstituteSummary[] = [];
        const taken: AttendanceInstituteSummary[] = [];

        data.forEach(item => {
            totalPresent += item.totalPresent || 0;
            totalAbsent += item.totalAbsent || 0;
            totalLeave += item.totalLeave || 0;
            totalNotMarked += item.totalNotMarked || 0;

            if ((item.totalNotMarked || 0) > 0) {
                pending.push(item);
            } else {
                taken.push(item);
            }
        });

        const chartData = [
            { name: 'Present', value: totalPresent, color: THEME.orangeDark },
            { name: 'Absent', value: totalAbsent, color: THEME.greenDark },
            { name: 'Leave', value: totalLeave, color: THEME.blueDark },
            { name: 'Not Marked', value: totalNotMarked, color: THEME.pinkDark },
        ];

        return {
            chartData,
            pendingList: pending,
            takenList: taken,
            totalStudents: totalPresent + totalAbsent + totalLeave + totalNotMarked
        };
    }, [data]);

    if (!shouldShow) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans mt-8">
            <div className="bg-white p-6 rounded-[6px]" style={{ boxShadow: THEME.shadow }}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Today's Student Attendance</h3>
                    <button onClick={() => refetch()} title="Refresh" className="focus:outline-none">
                        <RefreshCcw
                            size={20}
                            className={`text-gray-500 hover:text-gray-700 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>

                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">Loading...</div>
                ) : (totalStudents > 0) ? (
                    <div className="flex flex-col gap-8">
                        {/* Chart Section */}
                        <div className="w-full flex flex-col items-center">
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => [value, 'Students']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-gray-800">{totalStudents}</span>
                                    <span className="text-xs text-gray-500">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mt-4">
                                {chartData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="w-full flex flex-col">
                            {/* Tabs */}
                            <div className="flex space-x-4 mb-4">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={cn(
                                        'px-6 py-2 text-sm font-medium rounded-lg transition-all',
                                        activeTab === 'pending'
                                            ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    )}
                                >
                                    Attendance Pending
                                </button>
                                <button
                                    onClick={() => setActiveTab('taken')}
                                    className={cn(
                                        'px-6 py-2 text-sm font-medium rounded-lg transition-all',
                                        activeTab === 'taken'
                                            ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    )}
                                >
                                    Attendance Taken
                                </button>
                            </div>

                            {/* Table Container */}
                            <div className="bg-white border rounded-lg shadow-sm p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-md font-bold text-gray-800">
                                        {activeTab === 'pending' ? 'Attendance Pending Classwise Details' : 'Attendance Taken Classwise Details'}
                                    </h4>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        Date:{todayFormatted} <RefreshCcw size={14} className="cursor-pointer hover:text-gray-700" onClick={() => refetch()} />
                                    </span>
                                </div>

                                <div className="overflow-auto max-h-[400px]">
                                    <table className="min-w-full">
                                        <thead className="bg-[#1e537e] text-white sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Courses</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Stream</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Batch</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Section</th>
                                                {activeTab === 'pending' ? (
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg">NM</th>
                                                ) : (
                                                    <>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">P</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">A</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg">L</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(activeTab === 'pending' ? pendingList : takenList).map((item, idx) => (
                                                <tr key={idx} className="even:bg-[#dbeafe] odd:bg-white hover:bg-blue-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.course}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.stream}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.batch || 'NA'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.section}</td>
                                                    {activeTab === 'pending' ? (
                                                        <td className="px-4 py-3 text-center text-sm font-bold text-gray-800">
                                                            {item.totalNotMarked}
                                                        </td>
                                                    ) : (
                                                        <>
                                                            <td className="px-4 py-3 text-center text-sm font-medium text-green-600">{item.totalPresent}</td>
                                                            <td className="px-4 py-3 text-center text-sm font-medium text-red-500">{item.totalAbsent}</td>
                                                            <td className="px-4 py-3 text-center text-sm font-medium text-blue-500">{item.totalLeave}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                            {(activeTab === 'pending' ? pendingList : takenList).length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                        No records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                        <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                        <p>No Data Available</p>
                    </div>
                )}
            </div>

            {/* Applied Leaves Section */}
            <AppliedLeavesSection />
        </div>
    );
};
