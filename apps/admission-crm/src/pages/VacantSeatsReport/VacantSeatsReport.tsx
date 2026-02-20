import { useEffect, useState } from 'react';
import { vacantSeatsReportService } from '@od-erp/api-client';
import { ColumnDef } from '@tanstack/react-table';
import * as xlsx from 'xlsx';
import { VacantSeatsReportTableRow } from '@od-erp/types';
import { processVacantSeatsReportData, addExcelReportHeader, addExcelReportFooter, transformVacantSeatsForExport } from '@od-erp/utils';
import { useAppSelector } from '@od-erp/store';
import { Button, SelectSingle, DataTable, PageHeader, PageToolbar, EmptyState, ActionButton } from '@od-erp/ui';
import { Download, Printer, SlidersHorizontal, RefreshCw } from 'lucide-react';

const VacantSeatsReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<VacantSeatsReportTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<VacantSeatsReportTableRow>[]>([]);

    // Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    const [streams, setStreams] = useState<string[]>([]);
    const [selectedStream, setSelectedStream] = useState<string>('');

    const [batches, setBatches] = useState<string[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');

    const [showFilter, setShowFilter] = useState(false);

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    const entityPreferences = useAppSelector((state) => state.config.entityPreferences) || null;
    const displayNames = {
        course: entityPreferences?.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences?.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences?.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
        subjectCombination: entityPreferences?.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
    };

    const showBatch = entityPreferences?.showBatch !== undefined ? entityPreferences?.showBatch : true;

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
                cell: (info: any) => <span className="font-medium text-primary">{info.getValue()}</span>
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
            const courseStreams = course.stream || [];
            const courseBatches = course.batch || [];
            setStreams(courseStreams);
            setBatches(courseBatches);
            
            // Auto Select 1st Stream
            if (courseStreams.length > 0) {
                setSelectedStream(courseStreams[0]);
            } else {
                 setSelectedStream('');
            }
           
            // Auto Select 1st Batch
            if (courseBatches.length > 0) {
                setSelectedBatch(courseBatches[0]);
            } else {
                setSelectedBatch('');
            }
        } else {
            setStreams([]);
            setBatches([]);
            setSelectedStream('');
            setSelectedBatch('');
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
        try {
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            const tableStartRow = addExcelReportHeader(ws, entityName, `${displayNames.subjectCombination} Report`);

            // Transform Data using common utility
            const exportData = transformVacantSeatsForExport(data, displayNames, showBatch);
            
            // Get Headers dynamically from the first row of exportData
            if(exportData.length > 0) {
                 const headers = Object.keys(exportData[0]);
                 xlsx.utils.sheet_add_aoa(ws, [headers], { origin: { r: tableStartRow, c: 0 } });
                 
                 // Process Data rows to match headers order
                  const dataRows = exportData.map(row => headers.map(header => row[header]));
                  xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

                  const signatureRow = tableStartRow + 1 + dataRows.length + 4;
                  addExcelReportFooter(ws, signatureRow);
            }

            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, 'Subject_Combination_Reports.xlsx');
        } catch (error) {
            console.error(error);
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

        localStorage.setItem('subjectCombinationData', JSON.stringify(printData));
        window.open('/admission/print/vacantSeats', '_blank');
    };

    const actionButtons: ActionButton[] = [
        {
            icon: SlidersHorizontal,
            onClick: () => setShowFilter(!showFilter),
            title: 'Filter',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            variant: 'outline'
        },
        {
            icon: RefreshCw,
            onClick: handleSearch,
            title: 'Refresh',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            iconClass: loading ? 'animate-spin' : '',
            variant: 'outline'
        },
        {
            icon: Download,
            onClick: handleExport,
            title: 'Export to Excel',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !!(data && data.length > 0),
            variant: 'outline'
        },
        {
            icon: Printer,
            onClick: handlePrint,
            title: 'Print',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !!(data && data.length > 0),
            variant: 'outline'
        }
    ];

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title={`${displayNames.subjectCombination} Report`}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Reports', href: '/admission/reports' },
                    { label: `${displayNames.subjectCombination} Report` }
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                tabs={[]}
                activeTab=""
                onTabChange={() => {}}
                actions={actionButtons}
            />

            {showFilter && (
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-end">
                        <div className="w-full">
                            <SelectSingle
                                label={`Select ${displayNames.course}`}
                                value={selectedCourse}
                                onChange={(val) => handleCourseChange(val as string)}
                                options={[
                                    { value: '', label: `Select ${displayNames.course}` },
                                    ...courses.map(c => ({ value: c.name, label: c.name }))
                                ]}
                                placeholder={`Select ${displayNames.course}`}
                                containerClassName="w-full"
                            />
                        </div>
                        <div className="w-full">
                            <SelectSingle
                                label={`Select ${displayNames.stream}`}
                                value={selectedStream}
                                onChange={(val) => setSelectedStream(val as string)}
                                options={[
                                    { value: '', label: `Select ${displayNames.stream}` },
                                    ...streams.map(s => ({ value: s, label: s }))
                                ]}
                                placeholder={`Select ${displayNames.stream}`}
                                containerClassName="w-full"
                            />
                        </div>
                        {showBatch && (
                            <div className="w-full">
                                <SelectSingle
                                    label={`Select ${displayNames.batch}`}
                                    value={selectedBatch}
                                    onChange={(val) => setSelectedBatch(val as string)}
                                    options={[
                                        { value: '', label: `Select ${displayNames.batch}` },
                                        ...batches.map(b => ({ value: b, label: b }))
                                    ]}
                                    placeholder={`Select ${displayNames.batch}`}
                                    containerClassName="w-full"
                                />
                            </div>
                        )}
                        <div className="w-full md:w-auto">
                            <Button variant="primary" onClick={handleSearch} isLoading={loading} className="w-full md:w-auto">
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {data.length > 0 && (
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={data}
                        isLoading={loading}
                        showSearch={true}
                    />
                </div>
            )}

            {!loading && data.length === 0 && (
                <EmptyState message="No Records Found" />
            )}
        </div>
    );
};

export default VacantSeatsReport;
