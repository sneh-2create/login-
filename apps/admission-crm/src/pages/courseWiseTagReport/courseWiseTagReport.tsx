import { useEffect, useState } from 'react';
import { admissionService } from '@od-erp/api-client';
import { useCourseWiseTagReport } from '@od-erp/query'; // Hook I created
import { processCourseWiseTagData, transformCourseWiseTagForExport } from '@od-erp/utils';
import { useAppSelector } from '@od-erp/store';
import { Button, Select, Title, Card, DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import * as xlsx from 'xlsx';
import { CourseWiseTagReportTableRow } from '@od-erp/types';

const courseWiseTagReport = () => {
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<CourseWiseTagReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<CourseWiseTagReportTableRow>[]>([]);

    // Filters
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');

    // Dropdown Data
    const [counselors, setCounselors] = useState<any[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    // Metadata
    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';

    // Query Hook parameters
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : undefined;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : undefined;

    const { data: reportData, isLoading, refetch } = useCourseWiseTagReport(
        entityId,
        session,
        selectedCounselor || undefined,
        start,
        end
    );

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        setupColumns();
    }, [tags]);

    useEffect(() => {
        if (reportData && Array.isArray(reportData)) {
            processData(reportData);
        }
    }, [reportData, tags]); // Depend on tags too

    const loadInitialData = async () => {
        try {
            const masterRes = await admissionService.viewAdmissionMaster(entityId, session);
            if (masterRes && masterRes.tags) {
                setTags(masterRes.tags.map((t: any) => t.tag));
            }

            const empRes = await admissionService.listEmployee(entityId, 'counselor');
            if (empRes) setCounselors(empRes);

        } catch (err) {
            console.error("Error loading initial data", err);
        }
    };

    const setupColumns = () => {
        const cols: ColumnDef<CourseWiseTagReportTableRow>[] = [
            { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() === 0 ? '' : info.getValue() },
            { accessorKey: 'course', header: 'Course' },
            { accessorKey: 'stream', header: 'Stream', cell: info => info.getValue() || '-' }, // Stream might be optional or empty
            { accessorKey: 'total', header: 'Total', cell: info => info.getValue() || 0 },
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
        if (!rawData || !Array.isArray(rawData)) {
            console.warn('courseWiseTagReport: Received invalid data', rawData);
            setData([]);
            return;
        }
        const processed = processCourseWiseTagData(rawData, tags);
        setData(processed);
    };

    const handleSearch = () => {
        refetch();
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
            const exportData = transformCourseWiseTagForExport(data, tags);
            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Course_Wise_Tag_Report.xlsx');
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('printData', JSON.stringify(data));
        localStorage.setItem('printColumns', JSON.stringify(tags));
        localStorage.setItem('reportName', 'Course Wise Tag Report');
        // Assuming a generic print page or specific one. 
        // Angular used 'printCourseWiseTagReport'.
        window.open('/admission/print/courseWiseTagReport', '_blank');
    };

    return (
        <div className="w-full max-w-full min-w-0 flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>Course Wise Tag Report</b>
                    </div>
                    <Title variant="pageTitle">Course Wise Tag Report</Title>
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

            <div className="w-full max-w-full overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default courseWiseTagReport;
