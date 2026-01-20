import { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@od-erp/ui';
import PrintLayout from '../../components/printLayout';
import { admissionTransaction } from '@od-erp/types';

const PrintAdmissionTransaction = () => {
    const [data, setData] = useState<admissionTransaction[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('admissionTransactionData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
    }, []);

    const columns = useMemo<ColumnDef<admissionTransaction>[]>(() => [
        {
            header: 'S.No',
            accessorKey: 'sno',
            cell: info => info.row.index + 1,
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: info => info.getValue() ? format(new Date(info.getValue() as number), 'dd-MMM-yyyy') : '-',
        },
        {
            header: 'Receipt Id',
            accessorKey: 'receiptId',
        },
        {
            header: 'Name',
            accessorKey: 'studentData.name',
        },
        {
            header: 'Class',
            accessorKey: 'applicationDetails.course',
        },
        {
            header: 'Batch',
            accessorKey: 'applicationDetails.batch',
            cell: info => info.getValue() || '-'
        },
        {
            header: 'Pay Mode',
            accessorKey: 'paymentDetails.paymentMode',
        },
        {
            header: 'Amount',
            accessorKey: 'paymentDetails.paidAmount',
            cell: info => {
                const val = info.getValue() as number;
                return val ? `₹${val.toFixed(2)}` : '-';
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${info.getValue() === 'confirmed' ? 'text-green-800' : 'text-red-800'}`}>
                    {info.getValue() as string || 'confirmed'}
                </span>
            )
        }
    ], []);

    return (
        <PrintLayout reportName="Admission Transaction Report">
            <DataTable
                columns={columns}
                data={data}
                isLoading={false}
            />
        </PrintLayout>
    );
};

export default PrintAdmissionTransaction;
