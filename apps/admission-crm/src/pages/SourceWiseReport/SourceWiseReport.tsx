import { useEffect, useState } from 'react';
import { admissionService } from '@od-erp/api-client';
import { useSourceWiseReport } from '@od-erp/query';
import { calculateReportTotals } from '@od-erp/utils';
import { Button, Select, Title, Card, DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import * as xlsx from 'xlsx';
import { SourceWiseReportTableRow } from '@od-erp/types';

const SourceWiseReport = () => {
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<SourceWiseReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<SourceWiseReportTableRow>[]>([]);

    // Filters
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');

    // Dropdown Data
    const [sourceList, setSourceList] = useState<string[]>([]);
    const [counselors, setCounselors] = useState<any[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    // Metadata
    const entityId = '5e95a8d3eac1df35dd2d007f'; // Hardcoded for migration
    const session = '2022-23'; // Hardcoded for migration

    // Query Hook
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : undefined;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : undefined;

    // We only fetch when user clicks Go? 
    // Angular: Click Go -> `listSourceLeadReport`. 
    // React Query is declarative. To mimic "Go" button, we can use a separate state that updates only on "Go".


    const { data: reportData, isLoading, refetch } = useSourceWiseReport(
        entityId,
        session,
        'lead', // Hardcoded as 'lead' based on Angular's primary tab logic (lead summary)
        start,
        end,
        selectedSource || undefined,
        selectedCounselor || undefined
    );

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        setupColumns();
    }, [tags]);

    useEffect(() => {
        if (reportData) {
            processData(reportData);
        }
    }, [reportData]);

    const loadInitialData = async () => {
        try {
            const masterRes = await admissionService.viewAdmissionMaster(entityId, session);
            if (masterRes) {
                if (masterRes.tags) setTags(masterRes.tags.map((t: any) => t.tag));
                if (masterRes.source) setSourceList(masterRes.source);
            }

            const empRes = await admissionService.listEmployee(entityId, 'counselor');
            if (empRes) setCounselors(empRes);

        } catch (err) {
            console.error("Error loading initial data", err);
        }
    };

    const setupColumns = () => {
        const cols: ColumnDef<SourceWiseReportTableRow>[] = [
            { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() === 0 ? '' : info.getValue() },
            { accessorKey: 'source', header: 'Source' },
            { accessorKey: 'totalLeadCount', header: 'Total Lead Count' },
            { accessorKey: 'totalApplicationCount', header: 'Total Application Count' },
        ];

        tags.forEach(tag => {
            cols.push({
                accessorKey: tag,
                header: tag,
                cell: info => info.getValue() || 0
            });
        });

        setColumns(cols);
    };

    const processData = (rawData: any[]) => {
        const processed = calculateReportTotals(
            rawData,
            tags,
            ['totalLeadCount', 'totalApplicationCount']
        );
        setData(processed);
    };

    const handleSearch = () => {
        refetch();
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
            const exportData = data.map(row => {
                const newRow: any = {
                    'S.No': row.position === 0 ? '' : row.position,
                    'Source': row.source,
                    'Total Lead Count': row.totalLeadCount,
                    'Total Application Count': row.totalApplicationCount
                };
                tags.forEach(tag => {
                    newRow[tag] = row[tag] || 0;
                });
                return newRow;
            });

            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Source_Wise_Reports.xlsx');
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('sourceWiseLeadData', JSON.stringify(data));
        localStorage.setItem('tableHeads', JSON.stringify(tags));
        window.open('/admission/print/sourceWiseReport', '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Source Wise Report</b>
                    </div>
                    <Title variant="pageTitle">Source Wise Report</Title>
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
                        Export to Excel
                    </Button>
                </div>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Select Source</label>
                        <Select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            options={[
                                { value: '', label: 'Select Source' },
                                ...sourceList.map(s => ({ value: s, label: s }))
                            ]}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Select Counselor</label>
                        <Select
                            value={selectedCounselor}
                            onChange={(e) => setSelectedCounselor(e.target.value)}
                            options={[
                                { value: '', label: 'Select Counselor' },
                                ...counselors.map(c => ({ value: c._id, label: c.name }))
                            ]}
                        />
                    </div>

                    <div>
                        <Button onClick={handleSearch} isLoading={isLoading}>Go</Button>
                    </div>
                </div>
            </Card>

            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
            />
        </div>
    );
};

export default SourceWiseReport;
