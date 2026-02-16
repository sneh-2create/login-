import { useEffect, useState, useMemo } from 'react';
import * as xlsx from 'xlsx';
import { admissionSummaryReportService } from '@od-erp/api-client';
import { Button, Dropdown, Checkbox, Breadcrumb, DatePicker, Tooltip } from '@od-erp/ui';
import { DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { AdmissionSummaryTableRow } from '@od-erp/types';
import { processAdmissionSummaryData, addExcelReportHeader, addExcelReportFooter } from '@od-erp/utils';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';

const admissionSummaryReport = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<AdmissionSummaryTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<AdmissionSummaryTableRow>[]>([]);
    const [sessionList, setSessionList] = useState<any[]>([]);

    // Redux Selectors
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id);
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};
    // const session = useAppSelector((state) => state.session.academicSession); // Not directly used in API payload but good for context if needed

    // Display Names
    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    }), [entityPreferences]);

    // Filters
    const [startDate, setStartDate] = useState<number>(new Date().setHours(0, 0, 0, 0));
    const [endDate, setEndDate] = useState<number>(new Date().setHours(23, 59, 59, 999));
    const [selectedSession, setSelectedSession] = useState<string[]>([]);
    const [excludeUnpaid, setExcludeUnpaid] = useState(false);

    useEffect(() => {
        loadSessions();
    }, [entityId]);

    const loadSessions = async () => {
        try {
            if (!entityId) return;
            const res = await admissionSummaryReportService.getSessionList(entityId);
            setSessionList(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        if (!entityId) return;
        setLoading(true);

        try {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const payload: any = {
                entity: entityId,
                startDate: start.getTime(),
                endDate: end.getTime()
            };

            if (excludeUnpaid) {
                payload.excludeUnpaid = true;
            }

            if (selectedSession.length > 0) {
                payload.session = selectedSession;
            }

            const res = await admissionSummaryReportService.viewAdmissionSummaryReport(payload);

            if (!res || !Array.isArray(res)) {
                console.warn('AdmissionSummaryReport: Invalid response format', res);
                setData([]);
                return;
            }

            const { processedRows, dynamicColumns } = processAdmissionSummaryData(res);

            // Define Table Columns
            const tableCols: ColumnDef<AdmissionSummaryTableRow>[] = [
                {
                    accessorKey: 'position', header: 'S.No', cell: info => {
                        const row = info.row.original as any;
                        if (row.course === 'Total') return '';
                        return info.row.index + 1;
                    }
                },
                {
                    accessorKey: 'course', header: displayNames.course, cell: info => {
                        const row = info.row.original as any;
                        const val = info.getValue() as string;
                        return row.course === 'Total' ? <span className="font-bold">{val}</span> : val;
                    }
                },
                { accessorKey: 'stream', header: displayNames.stream },
            ];

            // Conditional Batch Column
            if (entityPreferences.showBatch) {
                tableCols.push({ accessorKey: 'batch', header: displayNames.batch });
            }

            // Dynamic columns
            dynamicColumns.forEach((col: string) => {
                tableCols.push({ accessorKey: col, header: col });
            });

            tableCols.push({ accessorKey: 'totalOpen', header: 'Total Open' });
            tableCols.push({ accessorKey: 'total', header: 'Total' });

            setColumns(tableCols);
            setData(processedRows);

        } catch (err) {
            console.error(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };



    const handleExport = () => {
        setExportLoading(true);
        try {
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            // Common Header
            const tableStartRow = addExcelReportHeader(ws, entityName, 'Admission Summary Report');

            // Table Headers
            const tableHeaders = columns.map(c => (c as any).header);
            xlsx.utils.sheet_add_aoa(ws, [tableHeaders], { origin: { r: tableStartRow, c: 0 } });

            // Data
            const dataRows = data.map((row, index) => {
                const isTotalRow = row.course === 'Total' || row.position === 0 || row.course?.toString().includes('Total');

                return columns.map((col, colIdx) => {
                    const key = (col as any).accessorKey;
                    const header = (col as any).header;

                    if (header === 'S.No' || key === 'position' || colIdx === 0) {
                        if (isTotalRow) return '';
                        return index + 1;
                    }

                    return row[key] || (row[key] === 0 ? 0 : '');
                });
            });

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

            // Common Footer
            const footerStartRow = tableStartRow + 1 + dataRows.length + 2;
            addExcelReportFooter(ws, footerStartRow);

            xlsx.utils.book_append_sheet(wb, ws, "Admission Summary");
            xlsx.writeFile(wb, `Admission_Summary_Report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
        } catch (e) {
            console.error("Export failed", e);
        } finally {
            setExportLoading(false);
        }
    };

    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="w-full max-w-full font-sans pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admission Summary Report</h1>
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admission', href: '/admission' },
                            { label: 'Admission Summary Report' } // Current page
                        ]}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    {/* Filter Toggle */}
                    <Tooltip content="Filter" placement="bottom">
                        <Button
                            variant="outline"
                            className={`!p-0 !w-9 !h-9 border-gray-300 ${showFilter ? 'bg-primary/10 border-primary/20 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </Tooltip>

                    {/* Refresh / Go */}
                    <Tooltip content="Refresh" placement="bottom">
                        <Button
                            variant="outline"
                            className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                            onClick={handleSearch}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </Tooltip>

                    {/* Excel Export */}
                    {data.length > 0 && (
                        <Tooltip content="Export to Excel" placement="bottom">
                            <Button
                                variant="outline"
                                className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={handleExport}
                                isLoading={exportLoading}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                    )}


                </div>
            </div>

            {/* Collapsible Filter Card */}
            {showFilter && (
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                            <DatePicker
                                value={new Date(startDate)}
                                onChange={(date) => date && setStartDate(date.getTime())}
                                maxDate={new Date(endDate)}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                            <DatePicker
                                value={new Date(endDate)}
                                onChange={(date) => date && setEndDate(date.getTime())}
                                minDate={new Date(startDate)}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Exclude Unpaid</label>
                            <Checkbox
                                label="Yes"
                                checked={excludeUnpaid}
                                onChange={(e) => setExcludeUnpaid(e.target.checked)}
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Session</label>
                            <Dropdown
                                value={selectedSession[0] || ''}
                                onChange={(val) => setSelectedSession([val as string])}
                                options={[
                                    { value: '', label: 'Select Session' },
                                    ...sessionList.map(s => ({ value: s.name, label: s.name }))
                                ]}
                                placeholder="Select Session"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="primary" onClick={() => { handleSearch(); setShowFilter(false); }} isLoading={loading}>Apply Filters</Button>
                    </div>
                </div>
            )}

            {/* Table */}
            {data.length > 0 && (
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={data}
                        isLoading={loading}
                        showSearch={true}
                    />
                </div>
            )}

            {/* Empty State / Prompt */}
            {!loading && data.length === 0 && (
                <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <span className="text-gray-400 text-lg font-medium">No Records Found</span>
                </div>
            )}
        </div>
    );
};

export default admissionSummaryReport;