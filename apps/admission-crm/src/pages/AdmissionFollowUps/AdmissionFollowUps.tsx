import { useState, useMemo } from 'react';
import { Button, DataTable, Breadcrumb, useToast, EmptyState, ActionMenu, Tooltip } from '@od-erp/ui';
import { useAdmissionFollowUp, useCounselors, useAdmissionFollowUpStats } from '@od-erp/query';
import { AdmissionFollowUp, AdmissionFollowUpPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { SlidersHorizontal, RefreshCw, Download, Search, Pencil, Trash2 } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';
import { FilterCard } from './components/FilterCard';
import { EditFollowUpDialog } from './components/EditFollowUpDialog';
import { useDebounce } from '@od-erp/utils';
import * as XLSX from 'xlsx';

const AdmissionFollowUps = () => {
    const { showToast } = useToast();
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityPreferences = useAppSelector((state) => state.config.entityPreferences) || null;
    const permissions = useAppSelector((state) => state.auth.permissions) || [];

    // Permissions
    const isAdmissionAdmin = permissions.includes('isAdmissionAdmin');
    const hasEditPermission = permissions.includes('editAdmissionStudentData');
    const hasDeletePermission = permissions.includes('deleteAdmissionStudentData');
    const hasViewPhoneNumberPermission = permissions.includes('viewAdmissionPhoneNumber');
    const loggedInCounselorId = localStorage.getItem('employee') || '';

    // State
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [showFilter, setShowFilter] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    // Dialog State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedFollowUp, setSelectedFollowUp] = useState<AdmissionFollowUp | null>(null);

    // Filter State
    const [startDate, setStartDate] = useState<number>(0);
    const [endDate, setEndDate] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [counselorFilter, setCounselorFilter] = useState('');

    // Applied Filters (for API)
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: 0,
        endDate: 0,
        status: '',
        counselorId: isAdmissionAdmin ? '' : loggedInCounselorId
    });

    // Queries
    const { data: counselors } = useCounselors(entityId, 'counselor');
    
    // Stats Query
    const { data: stats } = useAdmissionFollowUpStats({ 
        entity: entityId, 
        session, 
        counselorId: appliedFilters.counselorId 
    });

    // Tab Logic - Preset Filters
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        let newFilters = { ...appliedFilters, startDate: 0, endDate: 0, status: '' };

        if (tab === 'todaysFollowUp') {
            newFilters.startDate = today.getTime();
            newFilters.endDate = todayEnd.getTime();
        } else if (tab === 'upcomingFollowUp') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            newFilters.startDate = today.getTime();
            newFilters.endDate = nextWeek.getTime();
            newFilters.status = 'pending';
        } else if (tab === 'overdueFollowUp') {
            const lastMonth = new Date(today);
            lastMonth.setDate(today.getDate() - 30);
            newFilters.startDate = lastMonth.getTime();
            newFilters.endDate = today.getTime();
            newFilters.status = 'pending';
        } else if (tab === 'completedFollowUp') {
            newFilters.status = 'completed';
        }

        setAppliedFilters(newFilters);
        // Sync local filter state
        setStartDate(newFilters.startDate);
        setEndDate(newFilters.endDate);
        setStatusFilter(newFilters.status);
    };

    // Payload
    const payload: AdmissionFollowUpPayload = useMemo(() => ({
        entity: entityId,
        session,
        pageSize,
        pageNumber,
        counselorId: appliedFilters.counselorId,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
        status: appliedFilters.status || undefined,
    }), [entityId, session, pageSize, pageNumber, appliedFilters]);

    const { data: followUps, isLoading, refetch } = useAdmissionFollowUp(payload);

    // Client-side Search
    const filteredData = useMemo(() => {
        if (!followUps) return [];
        if (!debouncedSearch) return followUps;
        
        const searchLower = debouncedSearch.toLowerCase();
        return followUps.filter(row => 
            row.applicationNumber?.toLowerCase().includes(searchLower) ||
            row.studentData?.name?.toLowerCase().includes(searchLower) ||
            row.studentData?.phone?.includes(searchLower)
        );
    }, [followUps, debouncedSearch]);


    // Handlers
    const handleEdit = (row: AdmissionFollowUp) => {
        setSelectedFollowUp(row);
        setEditDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete?')) {
            try {
                const { admissionFollowUpService } = await import('@od-erp/api-client');
                await admissionFollowUpService.deleteAdmissionFollowUp(id);
                showToast('success', 'Follow-up deleted successfully');
                refetch();
            } catch (error) {
                showToast('error', 'Failed to delete follow-up');
            }
        }
    };

    const handleExportExcel = () => {
        if (!filteredData.length) {
            showToast('warning', 'No data to export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            const ws: XLSX.WorkSheet = {};

            // Headers
            XLSX.utils.sheet_add_aoa(ws, [['Admission Follow Ups']], { origin: "A1" });
            XLSX.utils.sheet_add_aoa(ws, [[`Generated At: ${new Date().toLocaleString()}`]], { origin: "A2" });
            XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A3" });

            // Column Headers
            const headers = ['S.No', 'Application', 'Name', 'Phone', 'Class', 'Stream', 'Counselor', 'Created At', 'Query', 'FollowUp Date', 'Status', 'Completion Remark'];
            XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A4" });

            // Data
            const dataRows = filteredData.map((row, index) => [
                index + 1,
                row.applicationNumber || '-',
                row.studentData?.name || '-',
                hasViewPhoneNumberPermission ? (row.studentData?.phone || '-') : (row.studentData?.phone ? row.studentData.phone.replace(/.(?=.{4})/g, '*') : '-'),
                row.studentData?.course || '-',
                row.studentData?.stream || '-',
                row.counselorName || '-',
                row.createdAt ? format(new Date(row.createdAt), 'dd/MMM/yyyy') : '-',
                row.followUpQuery || '-',
                row.followUpDate ? format(new Date(row.followUpDate), 'dd/MMM/yyyy HH:mm') : '-',
                row.status?.toUpperCase() || '-',
                row.completionRemark || '-'
            ]);

            XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A5" });

            XLSX.utils.book_append_sheet(wb, ws, 'Follow Ups');
            XLSX.writeFile(wb, `FollowUps_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
            showToast('success', 'Excel exported successfully');
        } catch (error) {
            console.error(error);
            showToast('error', 'Export failed');
        }
    };

    // Columns
    const columns = useMemo<ColumnDef<AdmissionFollowUp>[]>(() => {
        const displayNames = (entityPreferences as any)?.displayNames || [];
        const courseLabel = Array.isArray(displayNames) ? displayNames.find((d: any) => d.value === 'course')?.name || 'Class' : 'Class';

        return [
            {
                header: 'S.No',
                cell: (info) => (pageNumber - 1) * pageSize + info.row.index + 1,
                size: 60,
            },
            {
                header: 'Application',
                accessorFn: (row) => row.applicationNumber,
                cell: (info) => (
                    <div className="flex flex-col text-xs">
                        <span>App No: <strong>{info.row.original.applicationNumber || '-'}</strong></span>
                        <span>Date: <strong>{info.row.original.studentData?.date ? format(new Date(info.row.original.studentData.date), 'dd/MMM/yyyy') : '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Name',
                accessorFn: (row) => row.studentData?.name,
                cell: (info) => (
                    <div className="flex flex-col text-xs">
                        <span>Name: <strong>{info.row.original.studentData?.name || '-'}</strong></span>
                        <span>Phone: <strong>{hasViewPhoneNumberPermission ? (info.row.original.studentData?.phone || '-') : (info.row.original.studentData?.phone ? info.row.original.studentData.phone.replace(/.(?=.{4})/g, '*') : '-')}</strong></span>
                    </div>
                )
            },
            {
                header: 'Class',
                accessorFn: (row) => row.studentData?.course,
                cell: (info) => (
                    <div className="flex flex-col text-xs">
                        <span>{courseLabel}: <strong>{info.row.original.studentData?.course || '-'}</strong></span>
                        <span>Stream: <strong>{info.row.original.studentData?.stream || '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Counselor',
                accessorKey: 'counselorName',
                cell: info => <span className="text-xs">{info.getValue() as string}</span>
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                cell: (info) => <span className="text-xs">{info.getValue() ? format(new Date(info.getValue() as number), 'dd/MMM/yyyy') : '-'}</span>,
            },
            {
                header: 'FollowUp Query',
                accessorKey: 'followUpQuery',
                cell: info => <span className="text-xs">{info.getValue() as string}</span>
            },
            {
                header: 'FollowUp Date',
                accessorKey: 'followUpDate',
                cell: (info) => <span className="text-xs">{info.getValue() ? format(new Date(info.getValue() as number), 'dd/MMM/yyyy HH:mm') : '-'}</span>,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (info) => (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        info.getValue() === 'completed' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {(info.getValue() as string)?.toUpperCase()}
                    </span>
                )
            },
            {
                header: 'Completion Remark',
                accessorKey: 'completionRemark',
                cell: info => <span className="text-xs">{info.getValue() as string}</span>
            },
            {
                header: 'Action',
                id: 'actions',
                cell: (info) => (
                    <ActionMenu
                        items={[
                            {
                                label: 'Edit',
                                icon: <Pencil className="w-4 h-4" />,
                                onClick: () => handleEdit(info.row.original),
                                hidden: !hasEditPermission,
                            },
                            {
                                label: 'Delete',
                                icon: <Trash2 className="w-4 h-4 text-red-500" />,
                                onClick: () => handleDelete(info.row.original._id),
                                hidden: !hasDeletePermission,
                                className: 'text-red-500 hover:text-red-700 hover:bg-red-50',
                            },
                        ]}
                    />
                ),
            }
        ];
    }, [pageNumber, pageSize, hasViewPhoneNumberPermission, hasEditPermission, hasDeletePermission, entityPreferences]);

    const breadcrumbItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admission Reports', href: '#' },
        { label: 'Follow Ups', href: '#' }
    ];

    const statsData = Array.isArray(stats) && stats.length > 0 ? stats[0] : (stats || {});

    // Filter Logic for Counselors
    // If Admission Admin: Show all counselors
    // If not Admin but Team Lead (need logic, for now show logged in user or team members if implemented)
    const filteredCounselors = useMemo(() => {
        if (!counselors) return [];
        return counselors; 
    }, [counselors]);

    return (
        <div className="w-full max-w-full font-sans pb-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Follow Ups</h1>
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <div className="flex items-center space-x-2">
                    <Tooltip content="Filter" placement="bottom">
                        <Button 
                            variant="outline" 
                            className={`!p-0 !w-9 !h-9 border-gray-300 ${showFilter ? 'bg-orange-50 border-orange-200 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Refresh" placement="bottom">
                        <Button 
                            variant="outline" 
                            className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                            onClick={() => refetch()}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Export to Excel" placement="bottom">
                        <Button 
                            variant="outline" 
                            className="!p-0 !w-9 !h-9 border-gray-300 text-green-500 hover:bg-green-50 hover:text-green-600"
                            onClick={handleExportExcel}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Filter Card */}
            {showFilter && (
                <FilterCard
                    startDate={startDate}
                    endDate={endDate}
                    status={statusFilter}
                    counselorId={counselorFilter}
                    counselors={filteredCounselors}
                    isAdmissionAdmin={isAdmissionAdmin}
                    onApply={(filters) => {
                        setAppliedFilters(prev => ({ 
                            ...prev, 
                            startDate: filters.startDate, 
                            endDate: filters.endDate, 
                            status: filters.status,
                            counselorId: filters.counselorId || (isAdmissionAdmin ? '' : loggedInCounselorId)
                        }));
                        setShowFilter(false);
                    }}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setStatus={setStatusFilter}
                    setCounselorId={setCounselorFilter}
                />
            )}

            {/* Tabs */}
            <div className="flex space-x-2 overflow-x-auto border-b mb-4">
                {['All', 'todaysFollowUp', 'upcomingFollowUp', 'overdueFollowUp', 'completedFollowUp'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`py-2 px-4 whitespace-nowrap border-b-2 transition-colors text-sm ${activeTab === tab
                            ? 'border-primary text-primary font-semibold'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'All' ? 'All' :
                            tab === 'todaysFollowUp' ? "Today's Follow Up" :
                                tab === 'upcomingFollowUp' ? "Upcoming Follow Up" :
                                    tab === 'overdueFollowUp' ? "Overdue Follow Up" : "Completed"
                        }
                        <span className="ml-1 text-xs text-gray-400">
                            ({
                                tab === 'All' ? statsData.total || 0 :
                                    tab === 'todaysFollowUp' ? statsData.todayFollowUps || 0 :
                                        tab === 'upcomingFollowUp' ? statsData.upcomingFollowUps || 0 :
                                            tab === 'overdueFollowUp' ? statsData.overdueFollowUps || 0 :
                                                statsData.completedFollowUps || 0
                            })
                        </span>
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
                    <h3 className="font-semibold text-gray-700 whitespace-nowrap">Follow Up List</h3>
                    <div className="relative w-64">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                         </div>
                         <div className="flex items-center"> 
                             <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-9 w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                             />
                         </div>
                    </div>
                 </div>

                 <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        isLoading={isLoading}
                        showSearch={false}
                        showPagination={true} 
                        manualPagination={true} 
                        rowCount={statsData.total || 0}
                        onPaginationChange={(newPagination: any) => {
                            if (newPagination?.pageIndex !== undefined && (newPagination.pageIndex + 1) !== pageNumber) {
                                setPageNumber(newPagination.pageIndex + 1);
                            }
                            if (newPagination?.pageSize !== undefined && newPagination.pageSize !== pageSize) {
                                setPageSize(newPagination.pageSize);
                            }
                        }}
                    />
                 </div>
            </div>

             {/* Empty State */}
             {!isLoading && filteredData.length === 0 && (
                <EmptyState message="No Follow Ups Found" />
            )}

            {/* Edit Dialog */}
            <EditFollowUpDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                data={selectedFollowUp}
                onSuccess={refetch}
                hasViewPhoneNumberPermission={hasViewPhoneNumberPermission}
            />
        </div>
    );
};

export default AdmissionFollowUps;
