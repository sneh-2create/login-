// @ts-nocheck
import React from 'react';
import { Card } from '@od-erp/ui';
import { EmployeeDepartmentCount } from '@od-erp/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DepartmentChartProps {
    data: EmployeeDepartmentCount[];
    colors: string[];
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({ data, colors }) => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <Card className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                Employee Statistics <span className="text-gray-500 font-normal">(Department Wise)</span>
            </h3>
            {data.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-between h-full gap-4">
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="count"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [value, 'Employees']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-xl font-bold text-gray-800">{total}</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-200">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 py-1">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-sm text-gray-600 truncate flex-1" title={item.department}>
                                    {item.department || 'Unknown'}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <img src="/assets/images/dataNotFound.png" alt="No Data" className="h-32 opacity-50 mb-2" />
                    <span className="text-sm">No Data Found</span>
                </div>
            )}
        </Card>
    );
};
