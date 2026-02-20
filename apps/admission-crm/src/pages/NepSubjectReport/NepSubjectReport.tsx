import { useEffect, useState, useMemo, ReactNode } from 'react';
import { admissionService } from '@od-erp/api-client';
import { useNepSubjectReport } from '@od-erp/query';
import { processNepSubjectReportData, addExcelReportHeader, addExcelReportFooter } from '@od-erp/utils';
import { DataTable, PageHeader, PageToolbar, ActionButton, EmptyState, SelectSingle } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, SlidersHorizontal, RefreshCw } from 'lucide-react';
import * as xlsx from 'xlsx';
import { NepSubjectReportTableRow } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import { format } from 'date-fns';

const NepSubjectReport = () => {
    const [data, setData] = useState<NepSubjectReportTableRow[]>([]);
    const [showFilter, setShowFilter] = useState(false);

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
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const preferences = useAppSelector((state) => state.config.entityPreferences) || null;
    const showBatch = preferences?.showBatch;
    
    // Display Names
    const displayNames = useMemo(() => {
        const prefNames = preferences?.displayNames || [];
        const get = (key: string, defaultVal: string) => prefNames.find((n: any) => n.value === key)?.name || defaultVal;
        return {
            course: get('course', 'Course'),
            stream: get('stream', 'Stream'),
            batch: get('batch', 'Batch')
        };
    }, [preferences]);

    // Query Hook parameters
    const { data: reportData, isLoading, refetch } = useNepSubjectReport(
        entityId,
        session,
        selectedCourse || undefined,
        selectedStream || undefined,
        selectedBatch || undefined,
        selectedGroup.value,
        selectedGroup.name,
        false
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

                // Auto-select first batch if current selection is invalid or empty AND batch is shown
                if (showBatch) {
                    if (courseBatches.length > 0 && (!selectedBatch || !courseBatches.includes(selectedBatch))) {
                        setSelectedBatch(courseBatches[0]);
                    } else if (courseBatches.length === 0) {
                        setSelectedBatch('');
                    }
                } else {
                    setSelectedBatch('');
                }
            }
        } else {
            setStreams([]);
            setBatches([]);
            setSelectedStream('');
            setSelectedBatch('');
        }
    }, [selectedCourse, courses, showBatch]);

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
        const hasTotal = processed.some((row: any) => row.name === 'Total' || row.course === 'Total');

        if (!hasTotal && processed.length > 0) {
            const totalRow: any = {
                position: 0,
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
        refetch();
        setShowFilter(false);
    };

    const handleExport = () => {
        try {
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            const tableStartRow = addExcelReportHeader(ws, entityName, "NEP Subject Report");

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

            if (showBatch) {
                exportColumns.splice(3, 0, { header: displayNames.batch, key: 'batch' });
            }

            // Table Headers
            const tableHeaders = exportColumns.map(c => c.header);
            xlsx.utils.sheet_add_aoa(ws, [tableHeaders], { origin: { r: tableStartRow, c: 0 } });

            // Data
            const dataRows = data.map((row: any) => {
                const isTotalRow = row.name === 'Total';

                return exportColumns.map((col) => {
                    // S.No logic
                    if (col.key === 'position') {
                        if (isTotalRow) return '';
                        return row.position;
                    }

                    // Handle Batch column for non-total rows
                    if (col.key === 'batch') {
                        return isTotalRow ? '' : (row.batch || selectedBatch || '-');
                    }

                    return row[col.key] || (row[col.key] === 0 ? 0 : '');
                });
            });

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

            // Footer
            const footerRow = tableStartRow + 1 + dataRows.length + 2;
            addExcelReportFooter(ws, footerRow);

            xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
            xlsx.writeFile(wb, `NEP_Subject_Report_${session}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        const printData = {
            data,
            showBatch,
            displayNames,
            entityName
        };
        localStorage.setItem('nepSubjectPrintData', JSON.stringify(printData));
        window.open('/admission/print/nepSubjectReport', '_blank');
    };

    const columns: ColumnDef<NepSubjectReportTableRow>[] = useMemo(() => {
        const cols: ColumnDef<NepSubjectReportTableRow>[] = [
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
                cell: info => (info.getValue() as ReactNode) || ''
            }
        ];

        if (showBatch) {
            cols.push({
                accessorKey: 'batch',
                header: displayNames.batch,
                cell: info => {
                    const row = info.row.original;
                    if (row.name === 'Total') return '';
                    return (info.getValue() as ReactNode) || selectedBatch || '';
                }
            });
        }

        cols.push(
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
            }
        );

        return cols;
    }, [showBatch, selectedBatch]);

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
            onClick: () => refetch(),
            title: 'Refresh',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !!(reportData && reportData.length > 0),
            iconClass: isLoading ? 'animate-spin' : '',
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
                title={"NEP Subject Report"}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Reports', href: '/admission/reports' },
                    { label: "NEP Subject Report" }
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                tabs={[]}
                activeTab=""
                onTabChange={() => {}}
                actions={actionButtons}
            />

            {/* Collapsible Filter Card */}
            {showFilter && (
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 items-end">
                        <SelectSingle
                            label={displayNames.course}
                            value={selectedCourse}
                            onChange={(val) => setSelectedCourse(val as string)}
                            options={[
                                { value: '', label: 'Select Course' },
                                ...courses.map(c => ({ value: c.name, label: c.displayName || c.name }))
                            ]}
                            placeholder={`Select ${displayNames.course}`}
                            containerClassName="w-full"
                        />
                        <SelectSingle
                            label={displayNames.stream}
                            value={selectedStream}
                            onChange={(val) => setSelectedStream(val as string)}
                            options={[
                                { value: '', label: `Select ${displayNames.stream}` },
                                ...streams.map(s => ({ value: s, label: s }))
                            ]}
                            placeholder={`Select ${displayNames.stream}`}
                            containerClassName="w-full"
                        />
                        {showBatch && (
                            <SelectSingle
                                label={displayNames.batch}
                                value={selectedBatch}
                                onChange={(val) => setSelectedBatch(val as string)}
                                options={[
                                    { value: '', label: `Select ${displayNames.batch}` },
                                    ...batches.map(b => ({ value: b, label: b }))
                                ]}
                                placeholder={`Select ${displayNames.batch}`}
                                containerClassName="w-full"
                            />
                        )}
                        <SelectSingle
                            label={`Subject Type`}
                            value={selectedGroup.value}
                            onChange={(val) => {
                                const group = groupByOptions.find(g => g.value === val);
                                if (group) setSelectedGroup(group);
                            }}
                            options={groupByOptions.map(g => ({ value: g.value, label: g.name }))}
                            placeholder="Select Group"
                            containerClassName="w-full"
                        />
                    </div>
                    <div className="flex justify-end mt-1">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Loading...' : 'Apply Filters'}
                        </button>
                    </div>
                </div>
            )}

            {/* Table - Conditional Rendering */}
            {data.length > 0 && (
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={data}
                        isLoading={isLoading}
                        showSearch={false}
                    />
                </div>
            )}

            {!isLoading && data.length === 0 && (
                <EmptyState message="No Records Found" />
            )}
        </div>
    );
};

export default NepSubjectReport;
