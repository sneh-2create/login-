import React, { useMemo } from 'react';
import { Card, DataTable } from '@od-erp/ui';
import { EmployeePunchData } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';

interface TodayAttendanceTableProps {
    data: EmployeePunchData[];
}

export const TodayAttendanceTable: React.FC<TodayAttendanceTableProps> = ({ data }) => {
    const columns = useMemo<ColumnDef<EmployeePunchData>[]>(
        () => [
            {
                accessorKey: 'employeeName',
                header: 'Employee Name',
                meta: { isBold: true },
            },
            {
                accessorKey: 'employeeId',
                header: 'Employee ID',
            },
            {
                accessorKey: 'department',
                header: 'Department',
            },
            {
                accessorKey: 'designation',
                header: 'Designation',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ getValue }) => {
                    const status = getValue() as string;
                    let colorClass = 'bg-gray-100 text-gray-800';
                    if (status?.toLowerCase() === 'present') colorClass = 'bg-green-100 text-green-800';
                    else if (status?.toLowerCase() === 'absent') colorClass = 'bg-red-100 text-red-800';

                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                            {status || '-'}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'inTime',
                header: 'In Time',
                cell: ({ getValue }) => getValue() || '-',
            },
            {
                accessorKey: 'outTime',
                header: 'Out Time',
                cell: ({ getValue }) => getValue() || '-',
            },
        ],
        []
    );

    return (
        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Employee Attendance</h3>
            <div className="flex-1 overflow-auto">
                <DataTable
                    columns={columns}
                    data={data}
                    showSearch
                    searchPlaceholder="Search Employee..."
                    showPagination={data.length > 5}
                    initialItemsPerPage={5}
                />
            </div>
        </Card>
    );
};
