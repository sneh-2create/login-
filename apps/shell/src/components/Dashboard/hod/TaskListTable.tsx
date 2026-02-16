import React, { useMemo } from 'react';
import { Card, DataTable } from '@od-erp/ui';
import { EmployeeTaskItem } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

interface TaskListTableProps {
    data: EmployeeTaskItem[];
}

export const TaskListTable: React.FC<TaskListTableProps> = ({ data }) => {
    const columns = useMemo<ColumnDef<EmployeeTaskItem>[]>(
        () => [
            {
                accessorKey: 'title',
                header: 'Task Title',
                meta: { isBold: true },
            },
            {
                accessorKey: 'assignedToName',
                header: 'Assigned To',
            },
            {
                accessorKey: 'dueDate',
                header: 'Due Date',
                cell: ({ getValue }) => {
                    const val = getValue() as string;
                    return val ? format(new Date(val), 'dd/MM/yyyy') : '-';
                },
            },
            {
                accessorKey: 'priority',
                header: 'Priority',
                cell: ({ getValue }) => {
                    const val = getValue() as string;
                    let color = 'text-gray-600';
                    if (val === 'High') color = 'text-red-600 font-semibold';
                    else if (val === 'Medium') color = 'text-yellow-600';
                    return <span className={color}>{val}</span>;
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
            },
        ],
        []
    );

    return (
        <Card className="p-4 border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Task List</h3>
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
