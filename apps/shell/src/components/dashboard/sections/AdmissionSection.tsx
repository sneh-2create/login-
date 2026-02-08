import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useAdmissionDashboardData } from '@od-erp/query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Label
} from 'recharts';
import {
    FileText,
    Users,
    UserCheck,
    Clock,
} from 'lucide-react';
import { AdmissionSourceCount } from '@od-erp/types';

// Exact Angular Colors from SCSS
const THEME = {
    blueLite: '#E6F5FA',
    blueDark: '#41A6ED',
    orangeLite: '#FEF0D8',
    orangeDark: '#FCB965',
    greenLite: '#EBFFF3',
    greenDark: '#35C87C',
    pinkLite: '#FFE2F2',
    pinkDark: '#FE6C8A',
    black: 'black',
    white: '#ffffff',
    borderColor: '#D3D2D2',
    textGray: '#00000099',
    textLightGray: '#BEBEBE',
    shadow: '0px 0px 10px -2px #0000001A',

    // Chart Colors
    greendarkSecondaryColor: '#a2e8c5',
};

const COLORS_ARRAY = [
    '#41A6ED',
    '#FCB965',
    '#35C87C',
    '#FE6C8A',
    '#761137',
    '#1F8A70',
    '#62374E',
    '#3C2317',
    '#ECC5FB',
    '#21E6C1'
];

interface CustomCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    bgColor: string;
    iconColor: string; // The "dark" version of the color
    isLoading?: boolean;
}

const CustomCard: React.FC<CustomCardProps> = ({ title, value, icon: Icon, bgColor, iconColor, isLoading }) => {
    return (
        <div
            className="h-full w-full rounded-[14px] p-[18px] transition-all duration-300 hover:shadow-lg"
            style={{
                backgroundColor: bgColor,
                boxShadow: THEME.shadow
            }}
        >
            {isLoading ? (
                <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Top Row: Value on Right, Icon Box on Right (Matching Angular d-flex flex-row-reverse logic) */}
                    <div className="flex items-center justify-end mb-4">
                        <h4 className="text-[24px] font-bold text-black ml-4 leading-none">{value}</h4>
                        <div
                            className="flex items-center justify-center rounded-[10px] bg-white p-[7px] h-[40px] w-[40px]"
                        >
                            <Icon size={24} color={iconColor} strokeWidth={2} />
                        </div>
                    </div>

                    <div className="mt-auto">
                        <h4 className="text-[16px] font-normal text-opacity-60 text-black leading-tight">
                            {title}
                        </h4>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AdmissionSection: React.FC = () => {
    const { permissions, entityDetails, preferences } = useAppSelector((state: any) => state.auth);
    const [admissionSession, setAdmissionSession] = useState<string>('');
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    useEffect(() => {
        if (preferences?.admissionSession) {
            setAdmissionSession(preferences.admissionSession);
        } else if (entityDetails?.activeSession?.name) {
            setAdmissionSession(entityDetails.activeSession.name);
        }
    }, [preferences, entityDetails]);

    const hasPermission = (perm: string) => permissions?.includes(perm);

    const { data: dashboardData, isLoading: isDashboardLoading } = useAdmissionDashboardData(
        entityId,
        session,
        admissionSession,
        !!(hasPermission('admissionDashboard') && admissionSession)
    );

    // useAdmissionStageCount is redundant as data is included in dashboardData

    if (!hasPermission('admissionDashboard')) {
        return null;
    }

    const counts = dashboardData?.admissionCounts?.[0];
    const sourceData = dashboardData?.enquiriesBySource || [];
    const courseData = dashboardData?.enquiriesByCourse || [];
    const validStageData = dashboardData?.stageWiseCount || [];

    const totalSourceEnquiry = useMemo(() => {
        return sourceData.reduce((acc: number, curr: AdmissionSourceCount) => acc + curr.count, 0);
    }, [sourceData]);

    const CustomLabel = ({ viewBox }: any) => {
        const { cx, cy } = viewBox;
        return (
            <g>
                <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#374151" className="text-sm font-medium">
                    Total
                </text>
                <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#111827" className="text-2xl font-bold">
                    {totalSourceEnquiry}
                </text>
            </g>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            {/* DEBUG INFO - REMOVE LATER */}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <div>
                        <h2 className="text-[26px] font-bold text-gray-800 leading-none">Admission</h2>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 block text-center uppercase tracking-wider">Admission Session</span>
                    <span className="text-md font-bold text-gray-800 block text-center">{admissionSession}</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CustomCard
                    title="Today's New Enquiries"
                    value={counts?.dailyEnquiries || 0}
                    icon={FileText}
                    bgColor={THEME.orangeLite}
                    iconColor={THEME.orangeDark}
                    isLoading={isDashboardLoading}
                />
                <CustomCard
                    title="Total Pending Enquiries"
                    value={counts?.totalPendingEnquiries || 0}
                    icon={Clock}
                    bgColor={THEME.blueLite}
                    iconColor={THEME.blueDark}
                    isLoading={isDashboardLoading}
                />
                <CustomCard
                    title="Today's New Admission"
                    value={counts?.dailyAdmissions || 0}
                    icon={UserCheck}
                    bgColor={THEME.greenLite}
                    iconColor={THEME.greenDark}
                    isLoading={isDashboardLoading}
                />
                <CustomCard
                    title="Total New Admission"
                    value={counts?.totalAdmissions || 0}
                    icon={Users}
                    bgColor={THEME.pinkLite}
                    iconColor={THEME.pinkDark}
                    isLoading={isDashboardLoading}
                />
            </div>

            {/* Middle Section: Admission Stages & Source Wise */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Admission Stage Chart (Left - 8 cols) */}
                <div className="lg:col-span-8 bg-white p-6 rounded-[6px]" style={{ boxShadow: THEME.shadow }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Admission Data</h3>
                    </div>
                    {isDashboardLoading ? (
                        <div className="h-[400px] flex items-center justify-center">Loading...</div>
                    ) : validStageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={validStageData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="stage"
                                    width={100}
                                    tick={{ fontSize: 13, fill: '#666', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={THEME.pinkDark}
                                    radius={4}
                                    barSize={18}
                                    background={{ fill: '#FFF2F6', radius: 4 }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                            <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                            <p>No Data Found</p>
                        </div>
                    )}
                </div>

                {/* Source Wise Enquiry (Right - 4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-[6px]" style={{ boxShadow: THEME.shadow }}>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Source Wise<br />Admission Enquiry</h3>

                    {/* Legend Grid */}
                    {sourceData.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 my-4 px-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                            {sourceData.map((entry: AdmissionSourceCount, index: number) => (
                                <div key={entry.source} className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS_ARRAY[index % COLORS_ARRAY.length] }}
                                    />
                                    <span className="text-xs text-gray-600 truncate" title={entry.source}>{entry.source}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {isDashboardLoading ? (
                        <div className="h-[250px] flex items-center justify-center">Loading...</div>
                    ) : sourceData.length > 0 ? (
                        <div style={{ width: '100%', height: '250px', display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={2}
                                        dataKey="count"
                                        nameKey="source"
                                    >
                                        {sourceData.map((_entry: AdmissionSourceCount, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_ARRAY[index % COLORS_ARRAY.length]} />
                                        ))}
                                        <Label content={<CustomLabel />} position="center" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
                            <p>No Data Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Course Wise Enquiry */}
            <div className="bg-white p-8 rounded-[6px]" style={{ boxShadow: THEME.shadow }}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Admission Enquiry Course Wise</h3>
                    <h3 className="text-lg font-bold text-gray-800 hidden md:block">No. Of Students</h3>
                </div>
                {isDashboardLoading ? (
                    <div className="h-[400px] flex items-center justify-center">Loading...</div>
                ) : courseData.length > 0 ? (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey="course"
                                    tick={{ fontSize: 11, fill: '#000' }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#000' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Bar
                                    dataKey="total"
                                    name="Total"
                                    fill={THEME.greenDark}
                                    radius={4}
                                    barSize={24}
                                />
                                <Bar
                                    dataKey="approved"
                                    name="Approved"
                                    fill={THEME.greendarkSecondaryColor}
                                    radius={4}
                                    barSize={24}
                                    stroke={THEME.greenDark}
                                    strokeWidth={2}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                        <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                        <p>No Data Found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
