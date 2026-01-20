import { useEffect, useState } from 'react';
import { admissionService } from '@od-erp/api-client';
import { useNepSubjectReport } from '@od-erp/query';
import { processNepSubjectReportData, transformNepSubjectReportForExport } from '@od-erp/utils';
import { Button, Select, Title, Card, DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import * as xlsx from 'xlsx';
import { nepSubjectReportTableRow } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';

const NepSubjectReport = () => {
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<nepSubjectReportTableRow[]>([]);

    // Dropdown Data
    const [courses, setCourses] = useState<any[]>([]);
    const [streams, setStreams] = useState<string[]>([]);
    const [batches, setBatches] = useState<string[]>([]);

    // Selections
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedStream, setSelectedStream] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');

    const groupByOptions = [
        { name: "MDC", value: "mdcCode" },
        { name: "AEC", value: "aecCode" },
        { name: "SEC", value: "secCode" },
        { name: "VAC", value: "vacCode" }
    ];
    const [selectedGroup, setSelectedGroup] = useState(groupByOptions[0]);

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';

    // Query Hook parameters
    const { data: reportData, isLoading, refetch } = useNepSubjectReport(
        entityId,
        session,
        selectedCourse || undefined,
        selectedStream || undefined,
        selectedBatch || undefined,
        selectedGroup.value,
        selectedGroup.name
    );

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            const courseObj = courses.find(c => c.name === selectedCourse);
            if (courseObj) {
                setStreams(courseObj.stream || []);
                setBatches(courseObj.batch || []);
                // Reset child selections when course changes
                if (!courseObj.stream?.includes(selectedStream)) setSelectedStream('');
                if (!courseObj.batch?.includes(selectedBatch)) setSelectedBatch('');
            }
        } else {
            setStreams([]);
            setBatches([]);
        }
    }, [selectedCourse, courses]);

    useEffect(() => {
        if (reportData) {
            processData(reportData);
        }
    }, [reportData]);

    const loadInitialData = async () => {
        try {
            const courseRes = await admissionService.getCourseList(entityId, session, false);
            if (courseRes) {
                setCourses(courseRes);
                if (courseRes.length > 0) {
                    setSelectedCourse(courseRes[0].name);
                }
            }
        } catch (err) {
            console.error("Error loading initial data", err);
        }
    };

    const processData = (rawData: any[]) => {
        if (!rawData || !Array.isArray(rawData)) {
            console.warn('NepSubjectReport: Received invalid data', rawData);
            setData([]);
            return;
        }
        const processed = processNepSubjectReportData(rawData);
        setData(processed);
    };

    const handleSearch = () => {
        refetch();
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
            const exportData = transformNepSubjectReportForExport(data);
            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Nep Subject Report.xlsx');
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('nepSubjectData', JSON.stringify(data));
        window.open('/admission/print/nepSubjectReport', '_blank');
    };

    const columns: ColumnDef<nepSubjectReportTableRow>[] = [
        { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() === 0 ? '' : info.getValue() },
        { accessorKey: 'name', header: 'Subject Name' },
        { accessorKey: 'code', header: 'Subject Code', cell: info => info.getValue() || '-' },
        { accessorKey: 'seats', header: 'Seats' },
        { accessorKey: 'availableSeats', header: 'Available Seats' },
        { accessorKey: 'filledSeats', header: 'Filled Seats' },
        { accessorKey: 'pendingApplications', header: 'Pending Applications' },
    ];

    return (
        <div className="w-full max-w-full min-w-0 flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission &gt; <b>NEP Subject Report</b>
                    </div>
                    <Title variant="pageTitle">NEP Subject Report</Title>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Course</label>
                        <Select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            options={[
                                { value: '', label: 'Select Course' },
                                ...courses.map(c => ({ value: c.name, label: c.name }))
                            ]}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Stream</label>
                        <Select
                            value={selectedStream}
                            onChange={(e) => setSelectedStream(e.target.value)}
                            options={[
                                { value: '', label: 'Select Stream' },
                                ...streams.map(s => ({ value: s, label: s }))
                            ]}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Batch</label>
                        <Select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            options={[
                                { value: '', label: 'Select Batch' },
                                ...batches.map(b => ({ value: b, label: b }))
                            ]}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Group By</label>
                        <Select
                            value={selectedGroup.value}
                            onChange={(e) => {
                                const group = groupByOptions.find(g => g.value === e.target.value);
                                if (group) setSelectedGroup(group);
                            }}
                            options={groupByOptions.map(g => ({ value: g.value, label: g.name }))}
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

export default NepSubjectReport;
