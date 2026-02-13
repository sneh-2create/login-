import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions, useAdmissionStudentData, useAdmissionStages, useAdmissionStageSetup, useAddAdmissionStudentData, useCounselors, useAdmissionTemplates, useDefaultAdmissionTemplate, useAdmissionTemplate, useAddReportFile, useDeleteAdmissionStudentData, useClickToCall } from '@od-erp/query';
import { DataTable, Button, Badge, Breadcrumb, NeedHelpPanel, HorizontalTabs, Dropdown, ActionMenu } from '@od-erp/ui';
import { AdmissionLead, AdmissionStudentDataPayload, ExtendedColumnMeta, TableHead } from '@od-erp/types';
import { ADMISSION_SEARCH_BY_OPTIONS, DEFAULT_ADMISSION_APPLICATION_REPORT_HEADS } from '@od-erp/constants';

import { addExcelReportHeader, addExcelReportFooter } from '@od-erp/utils';
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
    Clock, 
    FileText, 
    Landmark, 
    Receipt, 
    MessageSquare, 
    User,
    Trash2,
    ArrowRight,
    Phone
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
import MoveApplicationModal from './components/MoveApplicationModal';
import MoveStudentModal from './components/MoveStudentModal';
import * as XLSX from 'xlsx';
import { useAppSelector, useAppDispatch, setAcademicSession } from '@od-erp/store';

const AdmissionStudentData = () => {
    // Metadata
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityName = useAppSelector((state) => state.session.entityName) || 'Okie Dokie';
    const dispatch = useAppDispatch();
    // const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const myOperatorId = useAppSelector((state) => state.auth.user?.myOperatorId) || localStorage.getItem('myOperatorId') || '';
    const navigate = useNavigate();
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Display Names
    // const displayNames = useMemo(() => ({
    //     course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
    //     stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    //     batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    // }), [entityPreferences]);

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [selectedStage, setSelectedStage] = useState('Total');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchBy, setSearchBy] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<Partial<AdmissionStudentDataPayload>>({});
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
    // Move Application Modal State
    const [moveApplicationStudent, setMoveApplicationStudent] = useState<AdmissionLead | null>(null);
    const [isMoveApplicationOpen, setIsMoveApplicationOpen] = useState(false);

    // Move Student Modal State
    const [moveStudentStudent, setMoveStudentStudent] = useState<AdmissionLead | null>(null);
    const [isMoveStudentOpen, setIsMoveStudentOpen] = useState(false);


    // Mutations
    const addStudentMutation = useAddAdmissionStudentData();
    const addReportFileMutation = useAddReportFile();
    const clickToCallMutation = useClickToCall();

    // Queries
    const { data: sessions } = useSessions(entityId);
    const { data: counselors } = useCounselors(entityId || '', 'counselor');

    // Get entityType and QAC from Redux (consistent with other pages)
    const entityType = useAppSelector((state) => state.session.entityType) || '';
    const qac = useAppSelector((state) => state.auth.entityDetails?.qac) || '';

    // Template Queries - 3-tier fallback: Custom Templates → API Defaults → Hardcoded Defaults
    const { data: templates } = useAdmissionTemplates(entityId);
    const { data: defaultTemplateData } = useDefaultAdmissionTemplate(entityId, entityType);
    const [selectedTemplate, setSelectedTemplate] = useState<string>(''); // viewName of selected template
    
    // Find the template object by viewName
    const selectedTemplateObj = useMemo(() => {
        return templates?.find(t => t.viewName === selectedTemplate);
    }, [templates, selectedTemplate]);
    
    const { data: selectedTemplateData } = useAdmissionTemplate(selectedTemplateObj?._id || null, !!selectedTemplateObj?._id);

    // Auto-select first template when templates load
    useMemo(() => {
        if (templates && templates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(templates[0].viewName);
        }
    }, [templates, selectedTemplate]);

    // Row selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(data?.data.map((item: AdmissionLead) => item._id) || []);
            setSelectedRows(allIds);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedRows(newSelected);
    };

    // Navigate to admission details
    const navigateToAdmissionDetails = (id: string) => {
        navigate(`/admission/student-data/${id}`);
    };

    // Mutations
    const deleteStudentMutation = useDeleteAdmissionStudentData();

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
    };

    const handleDeleteAdmission = async (id: string) => {
        if (!id) return;
        
        const confirmed = window.confirm('Are you sure you want to delete this Student Admission Data? This action cannot be undone.');
        if (!confirmed) return;
        
        try {
            await deleteStudentMutation.mutateAsync(id);
            alert('Student Admission deleted successfully');
            refetch(); // Refresh the list
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete admission';
            alert(`Error: ${errorMessage}`);
            console.error('Delete error:', error);
        }
    };

    const handleMoveApplication = (student: AdmissionLead) => {
        if (!student) return;
        setMoveApplicationStudent(student);
        setIsMoveApplicationOpen(true);
    };

    const handleMoveStudent = (student: AdmissionLead) => {
        if (!student) return;
        setMoveStudentStudent(student);
        setIsMoveStudentOpen(true);
    };

    const handleClickToCall = async (student: AdmissionLead) => {
        if (!student) return;
        
        const formData = {
            entity: entityId,
            session: session,
            phone: student.phone,
            applicationNumber: student.applicationNumber,
            myOperatorId: myOperatorId
        };
        
        try {
            const result = await clickToCallMutation.mutateAsync(formData);
            alert(result.message || 'Call initiated successfully');
        } catch (error: any) {
            console.error('Click to call failed:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to initiate call';
            alert(`Error: ${errorMessage}`);
        }
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

    // Handle Excel Export (matching Angular - no display names, no filters)
    const handleExportExcel = () => {
        if (!data?.data || data.data.length === 0) return;

        const wb = XLSX.utils.book_new();
        const ws: XLSX.WorkSheet = {};

        // No filter summary (matching Angular)
        const filterSummary: any[] = [];

        // Header
        const tableStartRow = addExcelReportHeader(ws, entityName, selectedTemplate || 'Student Admission', filterSummary);
        
        // Table Headers (from tableHeads + Current Stage)
        const tableHeader = [...tableHeads.map(h => h.name), 'Current Stage'];
        XLSX.utils.sheet_add_aoa(ws, [tableHeader], { origin: { r: tableStartRow, c: 0 } });

        // Data Rows
        const dataRows = data.data.map((item: AdmissionLead) => {
            const row: any[] = [];
            
            // Map each column from tableHeads
            tableHeads.forEach((head: TableHead) => {
                if (head.value === 'tag' || head.value === 'selectedTags') {
                    row.push(item.tags?.map(t => typeof t === 'string' ? t : t.tag).join(', ') || '');
                } else {
                    let value = item[head.value];
                    
                    // Format dates (check if field name contains 'date' or 'Date' and value is a valid date string)
                    if (value && (head.value.toLowerCase().includes('date') || head.name.toLowerCase().includes('date'))) {
                        try {
                            const date = new Date(value);
                            if (!isNaN(date.getTime())) {
                                value = format(date, 'dd-MMM-yyyy');
                            }
                        } catch (e) {
                            // Keep original value if date parsing fails
                        }
                    }
                    
                    row.push(value || '');
                }
            });
            
            // Add Current Stage column (hardcoded, not from template)
            row.push(item.currentStage || '');
            
            // Add Bank Details columns (matching Angular implementation)
            if (item.bankDetails) {
                // Handle legacy array format
                const bankData = Array.isArray(item.bankDetails) ? item.bankDetails[0] : item.bankDetails;
                row.push(bankData?.bankName || '');
                row.push(bankData?.branchName || '');
                row.push(bankData?.accountNumber || '');
                row.push(bankData?.ifscCode || '');
                row.push(bankData?.studentName || '');
            } else {
                // Empty columns if no bank details
                row.push('', '', '', '', '');
            }
            
            return row;
        });

        XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: { r: tableStartRow + 1, c: 0 } });

        // Signatures
        const signatureRow = tableStartRow + 1 + dataRows.length + 4;
        addExcelReportFooter(ws, signatureRow);

        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'AdmissionApplication_Reports.xlsx');
    };

    // Handle Print Report (matching Angular - no display names)
    const handlePrint = () => {
        if (!data?.data || data.data.length === 0) return;

        // Store in localStorage (matching Angular)
        localStorage.setItem('admissionStudentDataPrint', JSON.stringify({
            data: data.data,
            tableHeads: tableHeads,
            viewName: selectedTemplate,
            entityName: entityName,
            stage: selectedStage !== 'Total' ? selectedStage : undefined,
        }));

        // Open print window
        window.open('/admission/print/admission-student-data', '_blank');
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

    const handleGenerateReport = async () => {
        try {
            // Prepare filter values array
            const filterValues: any[] = [];
            
            // Add stage filter
            if (selectedStage && selectedStage !== 'Total') {
                filterValues.push({
                    filter: 'stage',
                    value: selectedStage
                });
            }
            
            // Add filters from currentFilters
            if (currentFilters.course && currentFilters.course.length > 0) {
                filterValues.push({
                    filter: 'course',
                    value: currentFilters.course
                });
            }
            
            if (currentFilters.stream && currentFilters.stream.length > 0) {
                filterValues.push({
                    filter: 'stream',
                    value: currentFilters.stream
                });
            }
            
            if (currentFilters.batch && currentFilters.batch.length > 0) {
                filterValues.push({
                    filter: 'batch',
                    value: currentFilters.batch
                });
            }
            
            // Date range filter
            if (currentFilters.startDate) {
                const startDate = new Date(currentFilters.startDate).getTime();
                const endDate = currentFilters.endDate 
                    ? new Date(currentFilters.endDate).getTime() 
                    : undefined;
                
                filterValues.push({
                    filter: 'date',
                    type: 'date',
                    value: '',
                    startDate,
                    endDate
                });
            }
            
            // Updated At date range filter
            if (currentFilters.updatedAtStartDate) {
                const updatedAtStartDate = new Date(currentFilters.updatedAtStartDate).getTime();
                const updatedAtEndDate = currentFilters.updatedAtEndDate 
                    ? new Date(currentFilters.updatedAtEndDate).getTime() 
                    : undefined;
                
                filterValues.push({
                    filter: 'updatedAt',
                    type: 'date',
                    value: '',
                    startDate: updatedAtStartDate,
                    endDate: updatedAtEndDate
                });
            }
            
            // Counselor filter
            if (currentFilters.counselorId) {
                filterValues.push({
                    filter: 'counselorId',
                    value: currentFilters.counselorId
                });
            }
            
            // Tag filter
            if (currentFilters.tag && currentFilters.tag.length > 0) {
                filterValues.push({
                    filter: 'tag',
                    value: currentFilters.tag
                });
            }
            
            // Source filter
            if (currentFilters.source && currentFilters.source.length > 0) {
                filterValues.push({
                    filter: 'source',
                    value: currentFilters.source
                });
            }
            
            // Engagement status filter
            if (currentFilters.engagementStatus && currentFilters.engagementStatus.length > 0) {
                filterValues.push({
                    filter: 'engagementStatus',
                    value: currentFilters.engagementStatus
                });
            }
            
            // No counselor filter
            if (currentFilters.noCounselor !== undefined) {
                filterValues.push({
                    filter: 'noCounselor',
                    value: currentFilters.noCounselor
                });
            }
            
            // Prepare report data
            const reportData = {
                reportType: 'AdmissionStudentData',
                tableHeads: tableHeads,
                filterValues: filterValues,
                sortBy: 'date', // Default sort
                entity: entityId,
                qac: qac
            };
            
            // Call API
            await addReportFileMutation.mutateAsync(reportData);
            
            // Show success message
            alert('Report template saved successfully!');
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('Failed to save report template. Please try again.');
        }
    };

    const handleRefresh = () => {
        refetch();
        refetchStages();
    };

    const handleNeedHelp = () => {
        setIsHelpPanelOpen(true);
    };

    const handleSessionChange = (value: string | number | (string | number)[]) => {
        // Handle single value (session dropdown is not multi-select)
        const sessionValue = Array.isArray(value) ? value[0] : value;
        
        // Update Redux state
        dispatch(setAcademicSession(sessionValue as string));
        
        // Reset all filters
        setCurrentFilters({});
        
        // Reset pagination
        setPageNumber(1);
        setPageSize(10);
        
        // Reset stage selection
        setSelectedStage('Total');
        
        // Clear row selections
        setSelectedRows(new Set());
        
        // Refetch data (will happen automatically via useEffect dependencies)
        refetch();
        refetchStages();
    };


    const handleViewTimeline = (student: AdmissionLead) => {
        setTimelineStudent(student);
        setIsTimelineOpen(true);
    };

    const handleViewDocuments = (student: AdmissionLead) => {
        setDocumentStudent(student);
        setIsViewDocumentsOpen(true);
    };


    const handleViewBankDetails = (student: AdmissionLead) => {
        setBankDetailsStudent(student);
        setIsBankDetailsOpen(true);
    };

    const handleViewTransactions = (student: AdmissionLead) => {
        setTransactionsStudent(student);
        setIsTransactionsOpen(true);
    };

    const handleViewFollowUp = (student: AdmissionLead) => {
        if (!student.counselorId) {
            alert('Please assign counselor first');
            return;
        }
        setFollowUpStudent(student);
        setIsFollowUpOpen(true);
    };

    const handleViewAdmission = (id: string) => {
        setViewAdmissionStudentId(id);
        setIsViewAdmissionOpen(true);
    };

    // Handle search from DataTable - debounced to avoid too many API calls
    const handleSearch = (query: string) => {
        setSearchTerm(query);
        setPageNumber(1);
    };

    // 3-Tier Fallback for Table Heads: Custom Template → API Default → Hardcoded Default
    const tableHeads = useMemo<TableHead[]>(() => {
        // Priority 1: Selected custom template
        if (selectedTemplateData?.tableHeads) {
            return selectedTemplateData.tableHeads;
        }
        // Priority 2: API default template
        if (defaultTemplateData?.tableHeads) {
            return defaultTemplateData.tableHeads;
        }
        // Priority 3: Hardcoded fallback
        return DEFAULT_ADMISSION_APPLICATION_REPORT_HEADS as TableHead[];
    }, [selectedTemplateData, defaultTemplateData]);

    // Helper function to convert TableHead to DataTable Column
    const convertTableHeadToColumn = (head: TableHead): ColumnDef<AdmissionLead> => {
        const baseColumn: ColumnDef<AdmissionLead> = {
            header: head.name,
            accessorKey: head.value,
            meta: {
                width: 150,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>,
        };

        // Special formatting for name field
        if (head.value === 'name') {
            baseColumn.cell = (info) => {
                const val = info.getValue() as string;
                return (
                    <span 
                        className="text-primary cursor-pointer hover:underline" 
                        title="Click to view application details"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateToAdmissionDetails(info.row.original._id);
                        }}
                    >
                        {val}
                    </span>
                );
            };
            return baseColumn;
        }

        // Special formatting for application number
        if (head.value === 'applicationNumber') {
            baseColumn.cell = (info) => {
                const val = info.getValue() as string;
                return (
                    <span 
                        className="text-primary cursor-pointer hover:underline" 
                        title="Click to view application details"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateToAdmissionDetails(info.row.original._id);
                        }}
                    >
                        {val}
                    </span>
                );
            };
            return baseColumn;
        }
        // Special formatting for specific fields
        if (head.value === 'date' || head.value === 'dob' || head.value === 'doa') {
            baseColumn.cell = (info) => {
                const val = info.getValue();
                return val ? format(new Date(val as number), 'dd-MMM-yyyy') : '-';
            };
        }

        if (head.value === 'name') {
            baseColumn.cell = (info) => <span className="font-medium">{info.getValue() as string}</span>;
            baseColumn.meta = {
                width: 217,
                align: 'left' as const,
                isBold: true,
            } as ExtendedColumnMeta<AdmissionLead>;
        }

        if (head.value === 'currentStage') {
            baseColumn.cell = (info) => {
                const val = info.getValue() as string;
                return <Badge variant={val}>{val}</Badge>;
            };
            baseColumn.meta = {
                width: 132,
                align: 'center' as const,
            } as ExtendedColumnMeta<AdmissionLead>;
        }

        if (head.value === 'tag' || head.value === 'selectedTags') {
            baseColumn.accessorKey = 'tags'; // API returns 'tags' field
            baseColumn.cell = (info) => {
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
            };
        }

        return baseColumn;
    };

    // Columns with dynamic styling
    const columns = useMemo<ColumnDef<AdmissionLead>[]>(() => {
        const dynamicColumns: ColumnDef<AdmissionLead>[] = [
            {
                id: 'select',
                header: () => (
                    <div className="flex items-center justify-center gap-2">
                        <input
                            type="checkbox"
                            checked={(data?.data?.length || 0) > 0 && selectedRows.size === (data?.data?.length || 0)}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="cursor-pointer"
                        />
                        <span>S.No</span>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedRows.has(row.original._id)}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleSelectRow(row.original._id, e.target.checked);
                            }}
                            className="cursor-pointer"
                        />
                        <span>{(pageNumber - 1) * pageSize + row.index + 1}</span>
                    </div>
                ),
                meta: {
                    width: 100,
                    align: 'center' as const,
                } as ExtendedColumnMeta<AdmissionLead>,
            },
            {
                header: 'Action',
                id: 'actions',
                cell: info => {
                    const student = info.row.original;
                    return (
                        <ActionMenu
                            items={[
                                // 1. View Admission - Always visible
                                { 
                                    label: 'View Admission', 
                                    onClick: () => handleViewAdmission(student._id), 
                                    icon: <User size={14} className="text-blue-500" /> 
                                },
                                // 2. View Transactions - Always visible
                                { 
                                    label: 'View Transactions', 
                                    onClick: () => handleViewTransactions(student), 
                                    icon: <Receipt size={14} className="text-orange-500" /> 
                                },
                                // 3. View Timeline - Always visible
                                { 
                                    label: 'View Timeline', 
                                    onClick: () => handleViewTimeline(student), 
                                    icon: <Clock size={14} className="text-blue-500" /> 
                                },
                                // 4. View Documents - Always visible
                                { 
                                    label: 'View Documents', 
                                    onClick: () => handleViewDocuments(student), 
                                    icon: <FileText size={14} className="text-green-500" /> 
                                },
                                // 5. Verify Documents - Always visible
                                { 
                                    label: 'Verify Documents', 
                                    onClick: () => window.open(`/admission/verify-documents/${student._id}`, '_blank'), 
                                    icon: <FileText size={14} className="text-blue-600" /> 
                                },
                                // 6. Delete Admission - Permission-based, disabled if has transactions
                                { 
                                    label: 'Delete Admission', 
                                    onClick: () => handleDeleteAdmission(student._id), 
                                    icon: <Trash2 size={14} className="text-red-500" />,
                                    hidden: !checkPermission('deleteAdmissionStudentData'),
                                    disabled: (student.transactions?.length || 0) > 0,
                                    className: 'text-red-600 hover:text-red-700'
                                },
                                // 7. View Follow Up - Permission-based
                                { 
                                    label: 'View Follow Up', 
                                    onClick: () => handleViewFollowUp(student), 
                                    icon: <MessageSquare size={14} className="text-blue-500" />,
                                    hidden: !checkPermission('viewAdmissionStudentData')
                                },
                                // 8. View Bank Details - Always visible
                                { 
                                    label: 'View Bank Details', 
                                    onClick: () => handleViewBankDetails(student), 
                                    icon: <Landmark size={14} className="text-purple-500" /> 
                                },
                                // 9. Move Application - Permission-based, hidden for Approved, disabled for Moved
                                { 
                                    label: 'Move Application', 
                                    onClick: () => handleMoveApplication(student), 
                                    icon: <ArrowRight size={14} className="text-blue-500" />,
                                    hidden: !checkPermission('moveAdmissionStudentDataToEntity') || student.currentStage === 'Approved',
                                    disabled: student.tags?.some((t: any) => (typeof t === 'string' ? t : t.tag) === 'Moved to Other')
                                },
                                // 10. Move Student - Permission-based, hidden for non-Approved, disabled for Moved
                                { 
                                    label: 'Move Student', 
                                    onClick: () => handleMoveStudent(student), 
                                    icon: <ArrowRight size={14} className="text-green-500" />,
                                    hidden: !checkPermission('moveAdmissionStudentDataToEntity') || student.currentStage !== 'Approved',
                                    disabled: student.tags?.some((t: any) => (typeof t === 'string' ? t : t.tag) === 'Moved to Other')
                                },
                                // 11. Click to Call - Permission-based
                                { 
                                    label: 'Click to Call', 
                                    onClick: () => handleClickToCall(student), 
                                    icon: <Phone size={14} className="text-green-500" />,
                                    hidden: !checkPermission('peerToPeerCallForAdmission')
                                },
                                // 12. Print Form - Always visible
                                { 
                                    label: 'Print Form', 
                                    onClick: () => handlePrintForm(student), 
                                    icon: <Printer size={14} className="text-gray-500" /> 
                                },
                            ]}
                        />
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
        ];

        // Add columns from template heads
        tableHeads.forEach((head) => {
            dynamicColumns.push(convertTableHeadToColumn(head));
        });

        return dynamicColumns;
    }, [pageNumber, pageSize, tableHeads]);



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
                    <Dropdown
                        options={sessions?.map(s => ({ label: s.name, value: s.name })) || []}
                        value={session}
                        onChange={handleSessionChange}
                        placeholder="Select Session"
                        containerClassName="min-w-[200px]"
                        className="!py-1.5 !min-h-[36px] text-sm font-semibold"
                    />

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

            {/* Template Selection Tabs - Show if templates exist */}
            {templates && templates.length > 0 && (
                <HorizontalTabs
                    tabs={templates.map(t => ({ label: t.viewName.toUpperCase(), value: t.viewName }))}
                    activeTab={selectedTemplate}
                    onTabChange={setSelectedTemplate}
                    className="px-0 mb-4"
                />
            )}

            {/* Data Table with integrated Search By */}
            {!hasError && (
                <DataTable
                    columns={columns}
                    data={data?.data || []}
                    isLoading={isLoading}
                    showSearch={true}
                    searchPlaceholder="Search..."
                    onSearch={handleSearch}
                    searchByOptions={ADMISSION_SEARCH_BY_OPTIONS}
                    searchByValue={searchBy}
                    onSearchByChange={(value) => setSearchBy(value)}
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
            )}

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
                stages={stageCounts?.map((s: any) => s.stage) || []}
            />

            <UploadExcelModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadExcel}
            />



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

            <MoveApplicationModal
                isOpen={isMoveApplicationOpen}
                onClose={() => setIsMoveApplicationOpen(false)}
                student={moveApplicationStudent}
                onSuccess={() => {
                    // Refresh data after successful move
                    refetch();
                }}
            />

            <MoveStudentModal
                isOpen={isMoveStudentOpen}
                onClose={() => setIsMoveStudentOpen(false)}
                student={moveStudentStudent}
                onSuccess={() => {
                    // Refresh data after successful move
                    refetch();
                }}
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
