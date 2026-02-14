import React from 'react';
import { Card } from '@od-erp/ui';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { StudentCourseStrength } from '@od-erp/types';

interface StudentStrengthChartProps {
    data: StudentCourseStrength[];
    loading?: boolean;
}

export const StudentStrengthChart: React.FC<StudentStrengthChartProps> = ({ data, loading }) => {

    return (
        <Card className="p-4 h-full bg-white flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Student Strength Standard Wise</h3>
            </div>

            <div className="flex-1 w-full min-h-[300px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="course"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                label={{ value: 'No. Of Students', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                align="right"
                                verticalAlign="top"
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Bar
                                dataKey="awakeStudents"
                                name="Awake"
                                stackId="a"
                                fill="#FFDB00"
                                radius={[0, 0, 4, 4]}
                                barSize={40}
                            />
                            <Bar
                                dataKey="dormantStudents"
                                name="Dormant"
                                stackId="a"
                                fill="#FF3796"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    );
};
