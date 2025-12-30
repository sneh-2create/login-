import { ColumnDef } from '@tanstack/react-table';
import {
    ActiveStudentData,
    UserEntityData,
    OnlineFeePaymentData,
    CommunicationReportData,
    EntityModuleCount,
    EntityLocationCount
} from '@od-erp/types';

export const activeStudentColumns: ColumnDef<ActiveStudentData>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'qac', header: 'QAC' },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'active', header: 'Active' },
    {
        accessorKey: 'percentage',
        header: 'Percentage',
        cell: ({ getValue }) => (getValue<number>() || 0).toFixed(2)
    },
];

export const userEntityColumns: ColumnDef<UserEntityData>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'qac', header: 'QAC' },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'active', header: 'Active' },
    {
        accessorKey: 'percentage',
        header: 'Percentage',
        cell: ({ getValue }) => (getValue<number>() || 0).toFixed(2)
    },
];

export const onlinePaymentColumns: ColumnDef<OnlineFeePaymentData>[] = [
    { accessorKey: 'qac', header: 'QAC' },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'online', header: 'Online' },
    {
        accessorKey: 'onlinePercentage',
        header: 'Onl %',
        cell: ({ getValue }) => (getValue<number>() || 0).toFixed(2)
    },
    { accessorKey: 'odPay', header: 'OD Pay' },
    {
        accessorKey: 'odPayPercentage',
        header: 'OD %',
        cell: ({ getValue }) => (getValue<number>() || 0).toFixed(2)
    },
];

export const communicationColumns: ColumnDef<CommunicationReportData>[] = [
    { accessorKey: 'qac', header: 'QAC' },
    { accessorKey: 'total', header: 'Total' },
    { accessorKey: 'sms', header: 'SMS' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'msTeams', header: 'Teams' },
];

export const moduleCountColumns: ColumnDef<EntityModuleCount>[] = [
    { accessorKey: 'module', header: 'Name' },
    { accessorKey: 'count', header: 'Count' },
];

export const locationCountColumns: ColumnDef<EntityLocationCount>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'count', header: 'Count' },
];
