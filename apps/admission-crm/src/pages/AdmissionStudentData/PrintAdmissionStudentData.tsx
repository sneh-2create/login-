import { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@od-erp/ui';
import PrintLayout from '../../components/PrintLayout';
import { AdmissionLead } from '@od-erp/types';

const PrintAdmissionStudentData = () => {
    const [data, setData] = useState<AdmissionLead[]>([]);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const storedData = localStorage.getItem('admissionStudentData');
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (Array.isArray(parsed)) {
                setData(parsed);
            } else {
                setData(parsed.data || []);
                setPageNumber(parsed.pageNumber || 1);
                setPageSize(parsed.pageSize || 10);
            }
        }
    }, []);

    const columns = useMemo<ColumnDef<AdmissionLead>[]>(() => [
        {
            header: 'S.No',
            accessorKey: 'sno',
            cell: info => (pageNumber - 1) * pageSize + info.row.index + 1,
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
    ], [pageNumber, pageSize]);

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
