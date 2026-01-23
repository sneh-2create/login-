import { useMemo } from 'react';
import { useAdmissionStudentTransactions, useAdmissionStudentRefunds } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import { X, Receipt, Printer, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';

interface ViewTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const ViewTransactionsModal = ({ isOpen, onClose, student }: ViewTransactionsModalProps) => {
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    const { data: transactions, isLoading: isTransactionsLoading } = useAdmissionStudentTransactions(entityId, session, student?._id || '');
    const { data: refunds, isLoading: isRefundsLoading } = useAdmissionStudentRefunds(entityId, session, student?._id || '');

    const handlePrintReceipt = (transaction: any) => {
        // Implement print logic, potentially navigating to print page or opening new window
        window.open(`/print/open/printAdmissionTransaction/${transaction._id}?prev=/admission/studentData&course=${transaction.applicationDetails?.course}`, '_blank');
    };

    const handleCancelReceipt = (receipt: any) => {
        console.log('Cancelling receipt:', receipt);
        alert('Cancel receipt functionality pending implementation');
    };

    // Using simple any type for rows for now as API response might vary slightly from types
    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: 'Receipt Id',
            accessorKey: 'receiptId',
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: info => info.getValue() ? format(new Date(info.getValue() as number), 'dd/MM/yyyy') : '-'
        },
        {
            header: 'Payment Mode',
            accessorKey: 'paymentDetails.paymentMode',
            cell: info => info.row.original.paymentDetails?.paymentMode || '-'
        },
        {
            header: 'Remark',
            accessorKey: 'remark',
        },
        {
            header: 'Total Paid Amount',
            accessorKey: 'totalPaidAmount',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const status = (info.getValue() as string)?.toUpperCase();
                return (
                    <span className={status === 'CANCELLED' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'Action',
            id: 'actions',
            cell: info => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePrintReceipt(info.row.original)}
                        className="p-1 rounded hover:bg-gray-100 text-blue-500"
                        title="Print Receipt"
                    >
                        <Printer size={16} />
                    </button>
                    {info.row.original.status !== 'cancelled' && (
                        <button
                            onClick={() => handleCancelReceipt(info.row.original)}
                            className="p-1 rounded hover:bg-gray-100 text-red-500"
                            title="Cancel Receipt"
                        >
                            <XCircle size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    const refundColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: 'Receipt Id',
            accessorKey: 'receiptId',
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: info => info.getValue() ? format(new Date(info.getValue() as number), 'dd/MM/yyyy') : '-'
        },
        {
            header: 'Payment Mode',
            accessorKey: 'paymentDetails.paymentMode',
            cell: info => info.row.original.paymentDetails?.paymentMode || '-'
        },
        {
            header: 'Remark',
            accessorKey: 'remark',
        },
        {
            header: 'Total Paid Amount',
            accessorKey: 'totalPaidAmount',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const status = (info.getValue() as string)?.toUpperCase();
                return (
                    <span className={status === 'CANCELLED' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                        {status}
                    </span>
                );
            }
        }
    ], []);


    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Receipt className="mr-2 h-5 w-5 text-blue-600" />
                        Transactions - {student.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* Payment History */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-700 mb-4 px-2 border-l-4 border-blue-500">Payment History</h3>
                        {isTransactionsLoading ? (
                            <div className="flex justify-center py-4">Loading...</div>
                        ) : transactions && transactions.length > 0 ? (
                            <DataTable columns={columns} data={transactions} />
                        ) : (
                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">No Records found !</div>
                        )}
                    </section>

                    {/* Refund Transactions History */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-700 mb-4 px-2 border-l-4 border-blue-500">Refund Transactions History</h3>
                        {isRefundsLoading ? (
                            <div className="flex justify-center py-4">Loading...</div>
                        ) : refunds && refunds.length > 0 ? (
                            <DataTable columns={refundColumns} data={refunds} />
                        ) : (
                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">No Records found !</div>
                        )}
                    </section>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTransactionsModal;
