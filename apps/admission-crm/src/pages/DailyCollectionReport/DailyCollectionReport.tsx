import { useState, useMemo } from 'react';
import { Card, DataTable, Button, Select } from '@od-erp/ui';
import { useSessions, useDailyCollectionReport } from '@od-erp/query';
import { admissionDailyCollectionReportParams, admissionTransaction } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppSelector } from '@od-erp/store';

const DailyCollectionReportPage = () => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [startDate, setStartDate] = useState<number>(new Date().setHours(0, 0, 0, 0));
    const [endDate, setEndDate] = useState<number>(new Date().setHours(23, 59, 59, 999));
    const [statusFilter, setStatusFilter] = useState('confirmed');

    // Queries
    const { data: sessions } = useSessions(entityId);



    const payload: admissionDailyCollectionReportParams = useMemo(() => ({
        entity: entityId,
        session: session ? [session] : [],
        startDate,
        endDate,
        status: statusFilter,
    }), [entityId, session, startDate, endDate, statusFilter]);

    const { data: reportData, isLoading, refetch } = useDailyCollectionReport(payload);

    // Calculations
    const totalAmount = useMemo(() => {
        if (!reportData) return 0;
        return reportData.reduce((sum, item) => sum + (item.totalPaidAmount || 0), 0);
    }, [reportData]);

    const handleExportExcel = () => {
        if (!reportData) return;
        const worksheet = XLSX.utils.json_to_sheet(reportData.map((t, index) => ({
            'S.No': index + 1,
            'Date': format(new Date(t.date), 'dd-MMM-yyyy'),
            'Receipt Id': t.receiptId,
            'Name': t.studentData?.name,
            'Class': t.applicationDetails?.course,
            'Pay Mode': t.paymentDetails?.paymentMode,
            'Amount': t.totalPaidAmount,
            'Status': t.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DailyCollection');
        XLSX.writeFile(workbook, `DailyCollection_${session}.xlsx`);
    };

    const handlePrint = () => {
        if (!reportData) return;
        localStorage.setItem('dailyCollectionData', JSON.stringify(reportData));
        localStorage.setItem('dailyCollectionTotal', totalAmount.toString());
        window.open('/admission/print/dailyCollectionReport', '_blank');
    };

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
            accessorKey: 'totalPaidAmount', // Use totalPaidAmount as per Angular logic
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
        }
    ], []);

    return (
        <div className="w-full max-w-full min-w-0 p-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Daily Collection Report</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="mr-2">Select Session</span>
                        <select
                            className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer"
                            value={session}
                            disabled
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
                    <Button variant="outline" className="flex items-center" onClick={() => refetch()}>
                        <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            <Card className="mb-4 !p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={new Date(startDate).toISOString().split('T')[0]}
                            onChange={(e) => {
                                const d = new Date(e.target.value);
                                d.setHours(0, 0, 0, 0);
                                setStartDate(d.getTime());
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={new Date(endDate).toISOString().split('T')[0]}
                            onChange={(e) => {
                                const d = new Date(e.target.value);
                                d.setHours(23, 59, 59, 999);
                                setEndDate(d.getTime());
                            }}
                        />
                    </div>
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

            <Card className="mb-4 !p-4 bg-blue-50">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-800">Total Collection</span>
                    <span className="text-2xl font-bold text-blue-900">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
            </Card>

            <div className="bg-white rounded-lg shadow">
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={reportData || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default DailyCollectionReportPage;
