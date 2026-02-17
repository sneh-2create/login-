import { useState, useMemo, useEffect, useRef } from 'react';
import { DataTable, Button, Breadcrumb, ActionMenu, useToast, Tooltip } from '@od-erp/ui';
import { useAdmissionLead, useSessions, useBulkCounselorUpdate } from '@od-erp/query';
import { useAdmissionStageSetup, useAdmissionStages, useAdmissionMaster, useEditAdmissionStudentData } from '@od-erp/query';
import { AdmissionLead, AdmissionLeadPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Plus, Clock, MessageSquare, Plane, FileText, PhoneCall, Search, SlidersHorizontal, RefreshCw, Download } from 'lucide-react';
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

    // State for Bulk Action Menu
    const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
    const bulkActionRef = useRef<HTMLDivElement>(null);

    // Modal States
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [isBulkUpdateCounselorOpen, setIsBulkUpdateCounselorOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setIsBulkActionOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const [selectedStage, setSelectedStage] = useState<string>(''); // Default to first stage or empty

    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [globalSearch, setGlobalSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const user = useAppSelector((state: any) => state.auth.user);
    const isAdmissionAdmin = permissions.includes('isAdmissionAdmin');

    // Filter State
    const [filters, setFilters] = useState({
        startDate: undefined as number | undefined,
        endDate: undefined as number | undefined,
        followUpEndDate: new Date().setHours(23, 59, 59, 999), // Default to end of today (Angular parity)
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
            // Angular Logic: Filter by stageType == 'lead' and sort by sequence
            const leadStages = stagesSetup.filter(s => s.stageType === 'lead');
            leadStages.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

            if (leadStages.length > 0) {
                setSelectedStage(leadStages[0].stage);
            } else {
                 const sortedStages = [...stagesSetup].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
                 const firstLead = sortedStages.find(s => s.stageType === 'lead');
                 if(firstLead) {
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

    // ... (rest of code)
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
    
    // Pending Tag State (Strict Parity)
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
                 _payload.searchBy = searchType; 
             } else {
                 // Angular Fallback for Global Search with NO search term:
                 // 1. Tags: 'positive' 
                 if (admissionMaster?.tags) {
                     const positiveTags = admissionMaster.tags
                         .filter((t: any) => t.label === 'positive')
                         .map((t: any) => t.tag);
                     if (positiveTags.length > 0) {
                         _payload.tag = positiveTags;
                     }
                 }

                 // 2. FollowUpDates: set to default
                 _payload.followUpStartDate = new Date(new Date(0).setHours(0, 0, 0, 0)).getTime();
                 const todayEnd = new Date();
                 todayEnd.setHours(23, 59, 59, 999);
                 _payload.followUpEndDate = filters.followUpEndDate || todayEnd.getTime();

                 // 3. Stage: 'lead'
                 if (stagesSetup) {
                     const leadStage = stagesSetup.find((s: any) => s.stageType === 'lead');
                     if (leadStage) {
                         _payload.stage = leadStage.stage;
                     }
                 } else if (selectedStage) {
                     _payload.stage = selectedStage;
                 }
                 
                 // 4. EngagementStatus
                 if (filters.engagementStatus?.length) {
                     _payload.engagementStatus = filters.engagementStatus;
                 }
             }
        } else {
            // Normal Mode - Include all filters
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
            
            // Stage is only sent in Normal Mode
            if (selectedStage) {
                _payload.stage = selectedStage;
            }

            if (searchTerm) {
                _payload.search = searchTerm;
                _payload.searchBy = searchType;
            }
        }

        return _payload as AdmissionLeadPayload;
    }, [entityId, session, pagination, searchTerm, searchType, globalSearch, selectedStage, filters]);

    const { data, isLoading, refetch } = useAdmissionLead(payload);

    // Row Selection State
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

    // Handle row selection
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
                pageSize: 10000 // Fetch all records for export
            };

            const xlsx = await import('xlsx');
            const { admissionLeadService } = await import('@od-erp/api-client');

            const response = await admissionLeadService.listAdmissionLeads(exportPayload);
            const exportData = response.data || [];

            if (exportData.length === 0) {
                alert('No data to export');
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
            alert('Failed to export data');
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

    const breadcrumbItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admission', href: '#' },
        { label: 'Admission Leads', href: '#' }
    ];

    // Display Name Helper
    const getDisplayName = (key: string) => {
        return entityPreferences?.displayNames?.find((d: any) => d.value === key)?.name;
    };

    // Columns
    const columns = useMemo<ColumnDef<AdmissionLead>[]>(
        () => [
            {
                id: 'actions',
                header: () => (
                    <div className="flex items-center gap-2 pl-2">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={!!data?.data?.length && selectedCount === data?.data.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span className="font-semibold text-gray-700">Action</span>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3 justify-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={!!selectedRows[row.original._id]}
                            onChange={() => handleSelectRow(row.original._id)}
                        />
                        <ActionMenu
                            items={[
                                { label: 'Edit Lead', onClick: () => handleEditLead(row.original), icon: <FileText size={14} /> },
                                { label: 'Timeline', onClick: () => handleViewTimeline(row.original), icon: <Clock size={14} /> },
                                { label: 'Follow Ups', onClick: () => handleViewFollowUp(row.original), icon: <Plane size={14} /> },
                                { label: 'Notes', onClick: () => handleViewNotes(row.original), icon: <FileText size={14} /> },
                                { label: 'Calls', onClick: () => handleViewCalls(row.original), icon: <PhoneCall size={14} /> },
                                { label: 'Visits', onClick: () => handleViewVisits(row.original), icon: <Plane size={14} /> },
                                ...(row.original.source === 'Reference' ? [{
                                    label: 'Reference',
                                    onClick: () => handleViewReference(row.original),
                                    icon: <FileText size={14} />
                                }] : []),
                            ]}
                        />
                    </div>
                ),
                size: 100,
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
                size: 140
            },
            {
                header: getDisplayName('applicationNumber') || 'Application Number',
                accessorKey: 'applicationNumber',
                cell: info => <span className="font-semibold text-gray-700">{info.getValue() as string || '-'}</span>,
                size: 140
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: info => <span className="text-gray-600">{info.getValue() ? format(info.getValue() as number, 'dd-MMM-yyyy') : '-'}</span>,
                size: 110
            },
            {
                header: 'Name',
                accessorKey: 'name',
                cell: info => <span className="font-medium text-gray-800">{info.getValue() as string}</span>,
                size: 180
            },

            {
                header: 'Phone',
                accessorKey: 'phone',
                cell: info => {
                    const phone = info.getValue() as string;
                    if (permissions.includes('viewAdmissionPhoneNumber')) {
                        return <span className="font-mono text-gray-600">{phone}</span>;
                    }
                    return <span className="font-mono text-gray-400">{phone ? phone.replace(/(\d{2})\d+(\d{4})/, '$1****$2') : '-'}</span>;
                },
                size: 120
            },
            {
                header: getDisplayName('course'),
                accessorKey: 'course',
                cell: info => <span className="text-gray-600">{info.getValue() as string || '-'}</span>,
                size: 100
            },
            {
                header: getDisplayName('stream'),
                accessorKey: 'stream',
                cell: info => <span className="text-gray-600">{info.getValue() as string || '-'}</span>,
                size: 100
            },
            {
                header: 'Source',
                accessorKey: 'source',
                cell: info => (
                    <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-md text-xs font-medium">
                        {info.getValue() as string || 'Reference'}
                    </span>
                ),
                size: 120
            }
        ],
        [permissions, selectedRows, data, displayNames]
    );

    return (
        <div className="w-full max-w-full font-sans pb-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admission Lead</h1>
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <div className="flex items-center gap-3">
                    {selectedCount > 0 && permissions.includes('counselorUpdateBulkRequest') && (
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 py-1 h-8 text-xs"
                            onClick={() => setIsBulkUpdateCounselorOpen(true)}
                        >
                            <SlidersHorizontal size={14} />
                            Bulk Update Counselor
                        </Button>
                    )}

                    {/* Bulk Actions in Toolbar */}
                    {selectedCount > 0 && (
                        <div className="relative mr-2 animate-in fade-in slide-in-from-right-4 duration-300" ref={bulkActionRef}>
                            <Button
                                variant="outline"
                                className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-2"
                                onClick={() => setIsBulkActionOpen(!isBulkActionOpen)}
                            >
                                <MessageSquare size={16} />
                                Send Message
                            </Button>

                            {isBulkActionOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 py-1">
                                    <button
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!permissions.includes('sendMultipleAdmissionReminderSMSCommunication')}
                                        onClick={() => {
                                            setIsSmsModalOpen(true);
                                            setIsBulkActionOpen(false);
                                        }}
                                    >
                                        <MessageSquare size={16} />
                                        <span>Send SMS</span>
                                    </button>
                                    <button
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!permissions.includes('sendMultipleAdmissionReminderWhatsAppCommunication')}
                                        onClick={() => {
                                            setIsWhatsappModalOpen(true);
                                            setIsBulkActionOpen(false);
                                        }}
                                    >
                                        <MessageSquare size={16} />
                                        <span>Send WhatsApp</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="text-xs text-gray-500 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <select
                            className="bg-transparent font-semibold text-gray-700 focus:ring-0 border-none p-0 cursor-pointer text-sm outline-none"
                            value={session}
                            onChange={(e) => dispatch(setAcademicSession(e.target.value))}
                        >
                            {sessions?.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                            {!sessions?.length && <option value={session}>{session}</option>}
                        </select>
                    </div>

                    <Tooltip content="Filter" placement="bottom">
                        <Button
                            variant="outline"
                            className={`!p-2 !w-10 !h-10 border-gray-200 shadow-sm ${showFilterDialog ? 'bg-orange-50 border-orange-200 text-orange-600' : 'text-gray-500 hover:text-gray-700 bg-white'}`}
                            onClick={() => setShowFilterDialog(!showFilterDialog)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </Tooltip>

                    <Tooltip content="Refresh" placement="bottom">
                        <Button
                            variant="outline"
                            className="!p-2 !w-10 !h-10 border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 bg-white"
                            onClick={() => { refetch(); refetchStageCounts(); }}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </Tooltip>

                    <Tooltip content="Export to Excel" placement="bottom">
                        <Button
                            variant="outline"
                            className="!p-2 !w-10 !h-10 border-gray-200 shadow-sm text-green-600 hover:bg-green-50 hover:text-green-700 bg-white"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </Tooltip>

                    {permissions.includes('addAdmissionStudentData') && (
                        <Button
                            variant="primary"
                            className="text-white flex items-center gap-2 shadow-sm"
                            onClick={handleAddLead}
                        >
                            <Plus size={18} />
                            Add Lead
                        </Button>
                    )}
                </div>
            </div>

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

            {/* Search Bar */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1.5 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center divide-x divide-gray-200">
                    <div className="px-3">
                        <select
                            className="w-32 border-none focus:ring-0 text-sm font-medium text-gray-600 bg-transparent py-2 outline-none cursor-pointer"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="name">Name</option>
                            <option value="phone">Phone</option>
                            <option value="applicationNumber">{getDisplayName('applicationNumber') || 'App No'}</option>
                        </select>
                    </div>
                    <div className="flex-1 px-3 flex items-center">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            className="w-full border-none focus:ring-0 text-sm py-2 outline-none placeholder-gray-400"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>







            {/* Add/Edit Lead Drawer */}
            {isLeadFormOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsLeadFormOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
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
            )}



            {/* Table */}
            <div className="w-full max-w-full overflow-x-auto">
                <DataTable
                    data={data?.data || []}
                    columns={columns}
                    isLoading={isLoading}
                />
            </div>

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
                               refetch(); // Refresh list to show new tag
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

