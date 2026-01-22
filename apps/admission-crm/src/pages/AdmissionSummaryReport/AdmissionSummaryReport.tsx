import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
import * as xlsx from 'xlsx';
import { admissionSummaryReportService } from '@od-erp/api-client';
import { Button, Select, Title, Card, Input } from '@od-erp/ui';
import { DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Search, Printer } from 'lucide-react';
import { admissionSummaryTableRow } from '@od-erp/types';
import { processAdmissionSummaryData, transformAdmissionSummaryForExport } from '@od-erp/utils';
import { useAppSelector } from '@od-erp/store';

const admissionSummaryReport = () => {
    // const [searchParams] = useSearchParams(); // Unused
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<admissionSummaryTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<admissionSummaryTableRow>[]>([]);
    const [sessionList, setSessionList] = useState<any[]>([]);

    // Filters
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<string[]>([]);
    const [excludeUnpaid, setExcludeUnpaid] = useState(false);
    const [searchText, setSearchText] = useState('');



    const entityId = useAppSelector((state) => state.auth.entityDetails?.id);

    const entityPreferences = JSON.parse(localStorage.getItem('entityPreferences') || '{}');

    // Display names from preferences
    const displayNames = {
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    };

    useEffect(() => {
        loadSessions();
    }, []);

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
        console.log(entityId);
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
                endDate: end.getTime(),
                excludeUnpaid
            };

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
            const tableCols: ColumnDef<admissionSummaryTableRow>[] = [
                { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() || '' },
                { accessorKey: 'course', header: displayNames.course },
                { accessorKey: 'stream', header: displayNames.stream },
            ];

            // Add dynamic columns
            dynamicColumns.forEach((col: string) => {
                tableCols.push({ accessorKey: col, header: col });
            });

            tableCols.push({ accessorKey: 'totalOpen', header: 'Total Open' });
            tableCols.push({ accessorKey: 'total', header: 'Total' });

            setColumns(tableCols);
            setData(processedRows);

        } catch (err) {
            console.error(err);
            setData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    };


    const handleExport = () => {
        setExportLoading(true);
        try {
            // Transform data for export
            const exportData = transformAdmissionSummaryForExport(data, columns);

            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
            xlsx.writeFile(wb, "Admission_Summary_Report.xlsx");
        } catch (e) {
            console.error("Export failed", e);
        } finally {
            setExportLoading(false);
        }
    };

    // Client-side filtering
    const filteredData = data.filter(row => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        return (
            row.course?.toLowerCase().includes(searchLower) ||
            row.stream?.toLowerCase().includes(searchLower)
        );
    });

    const handlePrint = () => {
        // Serialize columns to just keeping headers and keys for reproduction
        // We can't serialize functions, so we extract the config
        const serializableColumns = columns.map(col => ({
            accessorKey: (col as any).accessorKey,
            header: (col as any).header ? String((col as any).header) : '',
            // If we have custom cells, they are lost, but for print usually text is fine
        }));

        localStorage.setItem('admissionSummaryData', JSON.stringify(data));
        localStorage.setItem('admissionSummaryColumns', JSON.stringify(serializableColumns));
        window.open('/admission/print/admissionSummaryReport', '_blank');
    };

    return (
        <div className="w-full max-w-full min-w-0 flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Admission Summary Report</b>
                    </div>
                    <Title variant="pageTitle">Admission Summary Report</Title>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        leftIcon={<Printer size={16} />}
                    >
                        Print
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        isLoading={exportLoading}
                        leftIcon={<Download size={16} />}
                    >
                        Excel
                    </Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Exclude Unpaid</label>
                        <div className="flex items-center h-10">
                            <input
                                type="checkbox"
                                checked={excludeUnpaid}
                                onChange={(e) => setExcludeUnpaid(e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Session</label>
                        <Select
                            value={selectedSession[0] || ''}
                            onChange={(e) => setSelectedSession([e.target.value])}
                            options={[
                                { value: '', label: 'Select Session' },
                                ...sessionList.map(s => ({ value: s.name, label: s.name }))
                            ]}
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSearch} isLoading={loading}>Go</Button>
                </div>
            </Card>

            <div className="flex justify-end">
                <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    isLoading={loading}
                />
            </div>
        </div>
    );
};

export default admissionSummaryReport;