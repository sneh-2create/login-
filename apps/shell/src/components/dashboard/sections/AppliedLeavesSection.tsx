
import { useMemo } from 'react';
import { useAppliedLeaves } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { AppliedLeave } from '@od-erp/types';
import {
    Card,
    Badge,
    DataTable
} from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { RefreshCcw } from 'lucide-react';

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
    applied: 'info',
    cancelled: 'default',
    rejected: 'danger',
    approved: 'success',
    partiallyApproved: 'warning',
};

export const AppliedLeavesSection = () => {
    const { permissions, entityDetails } = useAppSelector((state: any) => state.auth);
    const entityId = entityDetails?.id || '';
    const session = entityDetails?.activeSession?.name || '';

    const hasPermission = useMemo(() => {
        return permissions?.includes('attendanceDashboard');
    }, [permissions]);

    const { data: leaves, isLoading, refetch } = useAppliedLeaves(
        entityId,
        session
    );

    const columns = useMemo<ColumnDef<AppliedLeave>[]>(() => [
        {
            id: 'index',
            header: 'S.No',
            cell: info => info.row.index + 1,
            meta: { width: 60 }
        },
        {
            accessorKey: 'studentRegNo',
            header: 'Admission No',
            meta: { isBold: true }
        },
        {
            accessorKey: 'student.name',
            header: 'Student Name',
            meta: { isBold: true }
        },
        {
            id: 'courseDetails',
            header: 'Course Details',
            cell: ({ row }) => {
                const { course, stream, section, batch } = row.original;
                return (
                    <div className="flex flex-col text-xs space-y-1">
                        <div><span className="text-gray-500 font-medium">Class:</span> {course}</div>
                        <div><span className="text-gray-500 font-medium">Stream:</span> {stream}</div>
                        <div><span className="text-gray-500 font-medium">Section:</span> {section}</div>
                        {batch && <div><span className="text-gray-500 font-medium">Batch:</span> {batch}</div>}
                    </div>
                );
            }
        },
        {
            accessorKey: 'leaveStartDate',
            header: 'Start Date',
            cell: info => format(new Date(info.getValue() as number), 'dd/MM/yyyy')
        },
        {
            accessorKey: 'leaveEndDate',
            header: 'End Date',
            cell: info => format(new Date(info.getValue() as number), 'dd/MM/yyyy')
        },
        {
            accessorKey: 'leaveStatus',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.leaveStatus;
                return (
                    <Badge variant={STATUS_VARIANTS[status] || 'default'} className="capitalize">
                        {status.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: info => <span title={info.getValue() as string} className="truncate max-w-[150px] block">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'remark',
            header: 'Remark',
            cell: info => {
                const val = info.getValue() as string;
                return val ? <span title={val} className="truncate max-w-[150px] block">{val}</span> : '-';
            }
        }
    ], []);

    if (!hasPermission) return null;

    return (
        <Card className="mt-8 border-none shadow-[0px_0px_10px_-2px_#0000001A]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">Applied Leaves</h3>
                <button onClick={() => refetch()} title="Refresh" className="focus:outline-none">
                    <RefreshCcw
                        size={20}
                        className={`text-gray-500 hover:text-gray-700 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            <DataTable
                columns={columns}
                data={leaves || []}
                isLoading={isLoading}
                showSearch={false}
                showPagination={true}
                initialItemsPerPage={10}
            />
        </Card>
    );
};
