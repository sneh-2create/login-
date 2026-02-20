import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, PageToolbar, ActionButton, EmptyState, Badge, DropdownMenu, useToast } from '@od-erp/ui';
import { useAdmissionFollowUp, useCounselors, useAdmissionFollowUpStats } from '@od-erp/query';
import { AdmissionFollowUp, AdmissionFollowUpPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { SlidersHorizontal, RefreshCw, Download, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';
import { FilterCard } from './components/FilterCard';
import { EditFollowUpDialog } from './components/EditFollowUpDialog';

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
    const navigate = useNavigate();

    // Navigate to student details, saving filter state for back navigation
    const navigateToStudentDetails = (studentDataId: string | undefined) => {
        if (!studentDataId) return;
        const filterState = {
            startDate: appliedFilters.startDate || undefined,
            endDate: appliedFilters.endDate || undefined,
            counselorId: appliedFilters.counselorId || undefined,
            selectedStatus: appliedFilters.status || undefined,
            selectedItem: activeTab,
        };
        localStorage.setItem('filterInDetailsPage', JSON.stringify(filterState));
        navigate(`/admission/student-data/${studentDataId}`, { state: { from: 'followUps', initialTab: 'Follow Up' } });
    };

    // State
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
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

    // Read drill-down filter parameters from localStorage (from CounselorProductivityReport)
    useEffect(() => {
        const filterObjectData = localStorage.getItem('filterObjectData');
        if (filterObjectData) {
            try {
                const filters = JSON.parse(filterObjectData);

                // Build new filter object
                const newFilters: any = { ...appliedFilters };

                // Apply counselor filter
                if (filters.counselorId) {
                    newFilters.counselorId = filters.counselorId;
                    setCounselorFilter(filters.counselorId);
                }

                // Apply date range filters
                if (filters.startDate) {
                    newFilters.startDate = filters.startDate;
                    setStartDate(filters.startDate);
                }

                if (filters.endDate) {
                    newFilters.endDate = filters.endDate;
                    setEndDate(filters.endDate);
                }

                // Handle selectedItem to determine which tab to show
                if (filters.selectedItem) {
                    if (filters.selectedItem === 'All') {
                        setActiveTab('All');
                    } else if (filters.selectedItem === 'overdueFollowUp') {
                        setActiveTab('overdueFollowUp');
                        // Apply overdue filters
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const lastMonth = new Date(today);
                        lastMonth.setDate(today.getDate() - 30);
                        newFilters.startDate = lastMonth.getTime();
                        newFilters.endDate = today.getTime();
                        newFilters.status = 'pending';
                    }
                }

                // Apply filters to state
                setAppliedFilters(newFilters);

                // Clean up localStorage
                localStorage.removeItem('filterObjectData');

            } catch (error) {
                console.error('Error parsing filterObjectData:', error);
                localStorage.removeItem('filterObjectData');
            }
        }
    }, []); // Run only on mount

    // Queries
    const { data: counselors } = useCounselors(entityId, 'counselor');

    // Stats Query
    const { data: stats } = useAdmissionFollowUpStats({
        entity: entityId,
        session,
        counselorId: appliedFilters.counselorId
    });

    const statsData = Array.isArray(stats) && stats.length > 0 ? stats[0] : (stats || {});

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
        if (!followUps?.length) {
            showToast('warning', 'No data to export');
            return;
        }

        try {
            const displayNames = (entityPreferences as any)?.displayNames || [];
            const courseLabel = Array.isArray(displayNames) ? displayNames.find((d: any) => d.value === 'course')?.name || 'Class' : 'Class';
            const streamLabel = Array.isArray(displayNames) ? displayNames.find((d: any) => d.value === 'stream')?.name || 'Stream' : 'Stream';

            const wb = XLSX.utils.book_new();
            const ws: XLSX.WorkSheet = {};

            // Headers
            XLSX.utils.sheet_add_aoa(ws, [['Admission Follow Ups']], { origin: "A1" });
            XLSX.utils.sheet_add_aoa(ws, [[`Generated At: ${new Date().toLocaleString()}`]], { origin: "A2" });
            XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A3" });

            // Column Headers
            const headers = ['S.No', 'Application', 'Name', 'Phone', courseLabel, streamLabel, 'Counselor', 'Created At', 'Query', 'FollowUp Date', 'Status', 'Completion Remark'];
            XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A4" });

            // Data
            const dataRows = (followUps as AdmissionFollowUp[]).map((row, index) => [
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
        const streamLabel = Array.isArray(displayNames) ? displayNames.find((d: any) => d.value === 'stream')?.name || 'Stream' : 'Stream';

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
                    <div className="flex flex-col text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>
                        <span>Application Number: <strong className="text-[var(--color-primary)]">{info.row.original.applicationNumber || '-'}</strong></span>
                        <span>Application Date: <strong className="text-[var(--color-primary)]">{info.row.original.studentData?.date ? format(new Date(info.row.original.studentData.date), 'dd/MMM/yyyy') : '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Name',
                accessorFn: (row) => row.studentData?.name,
                cell: (info) => (
                    <div className="flex flex-col text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>
                        <span>Name: <strong className="text-[var(--color-primary)]">{info.row.original.studentData?.name || '-'}</strong></span>
                        <span>Phone: <strong className="text-[var(--color-primary)]">{hasViewPhoneNumberPermission ? (info.row.original.studentData?.phone || '-') : (info.row.original.studentData?.phone ? info.row.original.studentData.phone.replace(/.(?=.{4})/g, '*') : '-')}</strong></span>
                    </div>
                )
            },
            {
                header: courseLabel,
                accessorFn: (row) => row.studentData?.course,
                cell: (info) => (
                    <div className="flex flex-col text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>
                        <span>{courseLabel}: <strong>{info.row.original.studentData?.course || '-'}</strong></span>
                        <span>{streamLabel}: <strong>{info.row.original.studentData?.stream || '-'}</strong></span>
                    </div>
                )
            },
            {
                header: 'Counselor',
                accessorKey: 'counselorName',
                cell: info => <span className="text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>{info.getValue() as string}</span>
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                cell: (info) => <span className="text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>{info.getValue() ? format(new Date(info.getValue() as number), 'dd/MMM/yyyy') : '-'}</span>,
            },
            {
                header: 'FollowUp Query',
                accessorKey: 'followUpQuery',
                cell: info => <span className="text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>{info.getValue() as string}</span>
            },
            {
                header: 'FollowUp Date',
                accessorKey: 'followUpDate',
                cell: (info) => <span className="text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>{info.getValue() ? format(new Date(info.getValue() as number), 'dd/MMM/yyyy HH:mm') : '-'}</span>,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (info) => (
                    <span className="cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>
                        <Badge variant={info.getValue() === 'completed' ? 'success' : 'danger'}>
                            {(info.getValue() as string)?.toUpperCase()}
                        </Badge>
                    </span>
                )
            },
            {
                header: 'Completion Remark',
                accessorKey: 'completionRemark',
                cell: info => <span className="text-xs cursor-pointer" onClick={() => navigateToStudentDetails(info.row.original.studentData?._id)}>{info.getValue() as string}</span>
            },
            {
                header: 'Action',
                id: 'actions',
                cell: (info) => (
                    <DropdownMenu
                        trigger={<MoreVertical className="w-4 h-4 text-gray-500" />}
                        usePortal
                        items={[
                            ...( hasEditPermission ? [{
                                key: 'edit',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <Pencil className="w-4 h-4" /> Edit
                                    </span>
                                ),
                                onClick: () => handleEdit(info.row.original),
                            }] : []),
                            ...( hasDeletePermission ? [{
                                key: 'delete',
                                label: (
                                    <span className="flex items-center gap-2 text-red-500">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </span>
                                ),
                                onClick: () => handleDelete(info.row.original._id),
                            }] : []),
                        ]}
                    />
                ),
            }
        ];
    }, [pageNumber, pageSize, hasViewPhoneNumberPermission, hasEditPermission, hasDeletePermission, entityPreferences]);

    // Filter Logic for Counselors
    const filteredCounselors = useMemo(() => {
        if (!counselors) return [];
        return counselors;
    }, [counselors]);

    // Tabs with stats counts
    const tabs = useMemo(() => [
        { label: `All (${statsData.total || 0})`, value: 'All' },
        { label: `Today's Follow Up (${statsData.todayFollowUps || 0})`, value: 'todaysFollowUp' },
        { label: `Upcoming Follow Up (${statsData.upcomingFollowUps || 0})`, value: 'upcomingFollowUp' },
        { label: `Overdue Follow Up (${statsData.overdueFollowUps || 0})`, value: 'overdueFollowUp' },
        { label: `Completed (${statsData.completedFollowUps || 0})`, value: 'completedFollowUp' },
    ], [statsData]);

    // Action Buttons
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
            onClick: handleExportExcel,
            title: 'Export to Excel',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !!(followUps && followUps.length > 0),
            variant: 'outline'
        },
    ];

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title="Follow Ups"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission', href: '/admission' },
                    { label: 'Follow Ups' }
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                actions={actionButtons}
            />

            {/* Collapsible Filter Card */}
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

            {/* Data Table */}
            <div className="w-full max-w-full overflow-x-auto">
                <DataTable
                    data={followUps || []}
                    columns={columns}
                    isLoading={isLoading}
                    showSearch={true}
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

            {/* Empty State */}
            {!isLoading && (!followUps || followUps.length === 0) && (
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
