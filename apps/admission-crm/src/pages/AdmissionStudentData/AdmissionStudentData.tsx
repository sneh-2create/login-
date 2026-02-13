import React, { useState, useMemo } from 'react';
import { useSessions, useAdmissionStudentData, useAdmissionStages, useAdmissionStageSetup, useAddAdmissionStudentData, useCounselors } from '@od-erp/query';
import { Card, DataTable, Button, Select, Badge, Breadcrumb, NeedHelpPanel } from '@od-erp/ui';
import { AdmissionLead, AdmissionStudentDataPayload, ExtendedColumnMeta } from '@od-erp/types';
// import { AdmissionStudentData as AdmissionStudentDataType } from '@od-erp/types';

import { admissionStudentDataService } from '@od-erp/api-client';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { 
    FileSpreadsheet, 
    Printer, 
    SlidersHorizontal, 
    RefreshCw, 
    Plus, 
    Upload,
    HelpCircle,
    MoreVertical, 
    Clock, 
    FileText, 
    Landmark, 
    Receipt, 
    MessageSquare, 
    User 
} from 'lucide-react';
import AddStudentModal from './components/AddStudentModal';
import FilterModal from './components/FilterModal';
import UploadExcelModal from './components/UploadExcelModal';
import TimelineModal from '../../components/Modals/TimelineModal';
import ViewDocumentsModal from './components/ViewDocumentsModal';
import BankDetailsModal from './components/BankDetailsModal';
import ViewTransactionsModal from './components/ViewTransactionsModal';
import ViewFollowUpModal from '../../components/Modals/ViewFollowUpModal';
import ViewAdmissionDetails from './components/ViewAdmissionDetails';
import * as XLSX from 'xlsx';
import { useAppSelector, useAppDispatch, setAcademicSession } from '@od-erp/store';

const AdmissionStudentData = () => {
    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    // const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    // const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const dispatch = useAppDispatch();

    // Display Names
    // const displayNames = useMemo(() => ({
    //     course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
    //     stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    //     batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    // }), [entityPreferences]);

    // Primary Color (not used directly, Tailwind's text-primary class is used instead)
    // const primaryColor = entityPreferences.primaryColor || '#1e429f';

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [selectedStage, setSelectedStage] = useState('Total');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchBy, setSearchBy] = useState('name');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<Partial<AdmissionStudentDataPayload>>({});
    const [isExporting, setIsExporting] = useState(false);
    const [timelineStudent, setTimelineStudent] = useState<AdmissionLead | null>(null);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [documentStudent, setDocumentStudent] = useState<AdmissionLead | null>(null);
    const [isViewDocumentsOpen, setIsViewDocumentsOpen] = useState(false);
    const [bankDetailsStudent, setBankDetailsStudent] = useState<AdmissionLead | null>(null);
    const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
    const [transactionsStudent, setTransactionsStudent] = useState<AdmissionLead | null>(null);
    const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
    const [followUpStudent, setFollowUpStudent] = useState<AdmissionLead | null>(null);
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
    const [viewAdmissionStudentId, setViewAdmissionStudentId] = useState<string | null>(null);
    const [isViewAdmissionOpen, setIsViewAdmissionOpen] = useState(false);
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);

    // Mutations
    const addStudentMutation = useAddAdmissionStudentData();

    // Queries
    const { data: sessions } = useSessions(entityId);
    const { data: counselors } = useCounselors(entityId || '', 'counselor');

    const handlePrintForm = (student: AdmissionLead) => {
        if (!student) return;

        // Inject Counselor Name logic (same as ViewAdmissionDetails)
        const counselor = counselors?.find((c: any) => c._id === student.counselorId);
        const studentWithCounselor = {
            ...student,
            counselorName: counselor?.name || '-'
        };

        localStorage.setItem('print_student_data', JSON.stringify(studentWithCounselor));
        window.open('/admission/print/open/admissionForm', '_blank');
        setOpenActionId(null);
        setActionMenuPosition(null);
    };

    // Set default session


    const { data: stageSetup } = useAdmissionStageSetup(entityId, session);
    const { data: stageCounts, refetch: refetchStages } = useAdmissionStages(entityId, session);

    // Payload for student data
    const payload: AdmissionStudentDataPayload = useMemo(() => {
        const p: AdmissionStudentDataPayload = {
            entity: entityId,
            session: session,
            pageNumber,
            pageSize,
            search: searchTerm,
            searchBy: searchBy,
        };

        if (selectedStage !== 'Total') {
            p.stage = selectedStage;
        }

        // Merge advanced filters
        return { ...p, ...currentFilters };
    }, [entityId, session, pageNumber, pageSize, searchTerm, searchBy, selectedStage, currentFilters]);

    const { data, isLoading, refetch, isFetching } = useAdmissionStudentData(payload);

    // hasError: true when no data, false when data is loaded
    const hasError = !data || !data.data || data.data.length === 0;

    // Permission check helper
    const checkPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    // Handlers
    const handleAddStudent = async (formData: any) => {
        try {
            await addStudentMutation.mutateAsync({
                ...formData,
                entity: entityId,
                session: session,
                currentStage: 'Registered', // Default stage
                date: new Date().getTime(),
            });
            setIsAddModalOpen(false);
            refetch();
            refetchStages();
        } catch (error) {
            console.error('Failed to add student:', error);
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            // Create payload to fetch all data
            const exportPayload: AdmissionStudentDataPayload = {
                ...payload,
                pageNumber: 1,
                pageSize: 100000, // Fetch all data
            };

            const response = await admissionStudentDataService.listAdmissionStudentData(exportPayload);

            if (!response?.data) return;

            const worksheet = XLSX.utils.json_to_sheet(response.data.map((item, index) => ({
                'S.No': index + 1,
                'Name': item.name,
                'Application No': item.applicationNumber,
                'Phone': item.phone,
                'Course': item.course,
                'Father Name': item.fatherName,
                'Stage': item.currentStage,
                'Date': item.date ? format(new Date(item.date), 'dd-MMM-yyyy') : '-'
            })));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
            XLSX.writeFile(workbook, `StudentData_${session}.xlsx`);
        } catch (error) {
            console.error('Failed to export excel:', error);
            alert('Failed to export excel. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = () => {
        if (!data?.data) return;
        localStorage.setItem('admissionStudentData', JSON.stringify({
            data: data.data,
            pageNumber,
            pageSize
        }));
        window.open('/admission/print/admissionStudentData', '_blank');
    };

    const handleApplyFilters = (filters: Partial<AdmissionStudentDataPayload>) => {
        setCurrentFilters(filters);
        setIsFilterModalOpen(false);
        setPageNumber(1);
    };

    const handleUploadExcel = (file: File) => {
        console.log('Uploading file:', file);
        // TODO: Implement actual upload API call
        // const formData = new FormData();
        // formData.append('file', file);
        // uploadMutation.mutate(formData);
        setTimeout(() => {
            setIsUploadModalOpen(false);
            alert('File uploaded successfully (Mock)');
        }, 1000);
    };

    const handleGenerateReport = () => {
        // TODO: Implement report generation dialog
        // For now, show a message
        alert('Generate Report functionality will open a dialog to configure and save report templates. This feature is coming soon!');
        
        // Future implementation will call an API similar to Angular:
        // const reportData = {
        //     reportType: 'AdmissionStudentData',
        //     tableHeads: columns,
        //     filterValues: currentFilters,
        //     entity: entityId,
        // };
        // await addReportFile(reportData);
    };

    const handleRefresh = () => {
        refetch();
        refetchStages();
    };

    const handleNeedHelp = () => {
        setIsHelpPanelOpen(true);
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setAcademicSession(e.target.value));
    };

    const toggleActionMenu = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (openActionId === id) {
            setOpenActionId(null);
            setActionMenuPosition(null);
        } else {
            const rect = event.currentTarget.getBoundingClientRect();
            setOpenActionId(id);
            // Position: below the button, aligned to the right if possible, or left
            // Using fixed positioning relative to viewport
            setActionMenuPosition({
                top: rect.bottom + 5,
                left: rect.left
            });
        }
    };

    // Close dropdown when clicking outside
    const handleDocumentClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Check if click is inside the menu
        if (!target.closest('.action-menu-dropdown')) {
            setOpenActionId(null);
            setActionMenuPosition(null);
        }
    };

    // Add event listener for clicking outside
    useMemo(() => {
        if (typeof document !== 'undefined') {
            document.addEventListener('click', handleDocumentClick);
        }
        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('click', handleDocumentClick);
            }
        };
    }, []);

    const handleViewTimeline = (student: AdmissionLead) => {
        setTimelineStudent(student);
        setIsTimelineOpen(true);
        setOpenActionId(null);
        setActionMenuPosition(null);
    };

    const handleViewDocuments = (student: AdmissionLead) => {
        setDocumentStudent(student);
        setIsViewDocumentsOpen(true);
        setOpenActionId(null);
        setActionMenuPosition(null);
    };



    const handleViewBankDetails = (student: AdmissionLead) => {
        setBankDetailsStudent(student);
        setIsBankDetailsOpen(true);
        setOpenActionId(null);
        setActionMenuPosition(null);
    };

    const handleViewTransactions = (student: AdmissionLead) => {
        setTransactionsStudent(student);
        setIsTransactionsOpen(true);
        setOpenActionId(null);
        setActionMenuPosition(null);
    };

    const handleViewFollowUp = (student: AdmissionLead) => {
        setFollowUpStudent(student);
        setIsFollowUpOpen(true);
        setOpenActionId(null);
        setActionMenuPosition(null);
    };

    const handleViewAdmission = (id: string) => {
        setViewAdmissionStudentId(id);
        setIsViewAdmissionOpen(true);
        setOpenActionId(null);
        setActionMenuPosition(null);
    };

    // Handle search from DataTable - debounced to avoid too many API calls
    const handleSearch = (query: string) => {
        setSearchTerm(query);
        setPageNumber(1);
    };

    // Columns with dynamic styling
    const columns = useMemo<ColumnDef<AdmissionLead>[]>(() => [
        {
            header: 'S.No',
            accessorKey: 'sno',
            cell: info => (pageNumber - 1) * pageSize + info.row.index + 1,
            meta: {
                width: 78,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Action',
            id: 'actions',
            cell: info => {
                const id = info.row.original._id;
                return (
                    <div className="relative">
                        <button
                            onClick={(e) => toggleActionMenu(id, e)}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <MoreVertical size={16} />
                        </button>

                    </div>
                )
            }
        },
        {
            header: 'Current Stage',
            accessorKey: 'currentStage',
            cell: info => {
                const val = info.getValue() as string;
                return <Badge variant={val}>{val}</Badge>;
            },
            meta: {
                width: 132,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Student Name',
            accessorKey: 'name',
            cell: info => <span className="font-medium cursor-pointer">{info.getValue() as string}</span>,
            meta: {
                width: 217,
                align: 'left' as const,
                isBold: true, // This will make it black via DataTable
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Form No.',
            accessorKey: 'applicationNumber',
            meta: {
                width: 133,
                align: 'center' as const,
                fontWeight: 500,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: info => {
                const val = info.getValue();
                return val ? format(new Date(val as number), 'dd-MMM-yyyy') : '-';
            },
            meta: {
                width: 140,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Tags',
            accessorKey: 'tags',
            cell: info => {
                const tags = info.getValue() as any[];
                return (
                    <div className="flex flex-wrap gap-1">
                        {tags && tags.length > 0 ? tags.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 border border-green-200">
                                {typeof t === 'string' ? t : t.tag}
                            </span>
                        )) : '-'}
                    </div>
                );
            },
            meta: {
                width: 150,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Course',
            accessorKey: 'course',
            meta: {
                width: 164,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Phone',
            accessorKey: 'phone',
            meta: {
                width: 120,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Father Name',
            accessorKey: 'fatherName',
            cell: info => info.getValue() || '-',
            meta: {
                width: 150,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
        {
            header: 'Receipt Id',
            id: 'receiptId',
            cell: () => '-',
            meta: {
                width: 120,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        },
    ], [pageNumber, pageSize]);


    // Tabs Logic
    const tabs = useMemo(() => {
        const allTabs = [];
        let totalCount = 0;

        if (stageCounts) {
            totalCount = stageCounts.reduce((acc, curr) => acc + curr.count, 0);
        }

        allTabs.push({ name: 'Total', count: totalCount, value: 'Total' });

        // Add Dynamic Stages
        if (stageSetup) {
            stageSetup.forEach(stage => {
                const countObj = stageCounts?.find(s => s.stage === stage.stage);
                allTabs.push({
                    name: stage.stage,
                    count: countObj ? countObj.count : 0,
                    value: stage.stage
                });
            });
        }

        // Add Fixed Stages (Approved, Rejected, Withdrawn)
        const fixedStages = ['Approved', 'Rejected', 'Withdrawn'];
        fixedStages.forEach(fs => {
            const countObj = stageCounts?.find(s => s.stage === fs);
            allTabs.push({
                name: fs,
                count: countObj ? countObj.count : 0,
                value: fs
            });
        });

        return allTabs;

    }, [stageSetup, stageCounts]);


    const breadcrumbItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admissions', href: '/admissions' },
        { label: 'Application Data' }
    ];

    return (
        <div className="w-full max-w-full font-sans pb-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Data</h1>
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                <div className="flex items-center gap-2">
                    {/* Session Selector */}
                    <div className="text-xs text-gray-500 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <select
                            className="bg-transparent font-semibold text-gray-700 focus:ring-0 border-none p-0 cursor-pointer text-sm outline-none"
                            value={session}
                            onChange={handleSessionChange}
                        >
                            {sessions?.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Button */}
                    <Button
                        variant="outline"
                        className={`!p-0 !w-9 !h-9 border-gray-300 ${isFilterModalOpen ? 'bg-primary/10 border-primary/20 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                        title="Filter"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={handleRefresh}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading || isFetching ? 'animate-spin' : ''}`} />
                    </Button>

                    {/* Upload Excel Button - Show if has permission */}
                    {checkPermission('uploadAdmissionStudentData') && (
                        <Button
                            variant="outline"
                            className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => setIsUploadModalOpen(true)}
                            title="Upload Excel"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Excel Export Button - Show if data exists OR has permission */}
                    {(!hasError || checkPermission('exportAdmissionStudentData')) && (
                        <Button
                            variant="outline"
                            className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            title="Export to Excel"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Print Button - Show if data exists OR has permission */}
                    {(!hasError || checkPermission('exportAdmissionStudentData')) && (
                        <Button
                            variant="outline"
                            className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={handlePrint}
                            title="Print"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Generate Report Button - Show if data exists OR has permission */}
                    {(!hasError || checkPermission('exportAdmissionStudentData')) && (
                        <Button
                            variant="outline"
                            className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={handleGenerateReport}
                            title="Generate Report"
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Need Help Button - Always show */}
                    <Button
                        variant="outline"
                        className="!p-0 !w-9 !h-9 border-gray-300 text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={handleNeedHelp}
                        title="Need Help"
                    >
                        <HelpCircle className="h-4 w-4" />
                    </Button>

                    {/* Add Application Data Button - Show if has permission */}
                    {checkPermission('addAdmissionStudentData') && (
                        <Button
                            variant="primary"
                            onClick={() => setIsAddModalOpen(true)}
                            title="Add Application Data"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Application Data
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats / Tabs */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
                {tabs.map((tab) => (
                    <div
                        key={tab.value}
                        onClick={() => { setSelectedStage(tab.value); setPageNumber(1); }}
                        className={`cursor-pointer px-4 py-2 rounded-lg border text-center min-w-[100px] transition-colors
                            ${selectedStage === tab.value
                                ? 'bg-green-100 border-green-300 shadow-sm'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className="text-xs uppercase font-semibold text-gray-500 mb-1">{tab.name}</div>
                        <div className="text-lg font-bold text-gray-800">Count: {tab.count}</div>
                    </div>
                ))}
            </div>

            {/* View Admission Details (Inline) */}
            {isViewAdmissionOpen && (
                <ViewAdmissionDetails
                    studentId={viewAdmissionStudentId}
                    onClose={() => setIsViewAdmissionOpen(false)}
                />
            )}

            {/* Search Bar */}
            <Card className="mb-4 !p-4">
                <div className="w-1/4">
                    <Select
                        label="Search By"
                        options={[
                            { label: 'Name', value: 'name' },
                            { label: 'Application Number', value: 'applicationNumber' },
                            { label: 'Mobile No.', value: 'phone' },
                            { label: 'Father Name', value: 'fatherName' }
                        ]}
                        value={searchBy}
                        onChange={(e) => setSearchBy(e.target.value)}
                    />
                </div>
            </Card>

            {/* Data Table with built-in search */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b font-semibold text-gray-700 uppercase text-sm tracking-wider text-center">
                    APPLICATIONS
                </div>
                <DataTable
                    columns={columns}
                    data={data?.data || []}
                    isLoading={isLoading}
                    showSearch={true}
                    searchPlaceholder="Search by Name/Application No./Mobile No./Father Name"
                    onSearch={handleSearch}
                    showPagination={true}
                    manualPagination={true}
                    rowCount={data?.totalCount || 0}
                    initialItemsPerPage={pageSize}
                    onPaginationChange={(pagination) => {
                        setPageNumber(pagination.pageIndex + 1);
                        setPageSize(pagination.pageSize);
                    }}
                    maxHeight="600px"
                />
            </Card>

            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddStudent}
                isLoading={addStudentMutation.isPending}
                entityId={entityId}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
                currentFilters={currentFilters}
            />

            <UploadExcelModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadExcel}
            />

            {/* Fixed Position Dropdown Menu */}
            {openActionId && actionMenuPosition && (
                <div
                    className="fixed bg-white rounded-md shadow-lg border border-gray-100 z-[9999] overflow-hidden w-40 action-menu-dropdown"
                    style={{
                        top: actionMenuPosition.top,
                        left: actionMenuPosition.left
                    }}
                >
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handlePrintForm(student);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <Printer size={14} className="mr-2 text-gray-500" />
                        Print Form
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handleViewAdmission(openActionId);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <User size={14} className="mr-2 text-blue-500" />
                        View Admission
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handleViewTimeline(student);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <Clock size={14} className="mr-2 text-blue-500" />
                        View Timeline
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            // Navigate to verify page
                            if (student) window.open(`/admission/verify-documents/${student._id}`, '_blank');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <FileText size={14} className="mr-2 text-blue-600" />
                        Verify Documents
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handleViewDocuments(student);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <FileText size={14} className="mr-2 text-green-500" />
                        View Documents
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handleViewBankDetails(student);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <Landmark size={14} className="mr-2 text-purple-500" />
                        View Bank Details
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handleViewTransactions(student);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <Receipt size={14} className="mr-2 text-orange-500" />
                        View Transactions
                    </button>
                    <button
                        onClick={() => {
                            const student = data?.data?.find(s => s._id === openActionId);
                            if (student) handleViewFollowUp(student);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                        <MessageSquare size={14} className="mr-2 text-blue-500" />
                        View Follow Up
                    </button>
                </div>
            )}

            <TimelineModal
                isOpen={isTimelineOpen}
                onClose={() => setIsTimelineOpen(false)}
                student={timelineStudent}
            />

            <ViewDocumentsModal
                isOpen={isViewDocumentsOpen}
                onClose={() => setIsViewDocumentsOpen(false)}
                student={documentStudent}
            />

            <BankDetailsModal
                isOpen={isBankDetailsOpen}
                onClose={() => setIsBankDetailsOpen(false)}
                student={bankDetailsStudent}
            />

            <ViewTransactionsModal
                isOpen={isTransactionsOpen}
                onClose={() => setIsTransactionsOpen(false)}
                student={transactionsStudent}
            />

            <ViewFollowUpModal
                isOpen={isFollowUpOpen}
                onClose={() => setIsFollowUpOpen(false)}
                student={followUpStudent}
            />

            {/* Need Help Panel */}
            <NeedHelpPanel
                isOpen={isHelpPanelOpen}
                onClose={() => setIsHelpPanelOpen(false)}
                page="applicationData"
            />

        </div>
    );
};

export default AdmissionStudentData;
