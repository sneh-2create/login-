import React from 'react';
import { Card, Badge, Select } from '@od-erp/ui';
import { AttendanceLog, HrmMasterResponse } from '@od-erp/types';

interface AttendanceTableProps {
    attendance: AttendanceLog[];
    employeeTypes: HrmMasterResponse['employeeTypes'];
    onFilterChange: (type: string | undefined) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendance, employeeTypes, onFilterChange }) => {

    const options = [
        { label: 'All Types', value: 'all' },
        ...(employeeTypes?.map(type => ({ label: type.name, value: type._id })) || [])
    ];

    return (
        <Card>
            <div className="p-6">
                <div className="flex flex-row items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Today's Employee Attendance</h3>
                    <div className="w-[200px]">
                        <Select
                            options={options}
                            onChange={(e) => {
                                const val = e.target.value;
                                onFilterChange(val === 'all' ? undefined : val);
                            }}
                            placeholder="Filter by Type"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Designation</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">In Time</th>
                                <th className="px-4 py-3">Out Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-4 text-center">No Data Found</td>
                                </tr>
                            ) : (
                                attendance.map((log) => (
                                    <tr key={log._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {log.employee.name}
                                            <div className="text-xs text-gray-400">{log.employee.employeeId}</div>
                                        </td>
                                        <td className="px-4 py-3">{log.employee.designation?.name}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={log.status === 'Present' ? 'success' : 'default'}>
                                                {log.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">{log.inTime ? new Date(log.inTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</td>
                                        <td className="px-4 py-3">{log.outTime ? new Date(log.outTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};
