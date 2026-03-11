import { useEffect, useState } from 'react';
import { useSourceWiseReport, useCounselors, useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { DataTable, PageHeader, PageToolbar, ActionButton, EmptyState, SelectSingle, DatePicker, Button } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, RefreshCw, SlidersHorizontal } from 'lucide-react';
import * as xlsx from 'xlsx';
import { SourceWiseReportData } from '@od-erp/types';
import { addExcelReportHeader, addExcelReportFooter } from '@od-erp/utils';
import { format } from 'date-fns';

const SourceWiseReport = () => {
    const [data, setData] = useState<SourceWiseReportData[]>([]);

    // Filters
    const [startDate, setStartDate] = useState<number | undefined>();
    const [endDate, setEndDate] = useState<number | undefined>();
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';

    const user = useAppSelector((state) => state.auth.user) as any;
    const permissions = useAppSelector((state) => state.auth.permissions) || [];

    // Determine Roles
    const isAdmissionAdmin = permissions.includes('isAdmissionAdmin');
    const [isLead, setIsLead] = useState(false);
    const [counselorOptions, setCounselorOptions] = useState<any[]>([]);
    const [sourceOptions, setSourceOptions] = useState<any[]>([]);
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
                // Add Lead (Self)
                filteredOptions.push({ label: myTeam.leadDetails.employeeName, value: myTeam.leadDetails.employee });
                // Add Members
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

        // Sources & Tags
        if (admissionMaster) {
            if (admissionMaster.source) {
                const sources = admissionMaster.source.map((s: string) => ({ label: s, value: s }));
                sources.unshift({ label: 'All Sources', value: '' });
                setSourceOptions(sources);
            }
            if (admissionMaster.tags) {
                setDynamicColumns(admissionMaster.tags.map((t: any) => t.tag));
            }
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

    const { data: reportData, isLoading, refetch } = useSourceWiseReport(
        entityId,
        session,
        'lead',
        getStartTimestamp(),
        getEndTimestamp(),
        selectedSource || undefined,
        (!isAdmissionAdmin && !isLead) ? (user?._id) : (selectedCounselor || undefined)
    );

    useEffect(() => {
        setLoading(isLoading);
        if (reportData && Array.isArray(reportData)) {
            // Calculate Total Row
            const totalRow: any = {
                source: 'Total',
                totalLeadCount: 0,
                totalApplicationCount: 0,
                position: 0 // Marker for total row
            };

            dynamicColumns.forEach(tag => {
                totalRow[tag] = 0;
            });

            reportData.forEach((row: any) => {
                totalRow.totalLeadCount += Number(row.totalLeadCount || 0);
                totalRow.totalApplicationCount += Number(row.totalApplicationCount || 0);
                dynamicColumns.forEach(tag => {
                    totalRow[tag] += Number(row[tag] || 0);
                });
            });

            setData([...reportData, totalRow]);
        } else {
            setData([]);
        }
    }, [reportData, isLoading, dynamicColumns]);


    const handleSearch = () => {
        refetch();
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'position',
            header: 'S.No',
            cell: info => {
                const val = info.getValue() as number;
                return val === 0 ? '' : <span className="text-[var(--color-foreground)]">{info.row.index + 1}</span>;
            }
        },
        {
            accessorKey: 'source',
            header: 'Source',
            cell: info => {
                const val = info.getValue() as string;
                return val === 'Total' ? <span className="font-bold">{val}</span> : <span className="text-[var(--color-foreground)]">{val}</span>;
            }
        },
        {
            accessorKey: 'totalLeadCount',
            header: 'Total Lead Count',
            cell: info => {
                const val = info.getValue() as number;
                const isTotal = info.row.original.source === 'Total';
                return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
            }
        },
        {
            accessorKey: 'totalApplicationCount',
            header: 'Total Application Count',
            cell: info => {
                const val = info.getValue() as number;
                const isTotal = info.row.original.source === 'Total';
                return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
            }
        }
    ];

    dynamicColumns.forEach(tag => {
        columns.push({
            accessorKey: tag,
            header: tag,
            cell: info => {
                const val = info.getValue() as number || 0;
                const isTotal = info.row.original.source === 'Total';
                return <span className={isTotal ? "font-bold" : ""}>{val}</span>;
            }
        });
    });

    const handleExport = () => {

        try {
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            // Header Info using common utility
            const filterSummary: string[][] = [];

            const tableStartRow = addExcelReportHeader(ws, entityName, 'Source Wise Report', filterSummary);

            // Headers
            const headerRow = ['S.No', 'Source', 'Total Lead Count', 'Total Application Count', ...dynamicColumns];
            xlsx.utils.sheet_add_aoa(ws, [headerRow], { origin: { r: tableStartRow, c: 0 } });

            // Data
            const dataRows = data.map((row, index) => {
                const isTotal = row.source === 'Total';
                const rowData = [
                    isTotal ? '' : index + 1,
                    row.source,
                    row.totalLeadCount,
                    row.totalApplicationCount,
                    ...dynamicColumns.map(col => row[col] || 0)
                ];
                return rowData;
            });

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

            // Footer / Signatures
            const signatureRow = tableStartRow + 1 + dataRows.length + 4;
            addExcelReportFooter(ws, signatureRow);

            xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
            xlsx.writeFile(wb, `Source_Wise_Report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('sourceWiseLeadData', JSON.stringify(data));
        localStorage.setItem('tableHeads', JSON.stringify(dynamicColumns));
        window.open('/admission/print/sourceWiseReport', '_blank');
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
                title="Source Wise Report"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission Reports', href: '/admission/reports' },
                    { label: 'Source Wise Report' }
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                actions={actionButtons}
            />

            {/* Collapsible Filters */}
            {showFilter && (
                <div className="bg-[var(--color-card)] rounded-lg shadow mb-3 border border-[var(--color-border)] p-4">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end">
                        <div className="w-full md:w-1/4">
                            <SelectSingle
                                label="Select Source"
                                value={selectedSource}
                                onChange={(val) => setSelectedSource(val as string)}
                                options={sourceOptions}
                                placeholder="Select Source"
                                containerClassName="w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <DatePicker
                                label='Start Date'
                                value={startDate ? new Date(startDate) : undefined}
                                onChange={(date) => setStartDate(date ? date.getTime() : undefined)}
                                maxDate={endDate ? new Date(endDate) : undefined}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <DatePicker
                                label='End Date'
                                value={endDate ? new Date(endDate) : undefined}
                                onChange={(date) => setEndDate(date ? date.getTime() : undefined)}
                                minDate={startDate ? new Date(startDate) : undefined}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
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
                        <div className="w-full md:w-auto">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    handleSearch();
                                    setShowFilter(false);
                                }}
                                isLoading={loading}
                                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white border-transparent"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
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

export default SourceWiseReport;
