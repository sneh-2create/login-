import { useEffect, useState, useMemo } from 'react';
import { vacantSeatsReportService } from '@od-erp/api-client';
import { ColumnDef } from '@tanstack/react-table';
import * as xlsx from 'xlsx';
import { VacantSeatsReportTableRow } from '@od-erp/types';
import { processVacantSeatsReportData } from '@od-erp/utils';
import { useAppSelector } from '@od-erp/store';
import { Button, Dropdown, Breadcrumb, DataTable, Input } from '@od-erp/ui';
import { Download, Printer, SlidersHorizontal, RefreshCw, Search } from 'lucide-react';

const vacantSeatsReport = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<VacantSeatsReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<VacantSeatsReportTableRow>[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
   
    // Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    const [streams, setStreams] = useState<string[]>([]);
    const [selectedStream, setSelectedStream] = useState<string>('');

    const [batches, setBatches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');

    const [showFilter, setShowFilter] = useState(true);

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityPreferences = JSON.parse(localStorage.getItem('entityPreferences') || '{}');

    const displayNames = {
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
        subjectCombination: entityPreferences.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
    };

    const showBatch = entityPreferences.showBatch !== undefined ? entityPreferences.showBatch : true;

    useEffect(() => {
        loadCourses();
        setupColumns();
    }, [entityId]);

    useEffect(() => {
        setupColumns();
    }, [showBatch]);

    const setupColumns = () => {
        const cols: ColumnDef<VacantSeatsReportTableRow>[] = [
            {
                accessorKey: 'position',
                header: 'S.No',
                cell: (info: any) => {
                    const row = info.row.original;
                    if (row.course === 'Total') return '';
                    return <span className="text-gray-500">{info.getValue()}</span>;
                }
            },
            {
                accessorKey: 'course',
                header: displayNames.course,
                cell: (info: any) => {
                    const row = info.row.original;
                    const val = info.getValue();
                    return row.course === 'Total' ? <span className="font-bold">{val}</span> : <span className="text-gray-700">{val}</span>;
                }
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
                cell: (info: any) => {
                    const row = info.row.original;
                    if (row.course === 'Total') return '';
                    return <span className="font-medium text-gray-900">{info.getValue()}</span>;
                }
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
            const res = await vacantSeatsReportService.getCourseList(entityId, session);
            setCourses(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCourseChange = (courseName: string) => {
        setSelectedCourse(courseName);
        const course = courses.find(c => c.name === courseName);

        if (course) {
            setStreams(course.stream || []);
            setBatches(course.batch || []);
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
            const courseName = selectedCourse || undefined;
            const streamName = selectedStream || undefined;
            const batchName = selectedBatch || undefined;

            const res = await vacantSeatsReportService.getVacantSeatsReport(entityId, session, courseName, streamName, batchName);

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
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            // Headers
            xlsx.utils.sheet_add_aoa(ws, [['Subject Combination Report']], { origin: "A1" });
            xlsx.utils.sheet_add_aoa(ws, [[`Generated At: ${new Date().toLocaleString()}`]], { origin: "A2" });
            xlsx.utils.sheet_add_aoa(ws, [[]], { origin: "A3" });

            // Columns definition for export
            const exportColumns = [
                { header: 'S.No', key: 'position' },
                { header: displayNames.course, key: 'course' },
                { header: displayNames.stream, key: 'stream' },
            ];

            if (showBatch) {
                exportColumns.push({ header: displayNames.batch, key: 'batch' });
            }

            exportColumns.push(
                { header: 'Name', key: 'name' },
                { header: 'Seats', key: 'seats' },
                { header: 'Available', key: 'availableSeats' },
                { header: 'Filled', key: 'filledSeats' },
                { header: 'Pending', key: 'pendingApplications' }
            );

            // Table Headers
            const tableHeaders = exportColumns.map(c => c.header);
            xlsx.utils.sheet_add_aoa(ws, [tableHeaders], { origin: "A4" });

            // Data
            const dataRows = data.map((row: any) => {
                const isTotalRow = row.course === 'Total';

                return exportColumns.map((col) => {
                    // S.No logic
                    if (col.key === 'position') {
                        if (isTotalRow) return '';
                        return row.position;
                    }
                    
                    // Name logic for Total row
                    if (col.key === 'name' && isTotalRow) {
                        return '';
                    }

                    return row[col.key] || (row[col.key] === 0 ? 0 : '');
                });
            });

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: "A5" });

            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Subject_Combination_Reports.xlsx');
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        const printData = data.map(item => {
             const newItem = { ...item };
             if (newItem.course === 'Total') {
                 newItem.name = ''; // Clear name for Total row
             }
             return newItem;
        });

        localStorage.setItem('vacantSeatsReportData', JSON.stringify(printData));
        window.open('/admission/print/vacantSeats', '_blank');
    };

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        return data.filter((row: any) => {
            return Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [data, searchQuery]);

    return (
        <div className="w-full max-w-full font-sans pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayNames.subjectCombination} Report</h1>
                    <Breadcrumb 
                        items={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admission Reports', href: '/admission/reports' },
                            { label: `${displayNames.subjectCombination} Report` }
                        ]}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        className={`!p-0 !w-9 !h-9 border-gray-300 ${showFilter ? 'bg-orange-50 border-orange-200 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setShowFilter(!showFilter)}
                        title="Filter"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>

                    <Button 
                        variant="outline" 
                        className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                        onClick={handleSearch}
                        title="Refresh/Go"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>

                    {data.length > 0 && (
                        <>
                            <Button 
                                variant="outline" 
                                className="!p-0 !w-9 !h-9 border-gray-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={handleExport}
                                isLoading={exportLoading}
                                title="Export to Excel"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                className="!p-0 !w-9 !h-9 border-gray-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={handlePrint}
                                title="Print"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {showFilter && (
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Select {displayNames.course}</label>
                            <Dropdown
                                value={selectedCourse}
                                onChange={(val) => handleCourseChange(val as string)}
                                options={[
                                    { value: '', label: `Select ${displayNames.course}` },
                                    ...courses.map(c => ({ value: c.name, label: c.name }))
                                ]}
                                placeholder={`Select ${displayNames.course}`}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Select {displayNames.stream}</label>
                            <Dropdown
                                value={selectedStream}
                                onChange={(val) => setSelectedStream(val as string)}
                                options={[
                                    { value: '', label: `Select ${displayNames.stream}` },
                                    ...streams.map(s => ({ value: s, label: s }))
                                ]}
                                placeholder={`Select ${displayNames.stream}`}
                                className="w-full"
                            />
                        </div>
                        {showBatch && (
                            <div className="w-full">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Select {displayNames.batch}</label>
                                <Dropdown
                                    value={selectedBatch}
                                    onChange={(val) => setSelectedBatch(val as string)}
                                    options={[
                                        { value: '', label: `Select ${displayNames.batch}` },
                                        ...batches.map(b => ({ value: b, label: b }))
                                    ]}
                                    placeholder={`Select ${displayNames.batch}`}
                                    className="w-full"
                                />
                            </div>
                        )}
                         <div className="w-full md:w-auto">
                            <Button variant="primary" onClick={handleSearch} isLoading={loading} className="w-full md:w-auto">
                                Go
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {data.length > 0 && (
                <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
                        <h3 className="font-semibold text-gray-700 whitespace-nowrap">Report Data</h3>
                        <div className="relative w-64">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9 text-sm"
                            />
                        </div>
                    </div>

                    <div className="w-full max-w-full overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            isLoading={loading}
                            showSearch={false}
                        />
                    </div>
                </div>
            )}

            {!loading && data.length === 0 && (
                <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <span className="text-gray-400 text-lg font-medium">No Records Found</span>
                </div>
            )}
        </div>
    );
};

export default vacantSeatsReport;
