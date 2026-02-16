import { useEffect, useState } from 'react';
import { useCounselorProductivityReport, useCounselors, useAdmissionMaster } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { processCounselorProductivityReportData, addExcelReportFooter, addExcelReportHeader } from '@od-erp/utils';
import { Button, DataTable, Breadcrumb, Dropdown, DatePicker, HorizontalTabs } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Printer, RefreshCw } from 'lucide-react';
import * as xlsx from 'xlsx';
import { CounselorProductivityReportData } from '@od-erp/types';
import { useNavigate } from 'react-router-dom';

const CounselorProductivityReport = () => {
    const navigate = useNavigate();
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<CounselorProductivityReportData[]>([]);
    const [stageType, setStageType] = useState<string>('lead');
    const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const user = useAppSelector((state) => state.auth.user) as any;
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
        let defaultCounselorId = '';

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
            defaultCounselorId = '';
        } else if (isUserLead) {
            filteredOptions.unshift({ label: 'All Team Members', value: '' });
            defaultCounselorId = '';
        } else {
            const myProfile = counselors.find((c: any) => c._id === user._id);
            if (myProfile) {
                filteredOptions = [{ label: myProfile.name, value: myProfile._id }];
                defaultCounselorId = myProfile._id;
            } else {
                 filteredOptions = [{ label: user.name, value: user._id }];
                 defaultCounselorId = user._id;
            }
        }

        // Deduplicate options just in case
        const uniqueOptions = Array.from(new Set(filteredOptions.map(a => a.value)))
            .map(value => filteredOptions.find(a => a.value === value));

        setCounselorOptions(uniqueOptions);
        setSelectedCounselor(defaultCounselorId);

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
        stageType as 'lead' | 'application',
        getStartTimestamp(),
        getEndTimestamp(),
        selectedCounselor || undefined
    );

    useEffect(() => {
        setLoading(isLoading);
        const type = stageType as 'lead' | 'application';
        if (reportData && Array.isArray(reportData)) {
            // We ignore the dynamicColumns returned here and use the master ones
            const { processedRows } = processCounselorProductivityReportData(reportData, type);
            setData(processedRows);
        } else {
            const { processedRows } = processCounselorProductivityReportData([], type);
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
            
            // Common Header
            const reportName = `Counselor Wise Productivity ${stageType === 'lead' ? 'Lead' : 'Application'} Report`;
            
            // Use shared header function, passing empty array for filterSummary to exclude it as per previous requirement
            const tableStartRow = addExcelReportHeader(ws, entityName, reportName, []);

            // Prepare headers from columns definition
            const tableHeaders = columns.map(c => (c as any).header);
            xlsx.utils.sheet_add_aoa(ws, [tableHeaders], { origin: { r: tableStartRow, c: 0 } });

            // Data
            const dataRows = data.map((row, index) => {
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

            xlsx.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

            // Common Footer
            const footerStartRow = tableStartRow + 1 + dataRows.length + 2;
            addExcelReportFooter(ws, footerStartRow);

            xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
            xlsx.writeFile(wb, `Counselor_Productivity_${stageType === 'lead' ? 'Lead' : 'Application'}_Report.xlsx`);
        } catch (error) {
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {        
        localStorage.setItem('counselorProductivityData', JSON.stringify(data));
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
            counselorId: row.counselorId || selectedCounselor || undefined
        };

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
            cell: info => <span className="text-gray-700 font-medium">{info.getValue() as number}</span>
        },
        {
            accessorKey: 'engagedCount',
            header: 'Engaged Leads',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                return (
                    <span
                        className="text-primary cursor-pointer hover:underline font-medium"
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
                        className="text-primary cursor-pointer hover:underline font-medium"
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
                        className="text-primary cursor-pointer hover:underline font-medium"
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
                        className="text-primary cursor-pointer hover:underline font-medium"
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
                                    className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                                    onClick={handlePrint}
                                    title="Print"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
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

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-3">

                    {/* Tabs - HorizontalTabs */}
                    <HorizontalTabs
                        tabs={[
                            { label: 'Lead Summary', value: 'lead' },
                            { label: 'Application Summary', value: 'application' }
                        ]}
                        activeTab={stageType}
                        onTabChange={setStageType}
                        className="mb-6 px-0"
                    />

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/4">
                            {!isAdmissionAdmin && !isLead ? (
                                <div className="flex flex-col">
                                     <label className="text-xs font-semibold text-gray-600 mb-1 block">Name</label>
                                     <p className="text-gray-900 font-medium py-2">{user?.name}</p>
                                </div>
                            ) : (
                                <>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Select Counselor</label>
                                    <Dropdown
                                        options={counselorOptions}
                                        value={selectedCounselor}
                                        onChange={(val) => setSelectedCounselor(val as string)}
                                        placeholder="Select Counselor"
                                        className="w-full"
                                    />
                                </>
                            )}
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
                                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white border-transparent"
                            >
                                Go <span className="ml-1">→</span>
                            </Button>
                        </div>
                    </div>
                </div>

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
                        <span className="text-gray-400 text-lg font-medium">No Data Found*</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CounselorProductivityReport;
