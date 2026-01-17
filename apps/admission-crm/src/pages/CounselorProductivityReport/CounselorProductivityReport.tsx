import { useEffect, useState } from 'react';
import { useCounselorProductivityReport, useCounselors } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { processCounselorProductivityReportData, transformCounselorProductivityReportForExport } from '@od-erp/utils';
import { Button, Title, Card, DataTable, Input, Select } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import * as xlsx from 'xlsx';
import { counselorProductivityReportTableRow } from '@od-erp/types';

const CounselorProductivityReport = () => {
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<counselorProductivityReportTableRow[]>([]);
    const [stageType, setStageType] = useState<'lead' | 'application'>('lead');
    const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';

    // Date Filter
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Calculate timestamps for query
    const getStartTimestamp = () => {
        const date = new Date(startDate);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    };

    const getEndTimestamp = () => {
        const date = new Date(endDate);
        date.setHours(23, 59, 59, 999);
        return date.getTime();
    };

    // Filters
    const { data: counselors } = useCounselors(entityId, 'Counselor');

    // Query Hook parameters
    const { data: reportData, isLoading, refetch } = useCounselorProductivityReport(
        entityId,
        session,
        stageType,
        getStartTimestamp(),
        getEndTimestamp(),
        selectedCounselor || undefined
    );

    useEffect(() => {
        if (reportData && Array.isArray(reportData)) {
            const { processedRows, dynamicColumns: dynCols } = processCounselorProductivityReportData(reportData, stageType);
            setData(processedRows);
            setDynamicColumns(dynCols);
        } else {
            const { processedRows, dynamicColumns: dynCols } = processCounselorProductivityReportData([], stageType);
            setData(processedRows);
            setDynamicColumns(dynCols);
        }
    }, [reportData, stageType]);

    const handleSearch = () => {
        refetch();
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
            const exportData = transformCounselorProductivityReportForExport(data, dynamicColumns, stageType);
            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, `Counselor_Productivity_${stageType}_Report.xlsx`);
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('counselorProductivityData', JSON.stringify(data));
        localStorage.setItem('counselorProductivityDynamicColumns', JSON.stringify(dynamicColumns));
        localStorage.setItem('counselorProductivityStageType', stageType);
        window.open('/admission/print/counselorProductivityReport', '_blank');
    };

    const columns: ColumnDef<counselorProductivityReportTableRow>[] = [
        { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() === 0 ? '' : info.getValue() },
        { accessorKey: 'counselorName', header: 'Counselor Name' },
        { accessorKey: 'totalCount', header: stageType === 'lead' ? 'Total Leads' : 'Application Count' },
        { accessorKey: 'engagedCount', header: 'Engaged Leads' },
        { accessorKey: 'untouchedCount', header: 'Untouched Leads' },
        { accessorKey: 'completeFollowUp', header: "Today's Follow Up Done" },
        { accessorKey: 'overDueFollowUp', header: 'Pending Follow Ups' },
    ];

    // Add dynamic columns
    dynamicColumns.forEach(tag => {
        columns.push({
            accessorKey: `tag_${tag}`,
            header: tag,
            cell: info => {
                const row = info.row.original;
                const tagObj = row.tags?.find((t: any) => t.tag === tag);
                return tagObj ? tagObj.count : 0;
            }
        });
    });

    const counselorOptions = counselors?.map((c: any) => ({
        label: `${c.firstName} ${c.lastName || ''}`.trim(),
        value: c._id
    })) || [];

    counselorOptions.unshift({ label: 'All Counselors', value: '' });

    return (
        <div className="flex flex-col h-full w-full max-w-full min-w-0 bg-gray-50 p-4 md:p-6 gap-4 md:gap-6 overflow-hidden box-border bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center shrink-0 flex-wrap gap-2 w-full min-w-0">
                <div className="min-w-0 truncate">
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Counselor Productivity Report</b>
                    </div>
                    <Title variant="pageTitle">Counselor Productivity Report</Title>
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

            <div className="flex gap-4 border-b border-gray-200 shrink-0 overflow-x-auto">
                <button
                    className={`pb-2 px-4 text-sm font-medium whitespace-nowrap ${stageType === 'lead' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setStageType('lead')}
                >
                    Lead Summary
                </button>
                <button
                    className={`pb-2 px-4 text-sm font-medium whitespace-nowrap ${stageType === 'application' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setStageType('application')}
                >
                    Application Summary
                </button>
            </div>

            <Card className="p-4 shrink-0">
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="min-w-[200px] flex-1 md:flex-none">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Counselor</label>
                        <Select
                            options={counselorOptions}
                            value={selectedCounselor}
                            onChange={(e) => setSelectedCounselor(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 md:flex-none">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="flex-1 md:flex-none">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div>
                        <Button onClick={handleSearch} isLoading={isLoading}>Go</Button>
                    </div>
                </div>
            </Card>

            <div className="flex-1 min-h-0 min-w-0 w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white flex flex-col">
                <div className="flex-1 w-full max-w-full overflow-auto">
                    <DataTable
                        columns={columns}
                        data={data}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default CounselorProductivityReport;
