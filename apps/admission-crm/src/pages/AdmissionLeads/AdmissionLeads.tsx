import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataTable, PageHeader, PageToolbar, ActionButton, EmptyState, DropdownMenu, Badge, Checkbox, SelectSingle, Tooltip, Button, useToast } from '@od-erp/ui';
import { useAdmissionLead, useSessions, useBulkCounselorUpdate } from '@od-erp/query';
import { useAdmissionStageSetup, useAdmissionStages, useAdmissionMaster, useEditAdmissionStudentData } from '@od-erp/query';
import { AdmissionLead, AdmissionLeadPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Plus, MessageSquare, SlidersHorizontal, RefreshCw, Download, Clock, Plane, FileText, PhoneCall, MoreVertical, Users } from 'lucide-react';
import { ADMISSION_LEADS_SEARCH_BY_OPTIONS } from '@od-erp/constants';
import { useAppSelector, useAppDispatch, setAcademicSession } from '@od-erp/store';
import TimelineModal from '../../components/Modals/TimelineModal';
import ViewFollowUpModal from '../../components/Modals/ViewFollowUpModal';
import VisitsModal from '../../components/Modals/VisitsModal';
import NotesModal from '../../components/Modals/NotesModal';
import CallsModal from '../../components/Modals/CallsModal';
import ReferenceModal from '../../components/Modals/ReferenceModal';
import FilterCard from './components/FilterCard';
import AddLeadForm from './components/AddLeadForm';

import SendSmsModal from './components/Modals/SendSmsModal';
import SendWhatsappModal from './components/Modals/SendWhatsappModal';
import BulkUpdateCounselorModal from './components/Modals/BulkUpdateCounselorModal';
import TableTagSelect from './components/TableTagSelect';

const AdmissionLeads = () => {
    // Metadata
    const entityId = useAppSelector((state: any) => state.auth.entityDetails?.id) || '';
    const dispatch = useAppDispatch();
    const permissions = useAppSelector((state: any) => state.auth.permissions) || [];

    // Modal States
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [isBulkUpdateCounselorOpen, setIsBulkUpdateCounselorOpen] = useState(false);

    // State
    const session = useAppSelector((state: any) => state.session.academicSession) || '';
    const { data: sessions } = useSessions(entityId);

    // Display Names from Entity Preferences
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences);
    const displayNames = useMemo(() => {
        const names = entityPreferences?.displayNames || [];
        return {
            course: names.find((d: any) => d.value === 'course')?.name || 'Class',
            stream: names.find((d: any) => d.value === 'stream')?.name || 'Stream',
            batch: names.find((d: any) => d.value === 'batch')?.name || 'Batch',
        };
    }, [entityPreferences]);

    // Query Data
    const { data: stagesSetup } = useAdmissionStageSetup(entityId, session || '');
    const { refetch: refetchStageCounts } = useAdmissionStages(entityId, session);
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);

    const [selectedStage, setSelectedStage] = useState<string>('');

    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [globalSearch, setGlobalSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const user = useAppSelector((state: any) => state.auth.user);
    const isAdmissionAdmin = permissions.includes('isAdmissionAdmin');

    // Filter State
    const [filters, setFilters] = useState({
        startDate: undefined as number | undefined,
        endDate: undefined as number | undefined,
        followUpEndDate: new Date().setHours(23, 59, 59, 999),
        counselorId: '',
        course: [] as string[],
        stream: [] as string[],
        batch: [] as string[],
        tag: [] as string[],
        source: [] as string[],
        engagementStatus: ['notEngaged', 'engagedWithPendingFollowUp'] as string[],
        memberDetails: false
    });

    // Set default counselor when user/permissions load
    useEffect(() => {
        if (!isAdmissionAdmin && user?.employeeId && !filters.counselorId) {
            setFilters(prev => ({ ...prev, counselorId: user.employeeId || '' }));
        }
    }, [isAdmissionAdmin, user, filters.counselorId]);

    // Set default stage when stages load
    useEffect(() => {
        if (stagesSetup && stagesSetup.length > 0 && !selectedStage && !globalSearch) {
            const leadStages = stagesSetup.filter(s => s.stageType === 'lead');
            leadStages.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

            if (leadStages.length > 0) {
                setSelectedStage(leadStages[0].stage);
            } else {
                const sortedStages = [...stagesSetup].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
                const firstLead = sortedStages.find(s => s.stageType === 'lead');
                if (firstLead) {
                    setSelectedStage(firstLead.stage);
                }
            }
        }
    }, [stagesSetup, selectedStage, globalSearch]);

    // Handle session changes - reload data
    useEffect(() => {
        if (session) {
            setPagination({ pageIndex: 0, pageSize: 10 });
            setSelectedStage('');
        }
    }, [session]);

    const [timelineStudent, setTimelineStudent] = useState<AdmissionLead | null>(null);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [followUpStudent, setFollowUpStudent] = useState<AdmissionLead | null>(null);
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
    const [visitsStudent, setVisitsStudent] = useState<AdmissionLead | null>(null);
    const [isVisitsOpen, setIsVisitsOpen] = useState(false);
    const [notesStudent, setNotesStudent] = useState<AdmissionLead | null>(null);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [callsStudent, setCallsStudent] = useState<AdmissionLead | null>(null);
    const [isCallsOpen, setIsCallsOpen] = useState(false);
    const [referenceStudent, setReferenceStudent] = useState<AdmissionLead | null>(null);
    const [isReferenceOpen, setIsReferenceOpen] = useState(false);

    // Pending Tag State
    const [pendingTag, setPendingTag] = useState<{ tag: any, student: any } | null>(null);
    const { mutate: updateStudent } = useEditAdmissionStudentData();

    // Edit Lead State
    const [editLeadData, setEditLeadData] = useState<AdmissionLead | null>(null);
    const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

    const handleEditLead = (student: AdmissionLead) => {
        setEditLeadData(student);
        setIsLeadFormOpen(true);
    };

    const handleAddLead = () => {
        setEditLeadData(null);
        setIsLeadFormOpen(true);
    };

    // Derived Payload
    const payload: AdmissionLeadPayload = useMemo(() => {
        const _payload: any = {
            entity: entityId,
            session,
            pageNumber: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            memberDetails: filters.memberDetails,
        };

        if (globalSearch) {
            if (filters.counselorId) _payload.counselorId = filters.counselorId;

            if (searchTerm) {
                _payload.search = searchTerm;
                _payload.searchBy = searchBy;
            } else {
                if (admissionMaster?.tags) {
                    const positiveTags = admissionMaster.tags
                        .filter((t: any) => t.label === 'positive')
                        .map((t: any) => t.tag);
                    if (positiveTags.length > 0) {
                        _payload.tag = positiveTags;
                    }
                }

                _payload.followUpStartDate = new Date(new Date(0).setHours(0, 0, 0, 0)).getTime();
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);
                _payload.followUpEndDate = filters.followUpEndDate || todayEnd.getTime();

                if (stagesSetup) {
                    const leadStage = stagesSetup.find((s: any) => s.stageType === 'lead');
                    if (leadStage) {
                        _payload.stage = leadStage.stage;
                    }
                } else if (selectedStage) {
                    _payload.stage = selectedStage;
                }

                if (filters.engagementStatus?.length) {
                    _payload.engagementStatus = filters.engagementStatus;
                }
            }
        } else {
            _payload.followUpStartDate = new Date(new Date(0).setHours(0, 0, 0, 0)).getTime();
            _payload.followUpEndDate = filters.followUpEndDate;

            if (filters.startDate) _payload.startDate = filters.startDate;
            if (filters.endDate) _payload.endDate = filters.endDate;
            if (filters.counselorId) _payload.counselorId = filters.counselorId;
            if (filters.course?.length) _payload.course = filters.course;
            if (filters.stream?.length) _payload.stream = filters.stream;
            if (filters.batch?.length) _payload.batch = filters.batch;
            if (filters.tag?.length) _payload.tag = filters.tag;
            if (filters.source?.length) _payload.source = filters.source;
            if (filters.engagementStatus?.length) _payload.engagementStatus = filters.engagementStatus;

            if (selectedStage) {
                _payload.stage = selectedStage;
            }

            if (searchTerm) {
                _payload.search = searchTerm;
                _payload.searchBy = searchBy;
            }
        }

        return _payload as AdmissionLeadPayload;
    }, [entityId, session, pagination, searchTerm, searchBy, globalSearch, selectedStage, filters]);

    const { data, isLoading, refetch } = useAdmissionLead(payload);

    // Row Selection State
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

    const handleSelectRow = (id: string) => {
        setSelectedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected: Record<string, boolean> = {};
            data?.data.forEach(row => {
                newSelected[row._id] = true;
            });
            setSelectedRows(newSelected);
        } else {
            setSelectedRows({});
        }
    };

    const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;

    const handleApplyFilters = (newFilters: any, newGlobalSearch: boolean) => {
        setFilters(newFilters);
        setGlobalSearch(newGlobalSearch);
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleSearch = (query: string) => {
        setSearchTerm(query);
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleViewTimeline = (student: AdmissionLead) => {
        setTimelineStudent(student);
        setIsTimelineOpen(true);
    };

    const handleViewFollowUp = (student: AdmissionLead) => {
        setFollowUpStudent(student);
        setIsFollowUpOpen(true);
    };

    const handleViewVisits = (student: AdmissionLead) => {
        setVisitsStudent(student);
        setIsVisitsOpen(true);
    };

    const handleViewNotes = (student: AdmissionLead) => {
        setNotesStudent(student);
        setIsNotesOpen(true);
    };

    const handleViewCalls = (student: AdmissionLead) => {
        setCallsStudent(student);
        setIsCallsOpen(true);
    };

    const handleViewReference = (student: AdmissionLead) => {
        setReferenceStudent(student);
        setIsReferenceOpen(true);
    };

    const handleExport = async () => {
        try {
            const exportPayload = {
                ...payload,
                pageNumber: 1,
                pageSize: 10000
            };

            const xlsx = await import('xlsx');
            const { admissionLeadService } = await import('@od-erp/api-client');

            const response = await admissionLeadService.listAdmissionLeads(exportPayload);
            const exportData = response.data || [];

            if (exportData.length === 0) {
                showToast('warning', 'No data to export');
                return;
            }

            const excelRows = exportData.map((lead: AdmissionLead) => ({
                'Application Number': lead.applicationNumber || '-',
                'Date': lead.date ? format(new Date(lead.date), 'dd-MMM-yyyy') : '-',
                'Name': lead.name,
                'Phone': lead.phone,
                'Class': lead.course || lead.class || '-',
                'Stream': lead.stream || '-',
                'Source': lead.source || '-',
                'Current Stage': lead.currentStage || '-',
                'Father Name': lead.fatherName || '-',
                'Email': lead.email || '-',
                'Campus Visited': lead.campusVisited || 'no'
            }));

            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(excelRows);
            xlsx.utils.book_append_sheet(wb, ws, "Admission Leads");
            xlsx.writeFile(wb, `Admission_Leads_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

        } catch (error) {
            console.error('Export failed:', error);
            showToast('error', 'Failed to export data');
        }
    };

    const { showToast } = useToast();
    const { mutate: bulkUpdateCounselor } = useBulkCounselorUpdate();

    const handleBulkUpdateCounselor = (counselorId: string) => {
        const studentDataIds = Object.keys(selectedRows).filter(key => selectedRows[key]);

        if (studentDataIds.length === 0) {
            showToast('error', 'No leads selected');
            return;
        }

        const payload = {
            studentDataIds,
            entity: entityId,
            counselor: counselorId
        };

        bulkUpdateCounselor(payload, {
            onSuccess: () => {
                showToast('success', 'Counselor updated successfully');
                setIsBulkUpdateCounselorOpen(false);
                setSelectedRows({});
                refetch();
            },
            onError: (err: any) => {
                showToast('error', err.response?.data?.message || err.message || 'Failed to update counselor');
            }
        });
    };

    // Action Buttons (icon-only, tooltip on hover — Add Lead is in extraContent)
    const actionButtons: ActionButton[] = [
        {
            icon: SlidersHorizontal,
            onClick: () => setShowFilterDialog(!showFilterDialog),
            title: 'Filter',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            variant: 'outline'
        },
        {
            icon: RefreshCw,
            onClick: () => { refetch(); refetchStageCounts(); },
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
            isVisible: true,
            variant: 'outline'
        }
    ];

    // Session Selector + Bulk Actions as extraContent for PageToolbar
    const toolbarExtraContent = (
        <div className="flex items-center gap-2">
            {/* Bulk Update Counselor - icon only with tooltip */}
            {selectedCount > 0 && permissions.includes('counselorUpdateBulkRequest') && (
                <Tooltip content="Bulk Update Counselor" placement="bottom">
                    <button
                        className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                        onClick={() => setIsBulkUpdateCounselorOpen(true)}
                    >
                        <Users size={16} />
                    </button>
                </Tooltip>
            )}

            {/* Send Message - icon only with tooltip dropdown */}
            {selectedCount > 0 && (
                <DropdownMenu
                    trigger={
                        <Tooltip content="Send Message" placement="bottom">
                            <button className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                                <MessageSquare size={16} />
                            </button>
                        </Tooltip>
                    }
                    items={[
                        {
                            label: 'Send SMS',
                            onClick: () => setIsSmsModalOpen(true),
                            disabled: !permissions.includes('sendMultipleAdmissionReminderSMSCommunication')
                        },
                        {
                            label: 'Send WhatsApp',
                            onClick: () => setIsWhatsappModalOpen(true),
                            disabled: !permissions.includes('sendMultipleAdmissionReminderWhatsAppCommunication')
                        }
                    ]}
                    placement="bottom-end"
                    usePortal={true}
                />
            )}

            {/* Session Selector */}
            <SelectSingle
                options={sessions?.map(s => ({ value: s.name, label: s.name })) || [{ value: session, label: session }]}
                value={session}
                onChange={(val) => dispatch(setAcademicSession(val as string))}
                placeholder="Select Session"
                containerClassName="w-40"
            />

            {/* Add Lead - labeled primary button */}
            {permissions.includes('addAdmissionStudentData') && (
                <Button
                    variant="primary"
                    onClick={handleAddLead}
                    className="flex items-center gap-1.5"
                >
                    <Plus size={16} />
                    Add Lead
                </Button>
            )}
        </div>
    );

    // Columns
    const columns = useMemo<ColumnDef<AdmissionLead>[]>(
        () => [
            {
                id: 'actions',
                header: () => (
                    <div className="flex items-center gap-2 pl-2">
                        <Checkbox
                            checked={!!data?.data?.length && selectedCount === data?.data.length}
                            onChange={(checked) => handleSelectAll(checked)}
                        />
                        <span className="font-semibold text-[var(--color-foreground)]">Action</span>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3 justify-center">
                        <Checkbox
                            checked={!!selectedRows[row.original._id]}
                            onChange={() => handleSelectRow(row.original._id)}
                        />
                        <DropdownMenu
                            trigger={
                                <button className="p-1 rounded hover:bg-[var(--color-background)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                                    <MoreVertical size={16} />
                                </button>
                            }
                            placement='bottom-end'
                            maxWidth='12rem'
                            items={[
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-primary" />
                                            <span>Edit Lead</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleEditLead(row.original)
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-primary" />
                                            <span>Timeline</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleViewTimeline(row.original)
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <Plane size={14} className="text-primary" />
                                            <span>Follow Ups</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleViewFollowUp(row.original)
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-primary" />
                                            <span>Notes</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleViewNotes(row.original)
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <PhoneCall size={14} className="text-primary" />
                                            <span>Calls</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleViewCalls(row.original)
                                },
                                {
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <Plane size={14} className="text-primary" />
                                            <span>Visits</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleViewVisits(row.original)
                                },
                                ...(row.original.source === 'Reference' ? [{
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-primary" />
                                            <span>Reference</span>
                                        </div>
                                    ) as any,
                                    onClick: () => handleViewReference(row.original)
                                }] : []),
                            ]}
                            usePortal={true}
                        />
                    </div>
                ),
                enableSorting: false
            },
            {
                header: 'Tag',
                accessorKey: 'tag',
                cell: info => <TableTagSelect
                    student={info.row.original}
                    onTagChange={(tag) => {
                        if (tag.label === 'positive') {
                            setPendingTag({ tag, student: info.row.original });
                            handleViewFollowUp(info.row.original);
                        }
                    }}
                />,
            },
            {
                header: 'Application Number',
                accessorKey: 'applicationNumber',
                cell: info => <span className="font-semibold text-[var(--color-foreground)]">{info.getValue() as string || '-'}</span>,
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: info => <span className="text-[var(--color-muted-foreground)]">{info.getValue() ? format(info.getValue() as number, 'dd-MMM-yyyy') : '-'}</span>,
            },
            {
                header: 'Name',
                accessorKey: 'name',
                cell: info => <span className="font-medium text-[var(--color-foreground)]">{info.getValue() as string}</span>,
            },
            {
                header: 'Phone',
                accessorKey: 'phone',
                cell: info => {
                    const phone = info.getValue() as string;
                    if (permissions.includes('viewAdmissionPhoneNumber')) {
                        return <span className="font-mono text-[var(--color-foreground)]">{phone}</span>;
                    }
                    return <span className="font-mono text-[var(--color-muted-foreground)]">{phone ? phone.replace(/(\d{2})\d+(\d{4})/, '$1****$2') : '-'}</span>;
                },
            },
            {
                header: displayNames.course,
                accessorKey: 'course',
                cell: info => <span className="text-[var(--color-muted-foreground)]">{info.getValue() as string || '-'}</span>,
            },
            {
                header: displayNames.stream,
                accessorKey: 'stream',
                cell: info => <span className="text-[var(--color-muted-foreground)]">{info.getValue() as string || '-'}</span>,
            },
            {
                header: 'Source',
                accessorKey: 'source',
                cell: info => (
                    <Badge variant="error" appearance="subtle">
                        {info.getValue() as string || 'Reference'}
                    </Badge>
                )
            }
        ],
        [permissions, selectedRows, data, displayNames]
    );

    return (
        <div className="w-full max-w-full font-sans">
            <PageHeader
                title="Admission Leads"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission', href: '/admission' },
                    { label: 'Admission Leads' }
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                actions={actionButtons}
                extraContent={toolbarExtraContent}
            />

            {/* Filter Card */}
            {showFilterDialog && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <FilterCard
                        onClose={() => setShowFilterDialog(false)}
                        onApply={handleApplyFilters}
                        initialFilters={filters}
                        initialGlobalSearch={globalSearch}
                    />
                </div>
            )}


            {/* Add/Edit Lead Drawer */}
            {isLeadFormOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsLeadFormOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-full max-w-2xl bg-[var(--color-card)] h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <AddLeadForm
                            onClose={() => setIsLeadFormOpen(false)}
                            onSuccess={() => {
                                setIsLeadFormOpen(false);
                                refetch();
                                refetchStageCounts();
                            }}
                            entityId={entityId}
                            session={session}
                            permissions={permissions}
                            initialData={editLeadData}
                            isEditMode={!!editLeadData}
                        />
                    </div>
                </div>
            , document.body)}

            {/* Table */}
            <div className="w-full max-w-full overflow-x-auto">
                <DataTable
                    data={data?.data || []}
                    columns={columns}
                    isLoading={isLoading}
                    showSearch={true}
                    searchPlaceholder="Search leads..."
                    onSearch={handleSearch}
                    searchByOptions={ADMISSION_LEADS_SEARCH_BY_OPTIONS as any}
                    searchByValue={searchBy}
                    onSearchByChange={(value) => setSearchBy(value)}
                    showPagination={true}
                    manualPagination={true}
                    rowCount={data?.totalCount || 0}
                    onPaginationChange={(p: any) => {
                        setPagination({ pageIndex: p.pageIndex, pageSize: p.pageSize });
                    }}
                />
            </div>

            {/* Empty State */}
            {!isLoading && (!data?.data || data.data.length === 0) && (
                <EmptyState message="No Leads Found" />
            )}

            <SendSmsModal
                isOpen={isSmsModalOpen}
                onClose={() => {
                    setIsSmsModalOpen(false);
                    setSelectedRows({});
                }}
                selectedLeads={data?.data.filter(row => selectedRows[row._id]) || []}
            />

            <SendWhatsappModal
                isOpen={isWhatsappModalOpen}
                onClose={() => {
                    setIsWhatsappModalOpen(false);
                    setSelectedRows({});
                }}
                selectedLeads={data?.data.filter(row => selectedRows[row._id]) || []}
            />

            <BulkUpdateCounselorModal
                isOpen={isBulkUpdateCounselorOpen}
                onClose={() => {
                    setIsBulkUpdateCounselorOpen(false);
                    setSelectedRows({});
                }}
                selectedCount={selectedCount}
                entityId={entityId}
                onUpdate={handleBulkUpdateCounselor}
            />

            <TimelineModal
                isOpen={isTimelineOpen}
                onClose={() => setIsTimelineOpen(false)}
                student={timelineStudent}
            />

            <ViewFollowUpModal
                isOpen={isFollowUpOpen}
                onClose={() => {
                    setIsFollowUpOpen(false);
                    setPendingTag(null);
                }}
                student={followUpStudent}
                onSaveSuccess={() => {
                    if (pendingTag && followUpStudent && pendingTag.student._id === followUpStudent._id) {
                        updateStudent({
                            id: pendingTag.student._id,
                            data: { tag: pendingTag.tag.tag },
                        }, {
                            onSuccess: () => {
                                showToast('success', 'Tag updated successfully');
                                setPendingTag(null);
                                refetch();
                            },
                            onError: () => {
                                showToast('error', 'Failed to update tag');
                            }
                        });
                    }
                }}
            />

            <VisitsModal
                isOpen={isVisitsOpen}
                onClose={() => setIsVisitsOpen(false)}
                student={visitsStudent}
            />

            <CallsModal
                isOpen={isCallsOpen}
                onClose={() => setIsCallsOpen(false)}
                student={callsStudent}
            />

            <NotesModal
                isOpen={isNotesOpen}
                onClose={() => setIsNotesOpen(false)}
                student={notesStudent}
            />

            <ReferenceModal
                isOpen={isReferenceOpen}
                onClose={() => setIsReferenceOpen(false)}
                student={referenceStudent}
            />
        </div>
    );
};

export default AdmissionLeads;
