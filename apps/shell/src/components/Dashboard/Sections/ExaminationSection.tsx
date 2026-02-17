import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@od-erp/store';
import { useExaminationDashboard } from '@od-erp/query';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend
} from 'recharts';
import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';

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

    const { data, isLoading, refetch } = useExaminationDashboard(
        entityId,
        session,
        hasPermission('examinationDashboard')
    );

    // ... (skipping lines)

    <Legend verticalAlign="top" align="right" height={36} />

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



    // State for Subject Course Navigation
    const [selectedSubjectCourseIndex, setSelectedSubjectCourseIndex] = useState(0);

    const groupByCourseSubject = data?.groupByCourseSubject || [];

    // Sort subject courses by _id (Course Name)
    const sortedSubjectCourses = useMemo(() => {
        return [...groupByCourseSubject].sort((a, b) => a._id.localeCompare(b._id));
    }, [groupByCourseSubject]);

    const currentSubjectCourseData = sortedSubjectCourses[selectedSubjectCourseIndex];

    const handlePrevSubjectCourse = () => {
        if (selectedSubjectCourseIndex > 0) {
            setSelectedSubjectCourseIndex(prev => prev - 1);
        }
    };

    const handleNextSubjectCourse = () => {
        if (selectedSubjectCourseIndex < sortedSubjectCourses.length - 1) {
            setSelectedSubjectCourseIndex(prev => prev + 1);
        }
    };

    // Prepare Subject Chart Data
    const subjectChartData = useMemo(() => {
        if (!currentSubjectCourseData) return [];

        const isGroup1 = ['college', 'university', 'degreeCollege', 'academy'].includes(entityType);

        return currentSubjectCourseData.subjectData.map(subject => {
            const baseData = {
                subjectName: subject.subjectName,
                // Common fields
                '0-40%': subject.count0to40,
                '41-60%': subject.count41to60,
                '61-80%': isGroup1 ? (subject.count61to80 || 0) : 0, // specific to group 1
                '81-100%': isGroup1 ? (subject.count81to100 || 0) : 0, // specific to group 1
            };

            if (!isGroup1) {
                // School specific fields
                return {
                    ...baseData,
                    '61-70%': subject.count61to70 || 0,
                    '71-80%': subject.count71to80 || 0,
                    '81-90%': subject.count81to90 || 0,
                    '91-100%': subject.count91to100 || 0,
                };
            }
            return baseData;
        });
    }, [currentSubjectCourseData, entityType]);

    const isGroup1Entity = ['college', 'university', 'degreeCollege', 'academy'].includes(entityType);

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

            {/* Range Wise Percentage In Subject Of Standard */}
            <div className="bg-white p-6 rounded-[6px] mt-6" style={{ boxShadow: THEME.shadow }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Range Wise Percentage In Subject Of Standard</h3>
                    {/* Subject Course Switcher */}
                    {sortedSubjectCourses.length > 0 && (
                        <div className="flex items-center bg-gray-800 rounded-full px-4 py-1.5 space-x-4">
                            <ChevronLeft
                                size={20}
                                className={`text-white cursor-pointer hover:text-gray-300 transition-colors ${selectedSubjectCourseIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePrevSubjectCourse}
                            />
                            <span className="text-white font-medium min-w-[100px] text-center truncate max-w-[200px]">
                                {currentSubjectCourseData?._id}
                            </span>
                            <ChevronRight
                                size={20}
                                className={`text-white cursor-pointer hover:text-gray-300 transition-colors ${selectedSubjectCourseIndex === sortedSubjectCourses.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleNextSubjectCourse}
                            />
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">Loading...</div>
                ) : (subjectChartData.length > 0) ? (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={subjectChartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <XAxis dataKey="subjectName" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: any) => [value, 'Students']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="top" align="center" height={36} />

                                <Bar dataKey="0-40%" fill={THEME.pinkDark} radius={[5, 5, 0, 0]} />
                                <Bar dataKey="41-60%" fill={THEME.blueDark} radius={[5, 5, 0, 0]} />

                                {isGroup1Entity ? (
                                    <>
                                        <Bar dataKey="61-80%" fill={THEME.greenDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="81-100%" fill={THEME.orangeDark} radius={[5, 5, 0, 0]} />
                                    </>
                                ) : (
                                    <>
                                        <Bar dataKey="61-70%" fill={THEME.greenDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="71-80%" fill={THEME.orangeDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="81-90%" fill={THEME.yellowLight} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="91-100%" fill={THEME.brownLight} radius={[5, 5, 0, 0]} />
                                    </>
                                )}
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

            {/* Standard - Wise Marks ( In % ) Comparison */}
            <div className="bg-white p-6 rounded-[6px] mt-6" style={{ boxShadow: THEME.shadow }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Standard - Wise Marks ( In % ) Comparison</h3>
                    <button onClick={() => refetch()} title="Refresh" className="focus:outline-none">
                        <RefreshCcw
                            size={20}
                            className={`text-gray-500 hover:text-gray-700 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
                {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">Loading...</div>
                ) : (sortedCourses.length > 0) ? (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sortedCourses.map(course => {
                                    const baseData = {
                                        course: course.course,
                                        '0-40%': course.percentage0to40,
                                        '41-60%': course.percentage41to60,
                                    };
                                    if (isGroup1Entity) {
                                        // Special colors for Group 1 in this specific chart
                                        // 0-40%: #FFBC5B (Orange/Yellow) vs Theme Pink
                                        // 41-60%: #3983BD (Blue) vs Theme Blue
                                        // 61-80%: #FF224F (Red/Pink) vs Theme Green
                                        // 81-100%: #D1FFF3 (Light Blue) vs Theme Orange
                                        return {
                                            ...baseData,
                                            '61-80%': course.percentage61to80,
                                            '81-100%': course.percentage81to100,
                                        };
                                    } else {
                                        return {
                                            ...baseData,
                                            '61-70%': course.percentage61to70,
                                            '71-80%': course.percentage71to80,
                                            '81-90%': course.percentage81to90,
                                            '91-100%': course.percentage91to100,
                                        }
                                    }
                                })}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <XAxis dataKey="course" />
                                <YAxis label={{ value: 'Percentages', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    formatter={(value: any) => [`${value}%`, 'Percentage']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="top" align="right" height={36} />

                                {isGroup1Entity ? (
                                    <>
                                        <Bar dataKey="0-40%" fill="#FFBC5B" radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="41-60%" fill="#3983BD" radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="61-80%" fill="#FF224F" radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="81-100%" fill="#D1FFF3" stroke="#BEF0CB" strokeWidth={1} radius={[5, 5, 0, 0]} />
                                    </>
                                ) : (
                                    <>
                                        <Bar dataKey="0-40%" fill={THEME.pinkDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="41-60%" fill={THEME.blueDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="61-70%" fill={THEME.greenDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="71-80%" fill={THEME.orangeDark} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="81-90%" fill={THEME.yellowLight} radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="91-100%" fill={THEME.brownLight} radius={[5, 5, 0, 0]} />
                                    </>
                                )}
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
