import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions, useAdmissionStudentData, useAdmissionStages, useAdmissionStageSetup, useCounselors, useAdmissionTemplates, useDefaultAdmissionTemplate, useAdmissionTemplate, useAddReportFile, useDeleteAdmissionStudentData, useClickToCall, useEditExcelTemplate } from '@od-erp/query';
import { DataTable, Button, Badge, PageHeader, PageToolbar, ActionButton, NeedHelpPanel, ActionMenu, ViewDocumentsModal, SelectSingle, Tooltip, ExcelTemplateEditDrawer } from '@od-erp/ui';
import { AdmissionLead, AdmissionStudentDataPayload, ExtendedColumnMeta, TableHead } from '@od-erp/types';
import {
    ADMISSION_SEARCH_BY_OPTIONS,
    DEFAULT_ADMISSION_APPLICATION_REPORT_HEADS,
    ADMISSION_APPLICATION_AVAILABLE_HEADS,
    ADMISSION_APPLICATION_AVAILABLE_FILTERS,
    ADMISSION_APPLICATION_SORT_BY_OPTIONS,
    EXCEL_FILTER_DATE_PRESETS,
    ADMISSION_REPORT_TYPE,
} from '@od-erp/constants';

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
    Phone,
    Mail,
    MessageCircle,
    Users,
    Send,
    Pencil
} from 'lucide-react';
import AddApplicationDataPanel from './components/AddApplicationDataPanel';
import FilterModal from './components/FilterModal';
import UploadExcelModal from './components/UploadExcelModal';
import TimelineModal from '../../components/Modals/TimelineModal';
import BankDetailsModal from './components/BankDetailsModal';
import ViewTransactionsModal from './components/ViewTransactionsModal';
import ViewFollowUpModal from '../../components/Modals/ViewFollowUpModal';
import SendEmailModal from './components/SendEmailModal';
import SendWhatsappWebModal from './components/SendWhatsappWebModal';
import SendSmsModal from '../AdmissionLeads/components/Modals/SendSmsModal';
import SendWhatsappModal from '../AdmissionLeads/components/Modals/SendWhatsappModal';
import BulkUpdateCounselorModal from '../AdmissionLeads/components/Modals/BulkUpdateCounselorModal';

import MoveApplicationModal from './components/MoveApplicationModal';
import MoveStudentModal from './components/MoveStudentModal';
import * as XLSX from 'xlsx';
import { useAppSelector, useAppDispatch, setAcademicSession } from '@od-erp/store';
import { admissionStudentDataService } from '@od-erp/api-client';

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
    const entityDetails = useAppSelector((state) => state.auth.entityDetails);
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences);
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

    // Bulk Action Modal States
    const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
    const [isSendWhatsappWebOpen, setIsSendWhatsappWebOpen] = useState(false);
    const [isSendWhatsappOpen, setIsSendWhatsappOpen] = useState(false);
    const [isSendSmsOpen, setIsSendSmsOpen] = useState(false);
    const [isBulkCounselorOpen, setIsBulkCounselorOpen] = useState(false);


    // Mutations
    const addReportFileMutation = useAddReportFile();
    const clickToCallMutation = useClickToCall();

    // Queries
    const { data: sessions } = useSessions(entityId);
    const { data: _counselors } = useCounselors(entityId || '', 'counselor');

    // Get entityType and QAC from Redux (consistent with other pages)
    const entityType = useAppSelector((state) => state.session.entityType) || '';
    const qac = useAppSelector((state) => state.auth.entityDetails?.qac) || '';

    // Template Queries - 3-tier fallback: Custom Templates → API Defaults → Hardcoded Defaults
    const { data: templates } = useAdmissionTemplates(entityId);
    const { data: defaultTemplateData } = useDefaultAdmissionTemplate(entityId, entityType);
    const [selectedTemplate, setSelectedTemplate] = useState<string>(''); // viewName of selected template
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const editTemplateMutation = useEditExcelTemplate(entityId, ADMISSION_REPORT_TYPE);

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

    // Read drill-down filter parameters from localStorage (from CounselorProductivityReport)
    useEffect(() => {
        const filterObjectData = localStorage.getItem('filterObjectData');
        if (filterObjectData) {
            try {
                const filters = JSON.parse(filterObjectData);
                
                // Build new filter object
                const newFilters: Partial<AdmissionStudentDataPayload> = {};
                
                // Apply engagement status filter
                if (filters.engagementStatus) {
                    newFilters.engagementStatus = [filters.engagementStatus];
                }
                
                // Apply counselor filter
                if (filters.counselorId) {
                    newFilters.counselorId = filters.counselorId;
                }
                
                // Apply date range filters
                if (filters.startDate) {
                    newFilters.startDate = filters.startDate;
                }
                
                if (filters.endDate) {
                    newFilters.endDate = filters.endDate;
                }
                
                // Apply filters to state
                setCurrentFilters(newFilters);
                
                // Clean up localStorage
                localStorage.removeItem('filterObjectData');
                
            } catch (error) {
                console.error('Error parsing filterObjectData:', error);
                localStorage.removeItem('filterObjectData');
            }
        }
    }, []); // Run only on mount

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
        // Store current filters in localStorage for restoration
        const filterObjectData: any = {};

        if (selectedStage && selectedStage !== 'Total') {
            filterObjectData.stage = selectedStage;
        }
        if (currentFilters.course) {
            filterObjectData.course = currentFilters.course;
        }
        if (currentFilters.stream) {
            filterObjectData.stream = currentFilters.stream;
        }
        if (currentFilters.batch) {
            filterObjectData.batch = currentFilters.batch;
        }
        if (currentFilters.startDate) {
            filterObjectData.startDate = currentFilters.startDate;
        }
        if (currentFilters.endDate) {
            filterObjectData.endDate = currentFilters.endDate;
        }
        if (currentFilters.updatedAtStartDate) {
            filterObjectData.updatedAtStartDate = currentFilters.updatedAtStartDate;
        }
        if (currentFilters.updatedAtEndDate) {
            filterObjectData.updatedAtEndDate = currentFilters.updatedAtEndDate;
        }
        if (currentFilters.counselorId) {
            filterObjectData.counselorId = currentFilters.counselorId;
        }
        if (currentFilters.tag) {
            filterObjectData.tag = currentFilters.tag;
        }
        if (currentFilters.source) {
            filterObjectData.source = currentFilters.source;
        }
        if (currentFilters.engagementStatus) {
            filterObjectData.engagementStatus = currentFilters.engagementStatus;
        }
        if (currentFilters.noCounselor !== undefined) {
            filterObjectData.noCounselor = currentFilters.noCounselor;
        }

        localStorage.setItem('filterInDetailsPage', JSON.stringify(filterObjectData));

        // Navigate with state
        navigate(`/admission/student-data/${id}`, {
            state: { from: 'studentData' }
        });
    };

    // Mutations
    const deleteStudentMutation = useDeleteAdmissionStudentData();

    const handlePrintForm = (student: AdmissionLead) => {
        if (!student) return;

        const angularAppUrl = import.meta.env.VITE_ANGULAR_TEMPLATES_URL || 'http://localhost:4200';

        // Open Angular app
        const printWindow = window.open(
            `${angularAppUrl}/print/open/printAdmissionForm`,
            '_blank'
        );

        // Send data via postMessage
        if (printWindow) {
            const sendData = () => {
                printWindow.postMessage(
                    {
                        type: 'PRINT_ADMISSION_FORM',
                        data: {
                            studentId: student._id,
                            entityId: entityId,
                            session: session,
                            entity: {
                                _id: entityId,
                                displayName: entityDetails?.displayName,
                                logo: entityDetails?.logo,
                            },
                            entityPreferences: entityPreferences,
                            entityType: 'school',
                            // Include complete student data for template
                            studentData: student
                        }
                    },
                    angularAppUrl
                );
            };

            // Send data after a delay to ensure Angular app is loaded
            setTimeout(sendData, 1000);
        }
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

    // Get selected students data for modals
    const getSelectedStudents = (): AdmissionLead[] => {
        return (data?.data || []).filter((student: AdmissionLead) => selectedRows.has(student._id));
    };

    // Bulk Action Handlers
    const handleBulkSendEmail = () => {
        if (selectedRows.size === 0) return;
        setIsSendEmailOpen(true);
    };

    const handleBulkSendWhatsappWeb = () => {
        if (selectedRows.size === 0) return;
        setIsSendWhatsappWebOpen(true);
    };

    const handleBulkSendWhatsapp = () => {
        if (selectedRows.size === 0) return;
        setIsSendWhatsappOpen(true);
    };

    const handleBulkSendSms = () => {
        if (selectedRows.size === 0) return;
        setIsSendSmsOpen(true);
    };

    const handlePrintSelectedForms = () => {
        if (selectedRows.size === 0) {
            alert('Please select at least one student');
            return;
        }

        const selectedStudents = getSelectedStudents();
        if (selectedStudents.length === 0) {
            alert('Could not find selected student data. Please try again.');
            return;
        }

        const angularAppUrl = import.meta.env.VITE_ANGULAR_TEMPLATES_URL || 'http://localhost:4200';

        const printWindow = window.open(
            `${angularAppUrl}/print/open/printAdmissionForm`,
            '_blank'
        );

        if (printWindow) {
            const sendData = () => {
                printWindow.postMessage(
                    {
                        type: 'PRINT_ADMISSION_FORM_BULK',
                        data: {
                            entityId: entityId,
                            session: session,
                            entity: {
                                _id: entityId,
                                displayName: entityDetails?.displayName,
                                logo: entityDetails?.logo,
                            },
                            entityPreferences: entityPreferences,
                            entityType: 'school',
                            students: selectedStudents
                        }
                    },
                    angularAppUrl
                );
            };
            setTimeout(sendData, 1000);
        } else {
            alert('Popup was blocked. Please allow popups for this site and try again.');
        }
    };

    const handleBulkUpdateCounselor = () => {
        if (selectedRows.size === 0) return;
        setIsBulkCounselorOpen(true);
    };

    // Action Buttons for PageHeader / PageToolbar
    const actionButtons: ActionButton[] = [
        {
            icon: SlidersHorizontal,
            onClick: () => setIsFilterModalOpen(!isFilterModalOpen),
            title: 'Filter',
            className: `text-primary hover:bg-primary/10 hover:text-primary${isFilterModalOpen ? ' bg-primary/10 border-primary/20' : ''}`,
            isVisible: true,
            variant: 'outline'
        },
        {
            icon: RefreshCw,
            onClick: handleRefresh,
            title: 'Refresh',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            iconClass: isLoading || isFetching ? 'animate-spin' : '',
            variant: 'outline'
        },
        {
            icon: Upload,
            onClick: () => setIsUploadModalOpen(true),
            title: 'Upload Excel',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: checkPermission('uploadAdmissionStudentData'),
            variant: 'outline'
        },
        {
            icon: FileSpreadsheet,
            onClick: handleExportExcel,
            title: 'Export to Excel',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !hasError || checkPermission('exportAdmissionStudentData'),
            variant: 'outline'
        },
        {
            icon: Printer,
            onClick: handlePrint,
            title: 'Print',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !hasError || checkPermission('exportAdmissionStudentData'),
            variant: 'outline'
        },
        {
            icon: FileText,
            onClick: handleGenerateReport,
            title: 'Generate Report',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: !hasError || checkPermission('exportAdmissionStudentData'),
            variant: 'outline'
        },
        {
            icon: HelpCircle,
            onClick: handleNeedHelp,
            title: 'Need Help',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            variant: 'outline'
        },
    ];

    // Extra content for PageToolbar: bulk actions (when rows selected) + Session Selector + Add Application Data button
    const toolbarExtraContent = (
        <div className="flex items-center gap-2">
            {/* Bulk action buttons - only shown when rows are selected */}
            {selectedRows.size > 0 && (
                <>
                    {checkPermission('sendBulkAdmissionReminderEmail') && (
                        <Tooltip content={`Send Email (${selectedRows.size})`} placement="bottom">
                            <button
                                className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                onClick={handleBulkSendEmail}
                            >
                                <Mail size={16} />
                            </button>
                        </Tooltip>
                    )}
                    {checkPermission('sendMultipleAdmissionReminderWhatsAppWebCommunication') && (
                        <Tooltip content={`WhatsApp Web (${selectedRows.size})`} placement="bottom">
                            <button
                                className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                onClick={handleBulkSendWhatsappWeb}
                            >
                                <MessageCircle size={16} />
                            </button>
                        </Tooltip>
                    )}
                    {checkPermission('sendMultipleAdmissionReminderWhatsAppCommunication') && (
                        <Tooltip content={`WhatsApp (${selectedRows.size})`} placement="bottom">
                            <button
                                className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                onClick={handleBulkSendWhatsapp}
                            >
                                <MessageSquare size={16} />
                            </button>
                        </Tooltip>
                    )}
                    {checkPermission('sendMultipleAdmissionReminderSMSCommunication') && (
                        <Tooltip content={`Send SMS (${selectedRows.size})`} placement="bottom">
                            <button
                                className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                onClick={handleBulkSendSms}
                            >
                                <Send size={16} />
                            </button>
                        </Tooltip>
                    )}
                    <Tooltip content={`Print Forms (${selectedRows.size})`} placement="bottom">
                        <button
                            className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                            onClick={handlePrintSelectedForms}
                        >
                            <Printer size={16} />
                        </button>
                    </Tooltip>
                    {checkPermission('counselorUpdateBulkRequest') && (
                        <Tooltip content={`Update Counselor (${selectedRows.size})`} placement="bottom">
                            <button
                                className="!p-0 !w-9 !h-9 flex items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                onClick={handleBulkUpdateCounselor}
                            >
                                <Users size={16} />
                            </button>
                        </Tooltip>
                    )}
                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-300" />
                </>
            )}

            <SelectSingle
                options={sessions?.map(s => ({ value: s.name, label: s.name })) || [{ value: session, label: session }]}
                value={session}
                onChange={(val) => handleSessionChange(val as string)}
                placeholder="Select Session"
                containerClassName="w-40"
            />
            {checkPermission('addAdmissionStudentData') && (
                <Button
                    variant="primary"
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5"
                >
                    <Plus size={16} />
                    Add Application Data
                </Button>
            )}
        </div>
    );

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


    const handleCounselorUpdate = (counselorId: string) => {
        const studentDataIds = Array.from(selectedRows);
        // Use the admission lead service for bulk counselor update
        import('@od-erp/api-client').then(({ admissionLeadService }) => {
            admissionLeadService.bulkCounselorUpdate({
                studentDataIds,
                entity: entityId,
                counselor: counselorId
            }).then(() => {
                setSelectedRows(new Set());
                refetch();
            }).catch((err: any) => {
                console.error('Failed to update counselor:', err);
            });
        });
    };

    // Handle modal close without clearing selection
    const handleEmailModalClose = () => {
        setIsSendEmailOpen(false);
    };

    const handleWhatsappWebModalClose = () => {
        setIsSendWhatsappWebOpen(false);
    };

    const handleWhatsappModalClose = () => {
        setIsSendWhatsappOpen(false);
    };

    const handleSmsModalClose = () => {
        setIsSendSmsOpen(false);
    };

    // Clear selection after successful operations
    const clearSelection = () => {
        setSelectedRows(new Set());
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
                                    onClick: () => window.open(`/admission/verify-documents/${student._id}`, '_self'),
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
                    align: 'center' as const,
                } as ExtendedColumnMeta<AdmissionLead>,
            },
        ];

        // Add columns from template heads
        tableHeads.forEach((head) => {
            dynamicColumns.push(convertTableHeadToColumn(head));
        });

        return dynamicColumns;
    }, [pageNumber, pageSize, tableHeads, selectedRows, data, handleSelectAll, handleSelectRow, handleViewAdmission, handleViewTransactions, handleViewTimeline, handleViewDocuments, handleDeleteAdmission, handleViewBankDetails, handleViewFollowUp, handleMoveApplication, handleMoveStudent, handleClickToCall, checkPermission]);



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
        <div className="w-full max-w-full min-w-0 font-sans">
            <PageHeader
                title="Application Data"
                breadcrumbs={breadcrumbItems}
                actionButtons={actionButtons}
            />

            <PageToolbar
                tabs={templates && templates.length > 0
                    ? templates.map(t => ({ label: t.viewName.toUpperCase(), value: t.viewName }))
                    : []}
                activeTab={selectedTemplate}
                onTabChange={(val) => { setSelectedTemplate(val); setEditDrawerOpen(false); }}
                secondaryTabs={tabs.map(tab => ({ label: `${tab.name} (${tab.count})`, value: tab.value }))}
                secondaryActiveTab={selectedStage}
                onSecondaryTabChange={(val) => { setSelectedStage(val); setPageNumber(1); }}
                actions={actionButtons}
                extraContent={
                    <div className="flex items-center gap-2">
                        {toolbarExtraContent}
                        {(() => {
                            const activeTemplate = templates?.find(t => t.viewName === selectedTemplate);
                            const canEdit = permissions.includes('editEntityPreferences');
                            if (!activeTemplate?._id || !canEdit) return null;
                            return (
                                <Button
                                    variant="outline"
                                    onClick={() => setEditDrawerOpen(true)}
                                    title={`Edit template: ${activeTemplate.viewName}`}
                                    className="!p-0 !w-9 !h-9 text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            );
                        })()}
                    </div>
                }
            />


            {/* View Admission (Edit Mode) */}
            <AddApplicationDataPanel
                isOpen={isViewAdmissionOpen}
                onClose={() => {
                    setIsViewAdmissionOpen(false);
                    setViewAdmissionStudentId(null);
                }}
                mode="edit"
                studentId={viewAdmissionStudentId || undefined}
                onSuccess={() => {
                    refetch();
                    refetchStages();
                }}
            />



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
                    maxHeight={undefined}
                />
            )}


            {/* Add Application Data Panel */}
            <AddApplicationDataPanel
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                mode="add"
                onSuccess={() => {
                    refetch();
                    refetchStages();
                }}
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
                onClose={() => {
                    setIsViewDocumentsOpen(false);
                    setDocumentStudent(null);
                }}
                student={documentStudent}
                entityName={documentStudent?.name}
                permissions={permissions}
                onUploadSuccess={() => refetch()}
                apiConfig={{
                    getPresignedUrl: admissionStudentDataService.getPresignedUrl,
                    uploadFileToUrl: admissionStudentDataService.uploadFileToUrl,
                    uploadDocuments: admissionStudentDataService.uploadAdmissionDocuments,
                }}
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

            {/* Bulk Action Modals */}
            <SendEmailModal
                isOpen={isSendEmailOpen}
                onClose={handleEmailModalClose}
                selectedStudents={getSelectedStudents()}
                onSuccess={clearSelection}
            />

            <SendWhatsappWebModal
                isOpen={isSendWhatsappWebOpen}
                onClose={handleWhatsappWebModalClose}
                selectedStudents={getSelectedStudents()}
                onSuccess={clearSelection}
            />

            <SendWhatsappModal
                isOpen={isSendWhatsappOpen}
                onClose={handleWhatsappModalClose}
                selectedLeads={getSelectedStudents()}
                onSuccess={clearSelection}
            />

            <SendSmsModal
                isOpen={isSendSmsOpen}
                onClose={handleSmsModalClose}
                selectedLeads={getSelectedStudents()}
                onSuccess={clearSelection}
            />

            <BulkUpdateCounselorModal
                isOpen={isBulkCounselorOpen}
                onClose={() => setIsBulkCounselorOpen(false)}
                selectedCount={selectedRows.size}
                entityId={entityId}
                onUpdate={handleCounselorUpdate}
            />

            {/* Need Help Panel */}
            <NeedHelpPanel
                isOpen={isHelpPanelOpen}
                onClose={() => setIsHelpPanelOpen(false)}
                page="applicationData"
            />

            {/* Excel Template Edit Drawer */}
            {editDrawerOpen && (() => {
                const activeTemplate = templates?.find(t => t.viewName === selectedTemplate);
                return activeTemplate?._id ? (
                    <ExcelTemplateEditDrawer
                        open={editDrawerOpen}
                        onClose={() => setEditDrawerOpen(false)}
                        template={activeTemplate}
                        reportDisplayName="Application Data"
                        availableHeads={ADMISSION_APPLICATION_AVAILABLE_HEADS}
                        availableFilters={ADMISSION_APPLICATION_AVAILABLE_FILTERS}
                        sortByOptions={ADMISSION_APPLICATION_SORT_BY_OPTIONS}
                        defaultHeads={DEFAULT_ADMISSION_APPLICATION_REPORT_HEADS}
                        datePresets={EXCEL_FILTER_DATE_PRESETS.map(p => ({ label: p.name, value: p.value }))}
                        onSave={async (payload) => {
                            await editTemplateMutation.mutateAsync(payload as any);
                            setEditDrawerOpen(false);
                        }}
                    />
                ) : null;
            })()}

        </div>
    );
};

export default AdmissionStudentData;
