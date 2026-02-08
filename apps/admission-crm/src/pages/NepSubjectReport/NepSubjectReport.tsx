import { useEffect, useState, useMemo, ReactNode } from 'react';
import { admissionService } from '@od-erp/api-client';
import { useNepSubjectReport } from '@od-erp/query';
import { processNepSubjectReportData } from '@od-erp/utils';
import { Button, Dropdown, Breadcrumb, DataTable, Input } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, SlidersHorizontal, RefreshCw, Search } from 'lucide-react';
import * as xlsx from 'xlsx';
import { NepSubjectReportTableRow } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';

const NepSubjectReport = () => {
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<NepSubjectReportTableRow[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilter, setShowFilter] = useState(true);

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
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    // Fallback to localStorage if store permissions are empty or not populated yet, matching legacy behavior
    const localPermissions = localStorage.getItem('permissions') || ''; 
    
    const hasViewPermission = permissions.includes('viewAssessmentMarks') || localPermissions.includes('viewAssessmentMarks');

    // Query Hook parameters
    const { data: reportData, isLoading, refetch } = useNepSubjectReport(
        entityId,
        session,
        selectedCourse || undefined,
        selectedStream || undefined,
        selectedBatch || undefined,
        selectedGroup.value,
        selectedGroup.name,
        false // Disable auto-fetch, wait for user to click Go
    );

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedCourse && courses.length > 0) {
            const courseObj = courses.find(c => c.name === selectedCourse);
            if (courseObj) {
                const courseStreams = courseObj.stream || [];
                const courseBatches = courseObj.batch || [];

                setStreams(courseStreams);
                setBatches(courseBatches);

                // Auto-select first stream if current selection is invalid or empty
                if (courseStreams.length > 0 && (!selectedStream || !courseStreams.includes(selectedStream))) {
                    setSelectedStream(courseStreams[0]);
                } else if (courseStreams.length === 0) {
                    setSelectedStream('');
                }

                // Auto-select first batch if current selection is invalid or empty
                if (courseBatches.length > 0 && (!selectedBatch || !courseBatches.includes(selectedBatch))) {
                    setSelectedBatch(courseBatches[0]);
                } else if (courseBatches.length === 0) {
                    setSelectedBatch('');
                }
            }
        } else {
            setStreams([]);
            setBatches([]);
            setSelectedStream('');
            setSelectedBatch('');
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

        // Check if Total row exists, if not calculate and add
        const hasTotal = processed.some((row: any) => row.name === 'Total' || row.course === 'Total'); // Adjust based on actual data shape
        
        if (!hasTotal && processed.length > 0) {
             const totalRow: any = {
                position: 0, // Indicator for total
                name: 'Total',
                code: '',
                seats: 0,
                availableSeats: 0,
                filledSeats: 0,
                pendingApplications: 0
            };

            processed.forEach((item: any) => {
                totalRow.seats += (Number(item.seats) || 0);
                totalRow.availableSeats += (Number(item.availableSeats) || 0);
                totalRow.filledSeats += (Number(item.filledSeats) || 0);
                totalRow.pendingApplications += (Number(item.pendingApplications) || 0);
            });
            processed.push(totalRow);
        }

        setData(processed);
    };

    const handleSearch = () => {
        if (hasViewPermission) {
            refetch();
        }
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
             const wb = xlsx.utils.book_new();
             const ws: xlsx.WorkSheet = {};
 
             // Headers
             xlsx.utils.sheet_add_aoa(ws, [['NEP Subject Report']], { origin: "A1" });
             xlsx.utils.sheet_add_aoa(ws, [[`Generated At: ${new Date().toLocaleString()}`]], { origin: "A2" });
             xlsx.utils.sheet_add_aoa(ws, [[]], { origin: "A3" });
 
             // Columns definition for export
             const exportColumns = [
                 { header: 'S.No', key: 'position' },
                 { header: 'Name', key: 'name' },
                 { header: 'Code', key: 'code' },
                 { header: 'Seats', key: 'seats' },
                 { header: 'Available Seats', key: 'availableSeats' },
                 { header: 'Filled Seats', key: 'filledSeats' },
                 { header: 'Pending Applications', key: 'pendingApplications' },
             ];
 
             // Table Headers
             const tableHeaders = exportColumns.map(c => c.header);
             xlsx.utils.sheet_add_aoa(ws, [tableHeaders], { origin: "A4" });
 
             // Data
             const dataRows = data.map((row: any) => {
                 const isTotalRow = row.name === 'Total';
 
                 return exportColumns.map((col) => {
                     // S.No logic
                     if (col.key === 'position') {
                         if (isTotalRow) return '';
                         return row.position;
                     }
                     
                     return row[col.key] || (row[col.key] === 0 ? 0 : '');
                 });
             });
 
             xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: "A5" });
 
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

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        return data.filter((row: any) => {
            return Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [data, searchQuery]);


    const columns: ColumnDef<NepSubjectReportTableRow>[] = [
        { 
            accessorKey: 'position', 
            header: 'S.No', 
            cell: info => {
                const row = info.row.original;
                if (row.name === 'Total') return '';
                return <span className="text-gray-500">{info.getValue() as ReactNode}</span>;
            }
        },
        { 
            accessorKey: 'name', 
            header: 'Name',
            cell: info => {
                const row = info.row.original;
                return row.name === 'Total' ? <span className="font-bold">Total</span> : <span className="font-medium text-gray-900">{info.getValue() as ReactNode}</span>;
            }
        },
        { 
            accessorKey: 'code', 
            header: 'Code', 
            cell: info => (info.getValue() as ReactNode) || '-' 
        },
        { 
            accessorKey: 'seats', 
            header: 'Seats',
            cell: info => <span className="text-gray-900">{info.getValue() as ReactNode}</span>
        },
        { 
            accessorKey: 'availableSeats', 
            header: 'Available Seats',
            cell: info => <span className="font-medium text-green-600">{info.getValue() as ReactNode}</span>
        },
        { 
            accessorKey: 'filledSeats', 
            header: 'Filled Seats',
            cell: info => <span className="font-medium text-blue-600">{info.getValue() as ReactNode}</span>
        },
        { 
            accessorKey: 'pendingApplications', 
            header: 'Pending Applications',
            cell: info => <span className="font-medium text-orange-600">{info.getValue() as ReactNode}</span>
        },
    ];

    return (
        <div className="w-full max-w-full font-sans pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">NEP Subject Report</h1>
                    <Breadcrumb 
                        items={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admission Reports', href: '/admission/reports' },
                            { label: 'NEP Subject Report' }
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

                    {hasViewPermission && (
                         <Button 
                            variant="outline" 
                            className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                            onClick={handleSearch}
                            title="Refresh/Go"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    )}
                   
                    {data.length > 0 && (
                        <>
                             <Button 
                                variant="outline" 
                                className="!p-0 !w-9 !h-9 border-gray-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={handlePrint}
                                title="Print"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="!p-0 !w-9 !h-9 border-gray-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={handleExport}
                                isLoading={exportLoading}
                                title="Export to Excel"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {showFilter && (
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Course</label>
                            <Dropdown
                                value={selectedCourse}
                                onChange={(val) => setSelectedCourse(val as string)}
                                options={[
                                    { value: '', label: 'Select Course' },
                                    ...courses.map(c => ({ value: c.name, label: c.name }))
                                ]}
                                placeholder="Select Course"
                                className="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Stream</label>
                             <Dropdown
                                value={selectedStream}
                                onChange={(val) => setSelectedStream(val as string)}
                                options={[
                                    { value: '', label: 'Select Stream' },
                                    ...streams.map(s => ({ value: s, label: s }))
                                ]}
                                placeholder="Select Stream"
                                className="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Batch</label>
                             <Dropdown
                                value={selectedBatch}
                                onChange={(val) => setSelectedBatch(val as string)}
                                options={[
                                    { value: '', label: 'Select Batch' },
                                    ...batches.map(b => ({ value: b, label: b }))
                                ]}
                                placeholder="Select Batch"
                                className="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Subject Type</label>
                              <Dropdown
                                value={selectedGroup.value}
                                onChange={(val) => {
                                    const group = groupByOptions.find(g => g.value === val);
                                    if (group) setSelectedGroup(group);
                                }}
                                options={groupByOptions.map(g => ({ value: g.value, label: g.name }))}
                                placeholder="Select Group"
                                className="w-full"
                            />
                        </div>

                        <div className="w-full md:w-auto">
                           {hasViewPermission && (
                                <Button onClick={handleSearch} isLoading={isLoading} className="w-full">Go</Button>
                            )}
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
                            isLoading={isLoading}
                             showSearch={false}
                        />
                    </div>
                </div>
            )}

             {!isLoading && data.length === 0 && (
                <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <span className="text-gray-400 text-lg font-medium">No Records Found</span>
                </div>
            )}
        </div>
    );
};

export default NepSubjectReport;
