import { useState, useMemo } from 'react';
import { Card, DataTable, Button, Input, Select } from '@od-erp/ui';
import { useSessions, useAdmissionTransactions, useDeleteAdmissionTransaction } from '@od-erp/query';
import { AdmissionTransaction, AdmissionTransactionPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer, Trash2, Eye, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppSelector, useAppDispatch, setAcademicSession } from '@od-erp/store';

const AdmissionTransactionPage = () => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const dispatch = useAppDispatch();

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // 'confirmed', 'cancelled'
    const [startDate, setStartDate] = useState<number>(new Date(new Date().setDate(new Date().getDate() - 7)).getTime());
    const [endDate, setEndDate] = useState<number>(new Date().getTime());

    // Mutations
    const deleteMutation = useDeleteAdmissionTransaction();

    // Queries
    const { data: sessions } = useSessions(entityId);



    const payload: AdmissionTransactionPayload = useMemo(() => ({
        entity: entityId,
        session: session,
        startDate,
        endDate,
        status: statusFilter,
        search: searchTerm,
        pageNumber,
        pageSize
    }), [entityId, session, startDate, endDate, statusFilter, searchTerm, pageNumber, pageSize]);

    const { data: transactions, isLoading, refetch } = useAdmissionTransactions(payload);

    // Handlers
    const handleDelete = async (id: string) => {
        if (window.confirm('Receipt, once deleted, cant be recovered - Do you want to proceed')) {
            await deleteMutation.mutateAsync(id);
            refetch();
        }
    };

    const handleView = (id: string) => {
        // TODO: Implement View Modal or Navigation
        console.log('View transaction', id);
        alert(`View transaction ${id} coming soon!`);
    };

    const handleExportExcel = () => {
        if (!transactions) return;
        const worksheet = XLSX.utils.json_to_sheet(transactions.map((t, index) => ({
            'S.No': index + 1,
            'Date': format(new Date(t.date), 'dd-MMM-yyyy'),
            'Receipt Id': t.receiptId,
            'Name': t.studentData?.name,
            'Class': t.applicationDetails?.course,
            'Batch': t.applicationDetails?.batch,
            'Pay Mode': t.paymentDetails?.paymentMode,
            'Amount': t.paymentDetails?.paidAmount, // Or totalPaidAmount?
            'Status': t.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, `Transactions_${session}.xlsx`);
    };

    const handlePrint = () => {
        if (!transactions) return;
        localStorage.setItem('admissionTransactionData', JSON.stringify(transactions));
        window.open('/admission/print/admissionTransaction', '_blank');
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setAcademicSession(e.target.value));
    };

    // Columns
    const columns = useMemo<ColumnDef<AdmissionTransaction>[]>(() => [
        {
            header: 'S.No',
            accessorKey: 'sno',
            cell: info => (pageNumber - 1) * pageSize + info.row.index + 1,
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
            accessorKey: 'paymentDetails.paidAmount', // Checking Angular usage, sometimes it uses totalPaidAmount
            cell: info => {
                const val = info.getValue() as number;
                return val ? `₹${val.toFixed(2)}` : '-';
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${info.getValue() === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {info.getValue() as string || 'confirmed'}
                </span>
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: info => (
                <div className="flex space-x-2">
                    <button onClick={() => handleView(info.row.original._id)} className="text-blue-500 hover:text-blue-700">
                        <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(info.row.original._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], [pageNumber, pageSize]);

    return (
        <div className="w-full max-w-full min-w-0 p-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admission Transactions</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="mr-2">Select Session</span>
                        <select
                            className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer"
                            value={session}
                            onChange={handleSessionChange}
                        >
                            {sessions?.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" className="flex items-center" onClick={handleExportExcel}><FileSpreadsheet className="mr-1 h-4 w-4" /> Excel</Button>
                    <Button variant="outline" className="flex items-center" onClick={handlePrint}><Printer className="mr-1 h-4 w-4" /> Print</Button>
                    <Button variant="outline" className="flex items-center" onClick={handleRefresh}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            <Card className="mb-4 !p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Search */}
                    <div>
                        <Input
                            label="Search"
                            placeholder="Search Name/Receipt..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Date Range - Simplified for now using standard inputs */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={new Date(startDate).toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(new Date(e.target.value).getTime())}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={new Date(endDate).toISOString().split('T')[0]}
                            onChange={(e) => setEndDate(new Date(e.target.value).getTime())}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Select
                            label="Status"
                            options={[
                                { label: 'All', value: '' },
                                { label: 'Confirmed', value: 'confirmed' },
                                { label: 'Cancelled', value: 'cancelled' }
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <div className="bg-white rounded-lg shadow">
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={transactions || []} // Typings might mismatch if API returns wrapper object
                        isLoading={isLoading}
                    />
                </div>

                {/* Simple Pagination */}
                <div className="p-3 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-600">
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                            disabled={pageNumber === 1}
                            onClick={() => setPageNumber(p => p - 1)}
                        >
                            Previous
                        </button>
                        <button
                            className="px-2 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                            // disabled={!transactions || transactions.length < pageSize} // Simplified check
                            onClick={() => setPageNumber(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionTransactionPage;
