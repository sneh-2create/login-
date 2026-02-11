import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useExaminationDashboard } from '@od-erp/query';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Exact Angular Colors
const THEME = {
    blueDark: '#41A6ED',
    orangeDark: '#FCB965',
    greenDark: '#35C87C',
    pinkDark: '#FE6C8A',
    black: 'black',
    greenDark2: '#1F8A70', // not used in this specific chart but in others
    yellowLight: '#FCE700',
    brownLight: '#3C2317',
    voiletLight: '#ECC5FB',
    blueLight: '#21E6C1',
    shadow: '0px 0px 10px -2px #0000001A',
};

export const ExaminationSection: React.FC = () => {
    const { permissions, entityDetails, preferences } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';
    const entityType = entityDetails?.entityType || '';

    // State for Course Navigation
    const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);

    useEffect(() => {
        if (preferences?.currentSession) {
            // The angular code uses 'session' from localStorage, which usually corresponds to activeSession or user preference
            // sticking to activeSession from entityDetails for now as per other dashboards
        }
    }, [preferences, entityDetails]);

    const hasPermission = (perm: string) => permissions?.includes(perm);

    const { data, isLoading } = useExaminationDashboard(
        entityId,
        session,
        hasPermission('examinationDashboard')
    );

    if (!hasPermission('examinationDashboard')) {
        return null; // Or return a message? Angular hides it.
    }

    const groupByCourseData = data?.groupByCourse || [];

    // Sort courses by name (matching Angular logic: util.arraySort(this.groupByCourseData,'course'))
    const sortedCourses = useMemo(() => {
        return [...groupByCourseData].sort((a, b) => a.course.localeCompare(b.course));
    }, [groupByCourseData]);

    const currentCourseData = sortedCourses[selectedCourseIndex];

    const handlePrevCourse = () => {
        if (selectedCourseIndex > 0) {
            setSelectedCourseIndex(prev => prev - 1);
        }
    };

    const handleNextCourse = () => {
        if (selectedCourseIndex < sortedCourses.length - 1) {
            setSelectedCourseIndex(prev => prev + 1);
        }
    };

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (!currentCourseData) return [];

        const isGroup1 = ['college', 'university', 'degreeCollege', 'academy'].includes(entityType);

        if (isGroup1) {
            return [
                { name: '0-40%', value: currentCourseData.count0to40, color: THEME.pinkDark },
                { name: '41-60%', value: currentCourseData.count41to60, color: THEME.blueDark },
                { name: '61-80%', value: currentCourseData.count61to80, color: THEME.greenDark },
                { name: '81-100%', value: currentCourseData.count81to100, color: THEME.orangeDark },
            ];
        } else {
            // School and others
            return [
                { name: '0-40%', value: currentCourseData.count0to40, color: THEME.pinkDark },
                { name: '41-60%', value: currentCourseData.count41to60, color: THEME.blueDark },
                { name: '61-70%', value: currentCourseData.count61to70 || 0, color: THEME.greenDark },
                { name: '71-80%', value: currentCourseData.count71to80 || 0, color: THEME.orangeDark },
                { name: '81-90%', value: currentCourseData.count81to90 || 0, color: THEME.yellowLight },
                { name: '91-100%', value: currentCourseData.count91to100 || 0, color: THEME.brownLight },
            ];
        }
    }, [currentCourseData, entityType]);

    // Check if there is data to show (Angular logic: if currentData[0] && currentData[0].count0to40 check? No, actual check is simpler)
    // Angular: if(currentData[0] && currentData[0].count0to40){ showOverallChart = true } else { ... }
    // Actually it checks if count0to40 exists? That seems specific. 
    // Let's check if total value > 0
    const hasData = chartData.some(d => (d.value || 0) > 0);


    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <div>
                        <h2 className="text-[26px] font-bold text-gray-800 leading-none">Examination</h2>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 block text-center uppercase tracking-wider">Session</span>
                    <span className="text-md font-bold text-gray-800 block text-center">{session}</span>
                </div>
            </div>

            {/* Overall Range-Wise Percentage In Standard */}
            <div className="bg-white p-6 rounded-[6px]" style={{ boxShadow: THEME.shadow }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Overall Range-Wise Percentage In Standard</h3>

                    {/* Course Switcher */}
                    {sortedCourses.length > 0 && (
                        <div className="flex items-center bg-gray-800 rounded-full px-4 py-1.5 space-x-4">
                            <ChevronLeft
                                size={20}
                                className={`text-white cursor-pointer hover:text-gray-300 transition-colors ${selectedCourseIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePrevCourse}
                            />
                            <span className="text-white font-medium min-w-[100px] text-center truncate max-w-[200px]">
                                {currentCourseData?.course}
                            </span>
                            <ChevronRight
                                size={20}
                                className={`text-white cursor-pointer hover:text-gray-300 transition-colors ${selectedCourseIndex === sortedCourses.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleNextCourse}
                            />
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">Loading...</div>
                ) : hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Chart */}
                        <div className="h-[300px] w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
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
                        </div>

                        {/* Custom Legend */}
                        <div className="grid grid-cols-2 gap-4">
                            {chartData.map((item, index) => (
                                <div key={index} className="flex flex-col p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                                    <div className="flex items-center mb-1">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-5">{item.value} Students</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                        <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                        <p>No Data Found</p>
                    </div>
                )}
            </div>

            {/* Placeholders for future sections if needed, or just leave empty for now as requested only for this specific chart */}
        </div>
    );
};
