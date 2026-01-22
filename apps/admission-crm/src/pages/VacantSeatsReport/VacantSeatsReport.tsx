import { useEffect, useState, useMemo } from 'react';
import { vacantSeatsReportService } from '@od-erp/api-client';
import { ColumnDef } from '@tanstack/react-table';
import * as xlsx from 'xlsx';
import { vacantSeatsReportTableRow } from '@od-erp/types';
import { processVacantSeatsReportData, transformVacantSeatsForExport } from '@od-erp/utils';
import { useAppSelector } from '@od-erp/store';
import { ReportHeader } from './components/ReportHeader';
import { FilterSection } from './components/FilterSection';
import { SearchInput } from './components/SearchInput';
import { ReportTable } from './components/ReportTable';
import { TablePagination } from './components/TablePagination';

const vacantSeatsReport = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<vacantSeatsReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<vacantSeatsReportTableRow>[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    // const session = localStorage.getItem('session') || '2025-2026';
    const session = useAppSelector((state) => state.session.academicSession) || '';
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
        const cols: ColumnDef<vacantSeatsReportTableRow>[] = [
            { 
                accessorKey: 'position', 
                header: 'S.No', 
                cell: (info: any) => <span className="text-gray-500">{info.getValue()}</span>
            },
            { 
                accessorKey: 'course', 
                header: displayNames.course,
                cell: (info: any) => <span className="text-gray-700">{info.getValue()}</span>
            },
            { 
                accessorKey: 'stream', 
                header: displayNames.stream,
                cell: (info: any) => <span className="text-gray-700">{info.getValue()}</span>
            },
        ];

        if (showBatch) {
            cols.push({ 
                accessorKey: 'batch', 
                header: displayNames.batch,
                cell: (info: any) => <span className="text-gray-700">{info.getValue()}</span>
            });
        }

        cols.push(
            { 
                accessorKey: 'name', 
                header: 'Name',
                cell: (info: any) => <span className="font-medium text-gray-900">{info.getValue()}</span>
            },
            { 
                accessorKey: 'seats', 
                header: 'Seats',
                cell: (info: any) => <span className="text-gray-900">{info.getValue()}</span>
            },
            { 
                accessorKey: 'availableSeats', 
                header: 'Available Seats',
                cell: (info: any) => <span className="font-medium text-green-600">{info.getValue()}</span>
            },
            { 
                accessorKey: 'filledSeats', 
                header: 'Filled Seats',
                cell: (info: any) => <span className="font-medium text-blue-600">{info.getValue()}</span>
            },
            { 
                accessorKey: 'pendingApplications', 
                header: 'Pending Applications',
                cell: (info: any) => <span className="font-medium text-orange-600">{info.getValue()}</span>
            }
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

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        
        return data.filter((row: any) => {
            return Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [data, searchQuery]);

    // Pagination logic
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Reset to page 1 when data or search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data, searchQuery]);

    return (
        <div className="w-full max-w-full min-w-0 flex flex-col h-full bg-gray-50 p-8 gap-6">
            <ReportHeader
                displayName={displayNames.subjectCombination}
                onExport={handleExport}
                onPrint={handlePrint}
                exportLoading={exportLoading}
            />

            <FilterSection
                courses={courses}
                selectedCourse={selectedCourse}
                onCourseChange={handleCourseChange}
                streams={streams}
                selectedStream={selectedStream}
                onStreamChange={setSelectedStream}
                batches={batches}
                selectedBatch={selectedBatch}
                onBatchChange={setSelectedBatch}
                onSearch={handleSearch}
                loading={loading}
                showBatch={showBatch}
                displayNames={{
                    course: displayNames.course,
                    stream: displayNames.stream,
                    batch: displayNames.batch,
                }}
            />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <SearchInput
                        onSearch={setSearchQuery}
                        placeholder="Search..."
                    />
                </div>

                <ReportTable
                    columns={columns}
                    data={paginatedData}
                    isLoading={loading}
                />

                {filteredData.length > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={filteredData.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default vacantSeatsReport;
