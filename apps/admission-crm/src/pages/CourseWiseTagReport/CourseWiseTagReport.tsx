import { useEffect, useState, useMemo } from 'react';
import { useCourseWiseTagReport, useCounselors, useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Button, DataTable, PageHeader, PageToolbar, ActionButton, EmptyState, SelectSingle, DatePicker } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, RefreshCw, SlidersHorizontal } from 'lucide-react';
import * as xlsx from 'xlsx';
import { CourseWiseTagReportTableRow } from '@od-erp/types';
import { processCourseWiseTagData, addExcelReportHeader, addExcelReportFooter } from '@od-erp/utils';
import { format } from 'date-fns';

const CourseWiseTagReport = () => {
    const [data, setData] = useState<CourseWiseTagReportTableRow[]>([]);

    // Filters
    const [startDate, setStartDate] = useState<number | undefined>();
    const [endDate, setEndDate] = useState<number | undefined>();
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Redux Selectors
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};
    const user = useAppSelector((state) => state.auth.user) as any;

    // Display Names
    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    }), [entityPreferences]);

    const showBatch = entityPreferences.showBatch !== undefined ? entityPreferences.showBatch : true;

    // Determine Roles
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const isAdmissionAdmin = permissions.includes('isAdmissionAdmin');
    const [isLead, setIsLead] = useState(false);
    const [counselorOptions, setCounselorOptions] = useState<any[]>([]);
    const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);

    // Data Hooks
    const { data: counselors } = useCounselors(entityId, 'counselor');
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);

    // Process Permissions & Lists
    useEffect(() => {
        if (!counselors || !user) return;

        let isUserLead = false;
        let filteredOptions: any[] = [];

        // Check if user is a lead
        if (admissionMaster?.teams && admissionMaster.teams.length > 0 && !isAdmissionAdmin) {
            const myTeam = admissionMaster.teams.find((team: any) => team.leadDetails?.employee === user._id);
            if (myTeam) {
                isUserLead = true;
                filteredOptions.push({ label: myTeam.leadDetails.employeeName, value: myTeam.leadDetails.employee });
                if (myTeam.memberDetails) {
                    myTeam.memberDetails.forEach((mem: any) => {
                        filteredOptions.push({ label: mem.employeeName, value: mem.employee });
                    });
                }
            }
        }
        setIsLead(isUserLead);

        if (isAdmissionAdmin) {
            filteredOptions = counselors.map((c: any) => ({ label: c.name, value: c._id }));
            filteredOptions.unshift({ label: 'All Counselors', value: '' });
        } else if (isUserLead) {
            filteredOptions.unshift({ label: 'All Team Members', value: '' });
        } else {
            const myProfile = counselors.find((c: any) => c._id === user._id);
            if (myProfile) {
                filteredOptions = [{ label: myProfile.name, value: myProfile._id }];
                setSelectedCounselor(myProfile._id);
            }
        }

        // Deduplicate
        const uniqueOptions = Array.from(new Set(filteredOptions.map(a => a.value)))
            .map(value => filteredOptions.find(a => a.value === value));

        setCounselorOptions(uniqueOptions);

        // Tags
        if (admissionMaster?.tags) {
            setDynamicColumns(admissionMaster.tags.map((t: any) => t.tag));
        }

    }, [counselors, admissionMaster, isAdmissionAdmin, user]);

    // Query
    const getStartTimestamp = () => {
        if (!startDate) return undefined;
        const date = new Date(startDate);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    };

    const getEndTimestamp = () => {
        if (!endDate) return undefined;
        const date = new Date(endDate);
        date.setHours(23, 59, 59, 999);
        return date.getTime();
    };

    const { data: reportData, isLoading, refetch } = useCourseWiseTagReport(
        entityId,
        session,
        (!isAdmissionAdmin && !isLead) ? (user?._id) : (selectedCounselor || undefined),
        getStartTimestamp(),
        getEndTimestamp()
    );

    useEffect(() => {
        setLoading(isLoading);
        if (reportData && Array.isArray(reportData)) {
            const processedData = processCourseWiseTagData(reportData, dynamicColumns);
            setData(processedData);
        } else {
            setData([]);
        }
    }, [reportData, isLoading, dynamicColumns]);

    const handleSearch = () => {
        refetch();
        setShowFilter(false);
    };

    const columns: ColumnDef<any>[] = useMemo(() => {
        const cols: ColumnDef<any>[] = [
            {
                accessorKey: 'position',
                header: 'S.No',
                cell: info => {
                    const val = info.getValue() as number;
                    return val === 0 ? '' : <span className="text-gray-500">{info.row.index + 1}</span>;
                }
            },
            {
                accessorKey: 'course',
                header: displayNames.course,
                cell: info => {
                    const val = info.getValue() as string;
                    return val === 'Total' ? <span className="font-bold">{val}</span> : <span className="text-gray-700">{val}</span>;
                }
            },
            {
                accessorKey: 'stream',
                header: displayNames.stream,
                cell: info => {
                    const val = info.getValue() as string || '';
                    const isTotal = info.row.original.course === 'Total';
                    return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
                }
            }
        ];

        // Conditional Batch Column
        if (showBatch) {
            cols.push({
                accessorKey: 'batch',
                header: displayNames.batch,
                cell: info => {
                    const val = info.getValue() as string || '';
                    const isTotal = info.row.original.course === 'Total';
                    return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
                }
            });
        }

        cols.push({
            accessorKey: 'totalCount',
            header: 'Total Count',
            cell: info => {
                const val = info.getValue() as number;
                const isTotal = info.row.original.course === 'Total';
                return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
            }
        });

        return cols;
    }, [displayNames, showBatch]);

    // Add dynamic tag columns
    const allColumns = useMemo(() => {
        const tagCols: ColumnDef<any>[] = dynamicColumns.map(tag => ({
            accessorKey: tag,
            header: tag,
            cell: (info: any) => {
                const val = info.getValue() as number || 0;
                const isTotal = info.row.original.course === 'Total';
                return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
            }
        }));
        return [...columns, ...tagCols];
    }, [columns, dynamicColumns]);

    const handleExport = () => {
        try {
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            // Common Header
            const tableStartRow = addExcelReportHeader(ws, entityName, `${displayNames.course} Wise Tag Report`, []);

            // Headers with display names
            const headerRow = ['S.No', displayNames.course, displayNames.stream];
            if (showBatch) {
                headerRow.push(displayNames.batch);
            }
            headerRow.push('Total Count', ...dynamicColumns);
            xlsx.utils.sheet_add_aoa(ws, [headerRow], { origin: { r: tableStartRow, c: 0 } });

            // Data
            const dataRows = data.map((row, index) => {
                const isTotal = row.course === 'Total';
                const rowData: any[] = [
                    isTotal ? '' : index + 1,
                    row.course,
                    row.stream || ''
                ];
                if (showBatch) {
                    rowData.push(row.batch || '');
                }
                rowData.push(
                    row.totalCount,
                    ...dynamicColumns.map(col => row[col] || 0)
                );
                return rowData;
            });

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

            // Common Footer
            const footerStartRow = tableStartRow + 1 + dataRows.length + 2;
            addExcelReportFooter(ws, footerStartRow);

            xlsx.utils.book_append_sheet(wb, ws, "CourseWiseTagReport");
            xlsx.writeFile(wb, `Course_Wise_Tag_Report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('courseWiseLeadData', JSON.stringify(data));
        localStorage.setItem('tableHeads', JSON.stringify(dynamicColumns));
        window.open('/admission/print/courseWiseTagReport', '_blank');
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
            onClick: () => refetch(),
            title: 'Refresh',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            iconClass: isLoading ? 'animate-spin' : '',
            variant: 'outline'
        },
        {
            icon: Download,
            onClick: handleExport,
            title: 'Export to Excel',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: data.length > 0,
            variant: 'outline'
        },
        {
            icon: Printer,
            onClick: handlePrint,
            title: 'Print',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: data.length > 0,
            variant: 'outline'
        }
    ];

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title={`${displayNames.course} Wise Tag Report`}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Reports', href: '/admission/reports' },
                    { label: `${displayNames.course} Wise Tag Report` }
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
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
                        <div>
                            <DatePicker
                                label="Start Date"
                                value={startDate ? new Date(startDate) : undefined}
                                onChange={(date) => setStartDate(date ? date.getTime() : undefined)}
                                maxDate={endDate ? new Date(endDate) : undefined}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <DatePicker
                                label="End Date"
                                value={endDate ? new Date(endDate) : undefined}
                                onChange={(date) => setEndDate(date ? date.getTime() : undefined)}
                                minDate={startDate ? new Date(startDate) : undefined}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <SelectSingle
                                label="Select Counselor"
                                options={counselorOptions}
                                value={selectedCounselor}
                                onChange={(val) => setSelectedCounselor(val as string)}
                                placeholder="Select Counselor"
                                disabled={!isAdmissionAdmin && !isLead}
                                containerClassName="w-full"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="primary"
                                onClick={handleSearch}
                                isLoading={loading}
                                className="w-full md:w-auto px-8 h-10 font-medium"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            {data.length > 0 && (
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={allColumns}
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

export default CourseWiseTagReport;
