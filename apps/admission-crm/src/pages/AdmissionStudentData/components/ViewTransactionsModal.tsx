import { useMemo, useState } from 'react';
import { useAdmissionStudentTransactions, useAdmissionStudentRefunds } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import { X, Receipt, Printer, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import CancelTransactionDialog from './CancelTransactionDialog';

interface ViewTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
}

const ViewTransactionsModal = ({ isOpen, onClose, student }: ViewTransactionsModalProps) => {
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const entityPreferences = useAppSelector((state) => state.config.entityPreferences);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    const { data: transactions, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useAdmissionStudentTransactions(entityId, session, student?._id || '');
    const { data: refunds, isLoading: isRefundsLoading, refetch: refetchRefunds } = useAdmissionStudentRefunds(entityId, session, student?._id || '');

    // Permission check helper
    const checkPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    const handlePrintReceipt = (transaction: any) => {
        window.open(`/print/open/printAdmissionTransaction/${transaction._id}?prev=/admission/studentData&course=${transaction.applicationDetails?.course}`, '_blank');
    };

    const handleCancelReceipt = (receipt: any) => {
        setSelectedReceipt(receipt);
        setCancelDialogOpen(true);
    };

    const handleCancelSuccess = () => {
        refetchTransactions();
        refetchRefunds();
    };

    const handleViewDocument = (url: string) => {
        window.open(url, '_blank');
    };

    const handleRowClick = (transaction: any) => {
        handlePrintReceipt(transaction);
    };

    // Build columns array dynamically based on entity preferences
    const columns = useMemo<ColumnDef<any>[]>(() => {
        const baseColumns: ColumnDef<any>[] = [
            {
                header: 'Receipt Id',
                accessorKey: 'receiptId',
                cell: info => (
                    <div 
                        className="cursor-pointer hover:text-blue-600" 
                        onClick={() => handleRowClick(info.row.original)}
                    >
                        {info.getValue() as string}
                    </div>
                )
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: info => (
                    <div 
                        className="cursor-pointer" 
                        onClick={() => handleRowClick(info.row.original)}
                    >
                        {info.getValue() ? format(new Date(info.getValue() as number), 'dd/MM/yyyy') : '-'}
                    </div>
                )
            },
            {
                header: 'Payment Mode',
                accessorKey: 'paymentDetails.paymentMode',
                cell: info => (
                    <div 
                        className="cursor-pointer" 
                        onClick={() => handleRowClick(info.row.original)}
                    >
                        {info.row.original.paymentDetails?.paymentMode || '-'}
                    </div>
                )
            },
            {
                header: 'Remark',
                accessorKey: 'remark',
                cell: info => (
                    <div 
                        className="cursor-pointer" 
                        onClick={() => handleRowClick(info.row.original)}
                    >
                        {info.getValue() as string || '-'}
                    </div>
                )
            },
            {
                header: 'Total Paid Amount',
                accessorKey: 'totalPaidAmount',
                cell: info => (
                    <div 
                        className="cursor-pointer" 
                        onClick={() => handleRowClick(info.row.original)}
                    >
                        {info.getValue() as number}
                    </div>
                )
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: info => {
                    const status = (info.getValue() as string)?.toUpperCase();
                    return (
                        <div 
                            className="cursor-pointer" 
                            onClick={() => handleRowClick(info.row.original)}
                        >
                            <span className={status === 'CANCELLED' ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                                {status}
                            </span>
                        </div>
                    );
                }
            },
        ];

        // Add document column if entity preference is enabled
        if (entityPreferences?.editFeeDocument) {
            baseColumns.push({
                header: 'Partial Payment Document',
                id: 'document',
                cell: info => (
                    <div className="flex justify-center">
                        {info.row.original.partialPaymentDoc && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDocument(info.row.original.partialPaymentDoc);
                                }}
                                className="p-1 rounded hover:bg-gray-100 transition-colors text-primary"
                                title="View Partial Payment Document"
                            >
                                <FileText size={20} />
                            </button>
                        )}
                    </div>
                )
            });
        }

        // Add action column
        baseColumns.push({
            header: 'Action',
            id: 'actions',
            cell: info => (
                <div className="flex gap-2">
                    {checkPermission('viewTransaction') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrintReceipt(info.row.original);
                            }}
                            className="p-1 rounded hover:bg-gray-100 transition-colors text-primary"
                            title="Print Receipt"
                        >
                            <Printer size={16} />
                        </button>
                    )}
                    {checkPermission('cancelReceipt') && info.row.original.status !== 'cancelled' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelReceipt(info.row.original);
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-red-500 transition-colors"
                            title="Cancel Receipt"
                        >
                            <XCircle size={16} />
                        </button>
                    )}
                </div>
            )
        });

        return baseColumns;
    }, [entityPreferences, permissions]);

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
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9999] ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            
            {/* Sliding Panel */}
            <div 
                className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-[10000] transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } w-full md:w-[70%] lg:w-[60%] xl:w-[50%] flex flex-col`}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b bg-primary/10">
                    <h2 className="text-xl font-semibold flex items-center text-primary">
                        <Receipt className="mr-2 h-5 w-5" />
                        Transactions - {student.name}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-white/50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-3 py-2 overflow-y-auto flex-1 space-y-4">
                    {/* Payment History */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-700 mb-2 px-2 border-l-4 border-primary">
                            Payment History
                        </h3>
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
                        <h3 className="text-lg font-bold text-gray-700 mb-2 px-2 border-l-4 border-primary">
                            Refund Transactions History
                        </h3>
                        {isRefundsLoading ? (
                            <div className="flex justify-center py-4">Loading...</div>
                        ) : refunds && refunds.length > 0 ? (
                            <DataTable columns={refundColumns} data={refunds} />
                        ) : (
                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">No Records found !</div>
                        )}
                    </section>
                </div>
            </div>

            {/* Cancel Transaction Dialog */}
            <CancelTransactionDialog
                isOpen={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                receipt={selectedReceipt}
                onSuccess={handleCancelSuccess}
            />
        </>
    );
};

export default ViewTransactionsModal;

