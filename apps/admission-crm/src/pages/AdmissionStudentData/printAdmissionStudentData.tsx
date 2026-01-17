import { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@od-erp/ui';
import PrintLayout from '../../components/printLayout';
import { admissionLead } from '@od-erp/types';

const PrintAdmissionStudentData = () => {
    const [data, setData] = useState<admissionLead[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('admissionStudentData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
    }, []);

    const columns = useMemo<ColumnDef<admissionLead>[]>(() => [
        {
            header: 'S.No',
            accessorKey: 'sno',
            cell: info => info.row.index + 1,
        },
        {
            header: 'Current Stage',
            accessorKey: 'currentStage',
            cell: info => info.getValue() as string,
        },
        {
            header: 'Student Name',
            accessorKey: 'name',
        },
        {
            header: 'Form No.',
            accessorKey: 'applicationNumber',
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: info => {
                const val = info.getValue();
                return val ? format(new Date(val as number), 'dd-MMM-yyyy') : '-';
            },
        },
        {
            header: 'Course',
            accessorKey: 'course',
        },
        {
            header: 'Phone',
            accessorKey: 'phone',
        },
        {
            header: 'Father Name',
            accessorKey: 'fatherName',
            cell: info => info.getValue() || '-'
        },
    ], []);

    return (
        <PrintLayout reportName="Application Data Report">
            <DataTable
                columns={columns}
                data={data}
                isLoading={false}
            />
        </PrintLayout>
    );
};

export default PrintAdmissionStudentData;
