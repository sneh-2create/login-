import { useEffect, useState } from 'react';
import { useSourceWiseReport, useCounselors, useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Button, DataTable, Breadcrumb, Dropdown, DatePicker, Tooltip } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, RefreshCw } from 'lucide-react';
import * as xlsx from 'xlsx';
import { SourceWiseReportData } from '@od-erp/types';
import { addExcelReportHeader, addExcelReportFooter } from '@od-erp/utils';
import { format } from 'date-fns';

const SourceWiseReport = () => {
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<SourceWiseReportData[]>([]);

    // Filters
    const [startDate, setStartDate] = useState<number | undefined>();
    const [endDate, setEndDate] = useState<number | undefined>();
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [loading, setLoading] = useState(false);

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
                return val === 0 ? '' : <span className="text-gray-500">{info.row.index + 1}</span>;
            }
        },
        {
            accessorKey: 'source',
            header: 'Source',
            cell: info => {
                const val = info.getValue() as string;
                return val === 'Total' ? <span className="font-bold">{val}</span> : <span className="text-gray-700">{val}</span>;
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
        setExportLoading(true);
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
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        localStorage.setItem('sourceWiseLeadData', JSON.stringify(data));
        localStorage.setItem('tableHeads', JSON.stringify(dynamicColumns));
        window.open('/admission/print/sourceWiseReport', '_blank');
    };

    return (
        <div className="w-full max-w-full font-sans pb-8">
            <div className="flex flex-col mb-6 gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Source Wise Report</h1>
                        <Breadcrumb
                            items={[
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'Admission Reports', href: '/admission/reports' },
                                { label: 'Source Wise Report' }
                            ]}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Tooltip content="Refresh" placement="bottom">
                            <Button
                                variant="outline"
                                className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                                onClick={handleSearch}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </Tooltip>

                        {data.length > 0 && (
                            <>
                                <Tooltip content="Export to Excel" placement="bottom">
                                    <Button
                                        variant="outline"
                                        className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                                        onClick={handleExport}
                                        isLoading={exportLoading}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Print" placement="bottom">
                                    <Button
                                        variant="outline"
                                        className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                                        onClick={handlePrint}
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/4">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Select Source</label>
                            <Dropdown
                                value={selectedSource}
                                onChange={(val) => setSelectedSource(val as string)}
                                options={sourceOptions}
                                placeholder="Select Source"
                                className="w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Start Date</label>
                            <DatePicker
                                value={startDate ? new Date(startDate) : undefined}
                                onChange={(date) => setStartDate(date ? date.getTime() : undefined)}
                                maxDate={endDate ? new Date(endDate) : undefined}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">End Date</label>
                            <DatePicker
                                value={endDate ? new Date(endDate) : undefined}
                                onChange={(date) => setEndDate(date ? date.getTime() : undefined)}
                                minDate={startDate ? new Date(startDate) : undefined}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Select Counselor</label>
                            <Dropdown
                                options={counselorOptions}
                                value={selectedCounselor}
                                onChange={(val) => setSelectedCounselor(val as string)}
                                placeholder="Select Counselor"
                                disabled={!isAdmissionAdmin && !isLead}
                                className="w-full"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <Button
                                variant="primary"
                                onClick={handleSearch}
                                isLoading={loading}
                                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white border-transparent"
                            >
                                Go <span className="ml-1">→</span>
                            </Button>
                        </div>
                    </div>
                </div>

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
                    <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <span className="text-gray-400 text-lg font-medium">No Records Found</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SourceWiseReport;
