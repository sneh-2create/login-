import { useEffect, useState, useMemo } from 'react';
import { useCounselorProductivityReport, useCounselors, useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { processCounselorProductivityReportData } from '@od-erp/utils';
import { Button, DataTable, Input, Breadcrumb, Dropdown, DatePicker } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, RefreshCw, Search } from 'lucide-react';
import * as xlsx from 'xlsx';
import { CounselorProductivityReportData } from '@od-erp/types';
import { useNavigate } from 'react-router-dom';

const CounselorProductivityReport = () => {
    const navigate = useNavigate();
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<CounselorProductivityReportData[]>([]);
    const [stageType, setStageType] = useState<'lead' | 'application'>('lead');
    const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // UI States
    // UI States
    const [searchQuery, setSearchQuery] = useState('');

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const user = useAppSelector((state) => state.auth.user) as any; // Cast to any to avoid strict type checks on _id vs id
    const permissions = useAppSelector((state) => state.auth.permissions) || [];

    // Date Filter - using timestamps
    const [startDate, setStartDate] = useState<number | undefined>();
    const [endDate, setEndDate] = useState<number | undefined>();

    // Calculate timestamps for query
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

    // Data Hooks
    const { data: counselors } = useCounselors(entityId, 'counselor');
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);

    // Determine Roles
    const isAdmissionAdmin = permissions.includes('isAdmissionAdmin');
    const [isLead, setIsLead] = useState(false);
    const [counselorOptions, setCounselorOptions] = useState<any[]>([]);

    // Process Permissions & Counselor List
    useEffect(() => {
        if (!counselors || !user) return;

        let isUserLead = false;
        let filteredOptions: any[] = [];

        // ... (existing logic) ...

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
            // Admin sees all
            filteredOptions = counselors.map((c: any) => ({ label: c.name, value: c._id }));
            filteredOptions.unshift({ label: 'All Counselors', value: '' });
        } else if (isUserLead) {
            // Lead sees team + self (already populated above)
            filteredOptions.unshift({ label: 'All Team Members', value: '' });
        } else {
            // Regular Counselor sees only self
            const myProfile = counselors.find((c: any) => c._id === user._id);
            if (myProfile) {
                filteredOptions = [{ label: myProfile.name, value: myProfile._id }];
                setSelectedCounselor(myProfile._id); // Auto-select self
            }
        }

        // Deduplicate options just in case
        const uniqueOptions = Array.from(new Set(filteredOptions.map(a => a.value)))
            .map(value => filteredOptions.find(a => a.value === value));

        setCounselorOptions(uniqueOptions);

    }, [counselors, admissionMaster, isAdmissionAdmin, user]);

    // Extract Tags from Master
    useEffect(() => {
        if (admissionMaster?.tags) {
            const tags = admissionMaster.tags.map((t: any) => t.tag);
            tags.push('No Tag');
            setDynamicColumns(tags);
        }
    }, [admissionMaster]);

    // Query Hook parameters
    const { data: reportData, isLoading, refetch } = useCounselorProductivityReport(
        entityId,
        session,
        stageType,
        getStartTimestamp(),
        getEndTimestamp(),
        // If not admin and not lead, force selectedCounselor (which is self). 
        // If admin/lead, use selectedCounselor (which defaults to '' i.e. All).
        (!isAdmissionAdmin && !isLead) ? (user?._id) : (selectedCounselor || undefined)
    );

    useEffect(() => {
        setLoading(isLoading);
        if (reportData && Array.isArray(reportData)) {
            // We ignore the dynamicColumns returned here and use the master ones
            const { processedRows } = processCounselorProductivityReportData(reportData, stageType);
            setData(processedRows);
        } else {
            const { processedRows } = processCounselorProductivityReportData([], stageType);
            setData(processedRows);
        }
    }, [reportData, stageType, isLoading]);

    const handleSearch = () => {
        refetch();
    };

    const handleExport = () => {
        setExportLoading(true);
        try {
            const wb = xlsx.utils.book_new();
            const ws: xlsx.WorkSheet = {};

            // Headers
            xlsx.utils.sheet_add_aoa(ws, [[`Counselor Productivity ${stageType === 'lead' ? 'Lead' : 'Application'} Report`]], { origin: "A1" });
            xlsx.utils.sheet_add_aoa(ws, [[`Generated At: ${new Date().toLocaleString()}`]], { origin: "A2" });
            xlsx.utils.sheet_add_aoa(ws, [[]], { origin: "A3" });

            // Prepare headers from columns definition
            const tableHeaders = columns.map(c => (c as any).header);
            xlsx.utils.sheet_add_aoa(ws, [tableHeaders], { origin: "A4" });

            // Data
            const dataRows = filteredData.map((row, index) => {
                const isTotalRow = row.position === 0 || row.counselorName === 'Total';

                return columns.map((col, colIdx) => {
                    const key = (col as any).accessorKey;
                    const header = (col as any).header;
                    
                    // Robust check for S.No Column
                    if (header === 'S.No' || key === 'position' || colIdx === 0) {
                         if (isTotalRow) return '';
                         return index + 1;
                    }

                    // Extract value
                    let val = row[key];
                    // Handle dynamic columns (tag_...)
                    if (key.startsWith('tag_')) {
                        val = row[key] || 0;
                    }
                    
                    return val !== undefined ? val : '';
                });
            });

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: "A5" });

            xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
            xlsx.writeFile(wb, `Counselor_Productivity_${stageType}_Report.xlsx`);
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        // Filter out Search Query for print if needed, or pass current view
        localStorage.setItem('counselorProductivityData', JSON.stringify(filteredData));
        localStorage.setItem('counselorProductivityDynamicColumns', JSON.stringify(dynamicColumns));
        localStorage.setItem('counselorProductivityStageType', stageType);
        window.open('/admission/print/counselorProductivityReport', '_blank');
    };

    const handleDrillDown = (type: string, row: any) => {
        // Allow drilling down on Total row too, as per requirement

        const formatDate = (timestamp?: number) => {
            if (!timestamp) return '';
            return new Date(timestamp).toISOString().split('T')[0];
        };

        const filterObj: any = {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            // Use specific row counselorId, or fallback to selected filter (for Total row), or undefined (All)
            counselorId: row.counselorId || selectedCounselor || undefined
        };

        // For Total Row, counselorId might be undefined or specific if row structure differs
        // Utility sets counselorName='Total', but check row.counselorId. 
        // Usually for Total row we want ALL counselors, so undefined is fine.


        // Different paths based on type
        if (type === 'engaged' || type === 'untouched') {
            filterObj.engagementStatus = type === 'engaged' ? 'engaged' : 'notEngaged';
            localStorage.setItem('filterObjectData', JSON.stringify(filterObj));
            navigate('/admission/studentData');
        } else if (type === 'allFollowUp' || type === 'overdueFollowUp') {
            filterObj.selectedItem = type === 'allFollowUp' ? 'All' : 'overdueFollowUp';

            localStorage.setItem('filterObjectData', JSON.stringify(filterObj));
            navigate('/admission/followUps');
        }
    };

    const columns: ColumnDef<CounselorProductivityReportData>[] = [
        {
            accessorKey: 'position',
            header: 'S.No',
            cell: info => {
                const val = info.getValue() as number;
                return val === 0 ? '' : <span className="text-gray-500">{val}</span>;
            }
        },
        {
            accessorKey: 'counselorName',
            header: 'Counselor Name',
            cell: info => {
                const val = info.getValue() as string;
                return val === 'Total' ? <span className="font-bold">{val}</span> : <span className="text-gray-700">{val}</span>;
            }
        },
        {
            accessorKey: 'totalCount',
            header: stageType === 'lead' ? 'Total Leads' : 'Application Count',
            cell: info => <span className="text-blue-600 font-medium">{info.getValue() as number}</span>
        },
        {
            accessorKey: 'engagedCount',
            header: 'Engaged Leads',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                return (
                    <span
                        className="text-blue-600 cursor-pointer hover:underline font-medium"
                        onClick={() => handleDrillDown('engaged', row)}
                    >
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: 'untouchedCount',
            header: 'Untouched Leads',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                return (
                    <span
                        className="text-blue-600 cursor-pointer hover:underline font-medium"
                        onClick={() => handleDrillDown('untouched', row)}
                    >
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: 'completeFollowUp',
            header: "Today's Follow Up Done",
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                return (
                    <span
                        className="text-blue-600 cursor-pointer hover:underline font-medium"
                        onClick={() => handleDrillDown('allFollowUp', row)}
                    >
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: 'overDueFollowUp',
            header: 'Pending Follow Ups',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                return (
                    <span
                        className="text-blue-600 cursor-pointer hover:underline font-medium"
                        onClick={() => handleDrillDown('overdueFollowUp', row)}
                    >
                        {val}
                    </span>
                );
            }
        },
    ];

    // Add dynamic columns
    dynamicColumns.forEach(tag => {
        columns.push({
            accessorKey: `tag_${tag}`,
            header: tag,
            cell: info => {
                const row = info.row.original;
                const val = row[`tag_${tag}`] || 0;

                if (row.position === 0) return <span className="font-bold text-gray-900">{val}</span>;
                return <span className="text-gray-700">{val}</span>;
            }
        });
    });

    // Client-side filtering
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
            <div className="flex flex-col mb-6 gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Counselor Productivity Report</h1>
                        <Breadcrumb
                            items={[
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'Admission Reports', href: '/admission/reports' },
                                { label: 'Counselor Productivity Report' }
                            ]}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
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

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-6">

                    {/* Tabs - Segmented Control Style */}
                    <div className="flex mb-6">
                        <div className="inline-flex bg-gray-100 rounded-md p-1">
                            <button
                                onClick={() => setStageType('lead')}
                                className={`${stageType === 'lead'
                                        ? 'bg-orange-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    } px-4 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                            >
                                Lead Summary
                            </button>
                            <button
                                onClick={() => setStageType('application')}
                                className={`${stageType === 'application'
                                        ? 'bg-orange-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    } px-4 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                            >
                                Application Summary
                            </button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
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
                        <div className="w-full md:w-auto">
                            <Button
                                variant="primary"
                                onClick={handleSearch}
                                isLoading={loading}
                                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white border-transparent"
                            >
                                Go <span className="ml-1">→</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
                            <div className="flex gap-4 items-center">
                                <h3 className="font-semibold text-gray-700 whitespace-nowrap">
                                    {stageType === 'lead' ? 'Lead Summary' : 'Application Summary'}
                                </h3>
                            </div>
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
        </div>
    );
};

export default CounselorProductivityReport;
