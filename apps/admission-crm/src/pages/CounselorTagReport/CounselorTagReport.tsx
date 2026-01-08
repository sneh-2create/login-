import { useEffect, useState } from 'react';
import { CounselorTagReportService } from '@od-erp/api-client';
import { Button, Select, Title, Card, DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import * as xlsx from 'xlsx';
import { CounselorTagReportTableRow } from '@od-erp/types';
import { processCounselorTagData, transformCounselorTagForExport } from '@od-erp/utils';

const CounselorTagReport = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<CounselorTagReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<CounselorTagReportTableRow>[]>([]);

    // Filters
    const [counselors, setCounselors] = useState<any[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Metadata
    const entityId = '5e95a8d3eac1df35dd2d007f'; // Hardcoded for migration as per context
    const session = '2022-23'; // Hardcoded for migration as per context


    // Dynamic Tags
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        setupColumns();
    }, [tags]);

    const loadInitialData = async () => {
        try {
            // Load tags and admission master data
            const masterRes = await CounselorTagReportService.viewAdmissionMaster(entityId, session);
            if (masterRes && masterRes.tags) {
                setTags(masterRes.tags.map((t: any) => t.tag));
            }

            // Load counselors logic
            const empRes = await CounselorTagReportService.listEmployee(entityId, 'counselor');
            if (empRes) {
                setCounselors(empRes);
            }

        } catch (err) {
            console.error("Error loading initial data", err);
        }
    };

    const setupColumns = () => {
        const cols: ColumnDef<CounselorTagReportTableRow>[] = [
            { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() },
            { accessorKey: 'counselorName', header: 'Counselor Name' },
            { accessorKey: 'totalCount', header: 'Total Count' },
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

    const handleSearch = async () => {
        setLoading(true);
        try {
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : undefined;
            const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : undefined;
            const res = await CounselorTagReportService.counselorTagList(entityId, session, selectedCounselor || undefined, start, end);

            const processedData = processCounselorTagData(res, tags);
            setData(processedData);

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
            const exportData = transformCounselorTagForExport(data, tags);

            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Counselor_Tag_Report.xlsx');
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('counselorWiseLeadData', JSON.stringify(data));
        localStorage.setItem('tableHeads', JSON.stringify(tags));
        window.open('/admission/print/counselorTagReport', '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Counselor Tag Report</b>
                    </div>
                    <Title variant="pageTitle">Counselor Tag Report</Title>
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
                        <Button onClick={handleSearch} isLoading={loading}>Go</Button>
                    </div>
                </div>
            </Card>

            <DataTable
                columns={columns}
                data={data}
                isLoading={loading}
            />
        </div>
    );
};

export default CounselorTagReport;
