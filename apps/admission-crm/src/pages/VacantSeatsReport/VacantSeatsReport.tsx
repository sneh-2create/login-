import { useEffect, useState } from 'react';
import { vacantSeatsReportService } from '@od-erp/api-client';
import { Button, Select, Title, Card, DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer } from 'lucide-react';
import * as xlsx from 'xlsx';
import { VacantSeatsReportTableRow } from '@od-erp/types';
import { processVacantSeatsReportData, transformVacantSeatsForExport } from '@od-erp/utils';

const vacantSeatsReport = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<VacantSeatsReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<VacantSeatsReportTableRow>[]>([]);

    // Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    const [streams, setStreams] = useState<string[]>([]);
    const [selectedStream, setSelectedStream] = useState<string>('');

    const [batches, setBatches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');

    // Metadata
    // Note: In a real app, these might come from context or a hook
    // const entityId = localStorage.getItem('entityId') || '5e95a8d3eac1df35dd2d007f';
    const entityId = '5e95a8d3eac1df35dd2d007f';
    // const session = localStorage.getItem('session') || '2025-2026';
    const session = '2022-23';
    const entityPreferences = JSON.parse(localStorage.getItem('entityPreferences') || '{}');

    const displayNames = {
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
        subjectCombination: entityPreferences.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
    };

    // Default showBatch to true if preference is undefined/missing to ensure visibility if data exists
    // Using loose check or default
    const showBatch = entityPreferences.showBatch !== undefined ? entityPreferences.showBatch : true;

    useEffect(() => {
        console.log("VacancyReport Init: ", { entityId, session, entityPreferences });
        loadCourses();
    }, []);

    useEffect(() => {
        setupColumns();
    }, [showBatch]); // Re-run if showBatch changes (though it's constant per render usually)

    const setupColumns = () => {
        console.log("Setting up columns. ShowBatch:", showBatch);
        const cols: ColumnDef<VacantSeatsReportTableRow>[] = [
            { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() },
            { accessorKey: 'course', header: displayNames.course },
            { accessorKey: 'stream', header: displayNames.stream },
        ];

        if (showBatch) {
            cols.push({ accessorKey: 'batch', header: displayNames.batch });
        }

        cols.push(
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'seats', header: 'Seats' },
            { accessorKey: 'availableSeats', header: 'Available Seats' },
            { accessorKey: 'filledSeats', header: 'Filled Seats' },
            { accessorKey: 'pendingApplications', header: 'Pending Applications' }
        );

        setColumns(cols);
    };

    const loadCourses = async () => {
        try {
            if (!entityId) return;
            // passing undefined for isLeet as per angular code
            const res = await vacantSeatsReportService.getCourseList(entityId, session);
            setCourses(res || []);
            // Select first course by default if desired, following Angular logic:
            // if (res && res.length > 0) handleCourseChange(res[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCourseChange = (course: any) => {
        setSelectedCourse(course);
        if (course) {
            setStreams(course.stream || []);
            setBatches(course.batch || []);
            // Reset dependent filters
            setSelectedStream('');
            setSelectedBatch('');
        } else {
            setStreams([]);
            setBatches([]);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const courseName = selectedCourse ? selectedCourse.name : undefined;
            const streamName = selectedStream || undefined;
            const batchName = selectedBatch || undefined;

            const res = await vacantSeatsReportService.getVacantSeatsReport(entityId, session, courseName, streamName, batchName);

            console.log("VacantSeatsReport response:", res);

            let resultData = res;
            if (!Array.isArray(res)) {
                if (res && Array.isArray(res.data)) {
                    resultData = res.data;
                } else {
                    console.error("API Response is not an array", res);
                    setData([]);
                    return;
                }
            }

            const processedData = processVacantSeatsReportData(resultData);
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
            // Prepare data suitable for export
            const exportData = transformVacantSeatsForExport(data, displayNames, showBatch);

            const ws = xlsx.utils.json_to_sheet(exportData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Subject_Combination_Reports.xlsx');
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('vacantSeatsReportData', JSON.stringify(data));
        window.open('/admission/print/vacantSeats', '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xs text-gray-500 mb-1 cursor-pointer">
                        Dashboard &gt; Admission Reports &gt; <b>{displayNames.subjectCombination} Report</b>
                    </div>
                    <Title variant="pageTitle">{displayNames.subjectCombination} Report</Title>
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
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Data for Course</label>
                        <Select
                            value={selectedCourse?.name || ''}
                            onChange={(e) => {
                                const course = courses.find(c => c.name === e.target.value);
                                handleCourseChange(course);
                            }}
                            options={[
                                { value: '', label: 'Select Course' },
                                ...courses.map(c => ({ value: c.name, label: c.name }))
                            ]}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Select {displayNames.stream}</label>
                        <Select
                            value={selectedStream}
                            onChange={(e) => setSelectedStream(e.target.value)}
                            options={[
                                { value: '', label: `Select ${displayNames.stream}` },
                                ...streams.map(s => ({ value: s, label: s }))
                            ]}
                        />
                    </div>

                    {showBatch && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Select {displayNames.batch}</label>
                            <Select
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                options={[
                                    { value: '', label: `Select ${displayNames.batch}` },
                                    ...batches.map(b => ({ value: b, label: b }))
                                ]}
                            />
                        </div>
                    )}

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

export default vacantSeatsReport;
