import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import PrintLayout from '../../components/PrintLayout';
import { ProcessedTransaction } from './utils/dataProcessor';

interface PrintData {
    transactions: ProcessedTransaction[];
    tableHeads: { name: string; value: string }[];
    feeHeadNames: string[];
    metadata: {
        session: string;
        startDate: number;
        endDate: number;
        status?: string;
        voucherStatus?: string;
        generatedOn: string;
    };
}

const PrintAdmissionTransaction = () => {
    const [printData, setPrintData] = useState<PrintData | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('admissionTransactionPrintData');
        if (storedData) {
            setPrintData(JSON.parse(storedData));
        }
    }, []);

    const getCellValue = (row: ProcessedTransaction, head: { name: string; value: string }) => {
        let accessor = head.value;
        // Map to nested properties
        if (head.value === 'fatherName') accessor = 'studentData.fatherName';
        if (head.value === 'phone') accessor = 'studentData.phone';
        if (head.value === 'batch') accessor = 'studentData.batch';
        if (head.value === 'paymentDetailsRefId') accessor = 'paymentDetails.refId';
        if (head.value === 'paymentDetailsBankName') accessor = 'paymentDetails.bankAccount';
        if (head.value === 'paymentDetailsDate') accessor = 'paymentDetails.date';

        let val = (row as any)[accessor];

        // For nested properties
        if (!val && accessor.includes('.')) {
            val = accessor.split('.').reduce((o: any, i: any) => o?.[i], row);
        }

        const isTotalRow = row.receiptId === 'Total';

        if (isTotalRow && head.value !== 'totalPaidAmount') return '';

        if (head.value === 'date' || head.value === 'paymentDetailsDate') {
            return val ? format(new Date(val), 'dd-MMM-yyyy') : '-';
        }
        if (head.value === 'totalPaidAmount' || head.value.includes('amount')) {
            return val !== undefined && val !== null ? `₹${val.toFixed(2)}` : '-';
        }
        if (head.value === 'status') {
            return val ? val.toUpperCase() : 'CONFIRMED';
        }
        return val !== undefined && val !== null ? val : '-';
    };

    if (!printData) {
        return <div>Loading...</div>;
    }

    return (
        <PrintLayout reportName="Admission Transaction Report">
            <div className="mb-4 text-sm">
                <p><strong>Session:</strong> {printData.metadata.session}</p>
                <p><strong>Date Range:</strong> {format(new Date(printData.metadata.startDate), 'dd-MMM-yyyy')} to {format(new Date(printData.metadata.endDate), 'dd-MMM-yyyy')}</p>
                {printData.metadata.status && <p><strong>Status:</strong> {printData.metadata.status}</p>}
                {printData.metadata.voucherStatus && <p><strong>Voucher Status:</strong> {printData.metadata.voucherStatus}</p>}
                <p><strong>Generated On:</strong> {printData.metadata.generatedOn}</p>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1 text-left">S.No</th>
                        {printData.tableHeads.map((head, idx) => (
                            <th key={idx} className="border border-gray-300 px-2 py-1 text-left">
                                {head.name}
                            </th>
                        ))}
                        {printData.feeHeadNames.map((feeHead, idx) => (
                            <th key={idx} className="border border-gray-300 px-2 py-1 text-left">
                                {feeHead}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {printData.transactions.map((row, rowIdx) => {
                        const isTotalRow = row.receiptId === 'Total';
                        return (
                            <tr key={rowIdx} className={isTotalRow ? 'font-bold bg-gray-50' : ''}>
                                <td className="border border-gray-300 px-2 py-1">
                                    {isTotalRow ? 'Total' : rowIdx + 1}
                                </td>
                                {printData.tableHeads.map((head, colIdx) => (
                                    <td key={colIdx} className="border border-gray-300 px-2 py-1">
                                        {getCellValue(row, head)}
                                    </td>
                                ))}
                                {printData.feeHeadNames.map((feeHead, colIdx) => {
                                    const val = (row as any)[`feeHead_${feeHead}`];
                                    return (
                                        <td key={colIdx} className="border border-gray-300 px-2 py-1">
                                            {val !== undefined && val !== null ? `₹${val.toFixed(2)}` : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </PrintLayout>
    );
};

export default PrintAdmissionTransaction;
