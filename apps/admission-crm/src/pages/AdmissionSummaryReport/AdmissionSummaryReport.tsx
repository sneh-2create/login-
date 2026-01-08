import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
import * as xlsx from 'xlsx';
import { admissionService } from '@od-erp/api-client';
import { Button, Select, Title, Card, Input } from '@od-erp/ui';
import { DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Search } from 'lucide-react';
// import Cookies from 'js-cookie';

interface TableRow {
    position: number;
    course: string;
    stream: string;
    total: number;
    totalOpen: number;
    [key: string]: any;
}

const AdmissionSummaryReport = () => {
    // const [searchParams] = useSearchParams(); // Unused
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<TableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<TableRow>[]>([]);
    const [sessionList, setSessionList] = useState<any[]>([]);

    // Filters
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<string[]>([]);
    const [excludeUnpaid, setExcludeUnpaid] = useState(false);
    const [searchText, setSearchText] = useState('');

    // const entityId = Cookies.get('entityId') || localStorage.getItem('entityId') || '';
    const entityId = '5e95a8d3eac1df35dd2d007f';
    // const session = Cookies.get('session') || localStorage.getItem('session') || ''; // Unused
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
            const res = await admissionService.getSessionList(entityId);
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

            const res = await admissionService.viewAdmissionSummaryReport(payload);
            processData(res);
        } catch (err) {
            console.error(err);
            setData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    };

    const processData = (rawData: any[]) => {
        if (!rawData || rawData.length === 0) {
            setData([]);
            return;
        }

        // 1. Get courses list for sequencing (simulated as we don't have this.courses loaded yet, 
        // leveraging rawData order or sequence if available). 
        // In React port, we might skip re-sorting by sequence if not critical or fetch courses if needed.
        // For now, using data as returned.

        let processedRows: TableRow[] = [];
        let dynamicColumns: Set<string> = new Set();
        let totalStats: any = { course: 'Total', total: 0, totalOpen: 0 };

        rawData.forEach((row: any, index: number) => {
            let newRow: any = {
                position: index + 1,
                course: row.course,
                stream: row.stream,
                total: row.total,
                totalOpen: row.totalOpen,
                ...row // Keep original for reference
            };

            // Process data array for dynamic columns
            if (Array.isArray(row.data)) {
                row.data.forEach((item: any) => {
                    let colName = item.name;
                    if (typeof colName === 'boolean') colName = String(colName);

                    newRow[colName] = item.value;
                    dynamicColumns.add(colName);

                    // Accumulate totals
                    totalStats[colName] = (totalStats[colName] || 0) + (item.value || 0);
                });
            }

            totalStats.total += row.total;
            totalStats.totalOpen += row.totalOpen;
            processedRows.push(newRow);
        });

        // Add Total Row
        processedRows.push(totalStats);

        // Sorting if needed (skipped for now)

        // Define Table Columns
        const tableCols: ColumnDef<TableRow>[] = [
            { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() || '' },
            { accessorKey: 'course', header: displayNames.course },
            { accessorKey: 'stream', header: displayNames.stream },
        ];

        // Add dynamic columns in specific order if possible, else alphabetical/insertion order
        // Prioritizing specific columns as per legacy code logic
        // const priorityCols = ["Applied", "Registered", "Admitted"]; // Example priority - Unused
        const specialCols = ["Approved", "Rejected", "Withdrawn"];

        // Add gathered dynamic columns excluding special ones first
        Array.from(dynamicColumns).forEach(col => {
            if (!specialCols.includes(col)) {
                tableCols.push({ accessorKey: col, header: col });
            }
        });

        // Add special columns if they exist
        specialCols.forEach(col => {
            if (dynamicColumns.has(col)) {
                tableCols.push({ accessorKey: col, header: col });
            }
        });

        tableCols.push({ accessorKey: 'totalOpen', header: 'Total Open' });
        tableCols.push({ accessorKey: 'total', header: 'Total' });

        setColumns(tableCols);
        setData(processedRows);
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
            // Transform data for export to match table structure
            const exportData = data.map(row => {
                const rowData: any = {};
                columns.forEach((col: any) => {
                    if (col.accessorKey) {
                        rowData[col.header as string] = row[col.accessorKey];
                    }
                });
                return rowData;
            });

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

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Admission Summary Report</b>
                    </div>
                    <Title variant="pageTitle">Admission Summary Report</Title>
                </div>
                <Button
                    variant="outline"
                    onClick={handleExport}
                    isLoading={exportLoading}
                    leftIcon={<Download size={16} />}
                >
                    Excel
                </Button>
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

            <DataTable
                columns={columns}
                data={filteredData}
                isLoading={loading}
            />
        </div>
    );
};

export default AdmissionSummaryReport;
