import React, { useMemo } from 'react';
import { Card, DataTable } from '@od-erp/ui';
import { EmployeeLeaveRequest } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

interface LeaveRequestTableProps {
    data: EmployeeLeaveRequest[];
}

export const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({ data }) => {
    const columns = useMemo<ColumnDef<EmployeeLeaveRequest>[]>(
        () => [
            {
                accessorKey: 'employeeName',
                header: 'Employee Name',
                meta: { isBold: true },
            },
            {
                accessorKey: 'leaveStartDate',
                header: 'From Date',
                cell: ({ getValue }) => {
                    const val = getValue() as string;
                    return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
                },
            },
            {
                accessorKey: 'leaveEndDate',
                header: 'To Date',
                cell: ({ getValue }) => {
                    const val = getValue() as string;
                    return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
                },
            },
            {
                accessorKey: 'reason',
                header: 'Reason',
            },
            {
                accessorKey: 'leaveStatus',
                header: 'Status',
                cell: ({ getValue }) => {
                    const status = getValue() as string;
                    let colorClass = 'bg-gray-100 text-gray-800';
                    if (status === 'Approved') colorClass = 'bg-green-100 text-green-800';
                    else if (status === 'Rejected') colorClass = 'bg-red-100 text-red-800';
                    else if (status === 'Pending') colorClass = 'bg-yellow-100 text-yellow-800';

                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                            {status}
                        </span>
                    );
                },
            },
        ],
        []
    );

    return (
        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Request</h3>
            <div className="flex-1 overflow-auto">
                <DataTable
                    columns={columns}
                    data={data}
                    showSearch={false}
                    showPagination={data.length > 5}
                    initialItemsPerPage={5}
                />
            </div>
        </Card>
    );
};
