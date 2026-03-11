import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmissionLeadLog, useExcelTemplates, useDefaultExcelTemplates, useEditExcelTemplate } from '@od-erp/query';
import { Badge, DataTable, DropdownMenu, PageHeader, PageToolbar, ActionButton, EmptyState, useToast, ExcelTemplateEditDrawer, Button } from '@od-erp/ui';
import { AdmissionLeadLog, TableHead } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { Phone, Eye, Trash2, SlidersHorizontal, RefreshCw, PhoneIncoming, PhoneMissed, MoreVertical, Pencil } from 'lucide-react';

import { admissionLeadLogsService, admissionService } from '@od-erp/api-client';
import {
    DEFAULT_ADMISSION_LEADS_REPORT_HEADS,
    ADMISSION_LEADS_AVAILABLE_HEADS,
    ADMISSION_LEADS_AVAILABLE_FILTERS,
    ADMISSION_LEADS_SORT_BY_OPTIONS,
    EXCEL_FILTER_DATE_PRESETS,
} from '@od-erp/constants';
import { useAppSelector } from '@od-erp/store';
import { formatPhone } from '../../utils/phoneUtils';
import { RejectRemarkDialog } from './components/RejectRemarkDialog';
import { TagSelectionDialog } from './components/TagSelectionDialog';
import { FollowUpDialog } from './components/FollowUpDialog';
import { NegativeRemarkDialog } from './components/NegativeRemarkDialog';
import { DuplicateNumbersDialog } from './components/DuplicateNumbersDialog';
import { TemplateFilter } from './components/TemplateFilter';
import { EditForm } from './components/EditForm';

interface Tag {
  _id: string;
  tag: string;
  label: string;
  colour: string;
}

const AdmissionLeadLogs = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State for Filters (committed values - drive the API query)
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [selectedCounselor, setSelectedCounselor] = useState<string>('');
  const [startDate, setStartDate] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<number | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['pending']);
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('');
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Local filter state (pending values - only committed on Apply Filters)
  const [localCounselor, setLocalCounselor] = useState<string>('');
  const [localStartDate, setLocalStartDate] = useState<number | undefined>(undefined);
  const [localEndDate, setLocalEndDate] = useState<number | undefined>(undefined);
  const [localSource, setLocalSource] = useState<string>('');
  const [localStatus, setLocalStatus] = useState<string[]>(['pending']);
  const [localCallStatus, setLocalCallStatus] = useState<string>('');
  const [localShowMemberDetails, setLocalShowMemberDetails] = useState(false);

  // State for Edit Form
  const [selectedLead, setSelectedLead] = useState<AdmissionLeadLog | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [courseList, setCourseList] = useState<any[]>([]);
  const [streams, setStreams] = useState<string[]>([]);

  // State for Dialogs
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [showNegativeDialog, setShowNegativeDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [duplicateStudents, setDuplicateStudents] = useState<any[]>([]);
  const [convertingLead, setConvertingLead] = useState<AdmissionLeadLog | null>(null);

  // State for Team Lead
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLead, setIsLead] = useState(false);
  const [counselorOptions, setCounselorOptions] = useState<any[]>([]);

  // Metadata
  const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
  const session = useAppSelector((state) => state.session.academicSession) || '';
  const entityType = useAppSelector((state) => state.session.entityType) || '';
  const employeeId = useAppSelector((state) => state.auth.user?.employeeId) || '';
  const myOperatorId = useAppSelector((state) => state.auth.user?.myOperatorId) || '';
  const userName = useAppSelector((state) => state.auth.user?.name) || '';
  const userMobile = useAppSelector((state) => state.auth.user?.mobile) || '';
  const entityPreferences = useAppSelector((state) => state.config.entityPreferences) || null;

  const displayNames = {
    course: entityPreferences?.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
    stream: entityPreferences?.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
    batch: entityPreferences?.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    subjectCombination: entityPreferences?.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
  };

  const showBatch = entityPreferences?.showBatch !== undefined ? entityPreferences?.showBatch : true;


  // Permissions from Redux store
  const permissionsArray = useAppSelector((state) => state.auth.permissions) || [];
  const permissions = useMemo(() => ({
    isAdmissionAdmin: permissionsArray.includes('isAdmissionAdmin'),
    viewAdmissionPhoneNumber: permissionsArray.includes('viewAdmissionPhoneNumber'),
    peerToPeerCallForAdmission: permissionsArray.includes('peerToPeerCallForAdmission'),
    viewAdmissionLeadLogs: permissionsArray.includes('viewAdmissionLeadLogs'),
    editAdmissionLeadLogs: permissionsArray.includes('editAdmissionLeadLogs'),
    deleteAdmissionLeadLogs: permissionsArray.includes('deleteAdmissionLeadLogs'),
    convertAdmissionLeadLogs: permissionsArray.includes('convertAdmissionLeadLogs'),
  }), [permissionsArray]);

  // Queries
  const { data: templates } = useExcelTemplates(entityId, 'admissionLeadsReportHeads');
  const { data: defaultTemplate } = useDefaultExcelTemplates('admissionLeadsReportHeads', entityType);
  const editTemplateMutation = useEditExcelTemplate(entityId, 'admissionLeadsReportHeads');

  // Construct Query Payload
  const queryPayload = useMemo(() => ({
    entity: entityId,
    session: session,
    pageNumber,
    pageSize,
    counselorId: permissions.isAdmissionAdmin
      ? (selectedCounselor || undefined)
      : (isLead ? (selectedCounselor || employeeId) : employeeId),
    startDate,
    endDate,
    source: selectedSource || undefined,
    status: selectedStatus.length > 0 ? selectedStatus : undefined,
    callStatus: selectedCallStatus || undefined,
    memberDetails: showMemberDetails
  }), [entityId, session, pageNumber, pageSize, selectedCounselor, startDate, endDate, selectedSource, selectedStatus, selectedCallStatus, showMemberDetails, permissions.isAdmissionAdmin, employeeId, isLead]);

  const { data: reportData, isLoading, refetch } = useAdmissionLeadLog(queryPayload);

  // Process response data: sanitize callRecordingLink and extract applicationNumber
  const processedData = useMemo(() => {
    if (!reportData?.data) return [];

    return reportData.data.map(item => {
      const processedItem = { ...item };

      // Sanitize call recording link (HTTP → HTTPS)
      if (processedItem.callDetails?.callRecordingLink) {
        processedItem.callDetails.callRecordingLink =
          processedItem.callDetails.callRecordingLink.replace(/^http:/, 'https:');
      }

      // Extract applicationNumber from studentData
      if (processedItem.studentData?.applicationNumber) {
        processedItem.applicationNumber = processedItem.studentData.applicationNumber;
      }

      return processedItem;
    });
  }, [reportData]);

  // Load admission master, counselors, and courses
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load admission master for tags and teams
        const masterData = await admissionService.viewAdmissionMaster(entityId, session);
        if (masterData.tags) setTags(masterData.tags);

        // Load counselors
        const employeeData = await admissionService.listEmployee(entityId, 'counselor');

        // Determine if user is team lead (check regardless of admin status)
        let userIsLead = false;
        const teamOptions: any[] = [];

        // Check if user is a team lead (independent of admin status)
        if (masterData.teams && masterData.teams.length > 0) {
          for (const team of masterData.teams) {
            if (team.leadDetails.employee === employeeId) {
              userIsLead = true;
              teamOptions.push({ label: team.leadDetails.employeeName, value: team.leadDetails.employee });
              team.memberDetails.forEach((mem: any) => {
                teamOptions.push({ label: mem.employeeName, value: mem.employee });
              });
              break;
            }
          }
        }

        setIsLead(userIsLead);

        // Set counselor options based on role
        // Admins: see all employees
        // Team Leads: see their team members
        if (permissions.isAdmissionAdmin || userIsLead) {
          const options = permissions.isAdmissionAdmin
            ? employeeData.map((emp: any) => ({ label: emp.name, value: emp._id }))
            : teamOptions;
          setCounselorOptions([{ label: 'All Counselors', value: '' }, ...options]);

          // Pre-fill counselor with current user's employee ID
          const currentEmp = employeeData.find((emp: any) => emp._id === employeeId);
          if (currentEmp) {
            setSelectedCounselor(currentEmp._id);
          }
        }

        // Load courses
        const courses = await admissionService.getCourseList(entityId, session);
        setCourseList(courses);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (entityId && session) {
      loadData();
    }
  }, [entityId, session, employeeId, permissions.isAdmissionAdmin]);

  // Apply template filters when template changes
  useEffect(() => {
    if (templates && templates.length > 0) {
      const template = templates.find(t => t.viewName === selectedTemplate) || templates[0];

      // If selected is default, update it to the first found template
      if (selectedTemplate === 'default' && template) {
        setSelectedTemplate(template.viewName);
      }

      if (template && template.filterValues) {
        template.filterValues.forEach((f: any) => {
          if (f.filter === 'startDate' && f.value === 'currentDate') {
            setStartDate(new Date().setHours(0, 0, 0, 0));
          }
          if (f.filter === 'endDate' && f.value === 'currentDate') {
            setEndDate(new Date().setHours(23, 59, 59, 999));
          }
          if (f.filter === 'status') {
            const statuses = f.value.split(',');
            setSelectedStatus(statuses);
          }
          if (f.filter === 'source') {
            setSelectedSource(f.value);
          }
        });
      }
    }
  }, [templates, selectedTemplate]);

  // Restore filter state from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('filterObjectData');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        if (filters.startDate) setStartDate(filters.startDate);
        if (filters.endDate) setEndDate(filters.endDate);
        if (filters.counselorId) setSelectedCounselor(filters.counselorId);
        if (filters.selectedStatus) setSelectedStatus(Array.isArray(filters.selectedStatus) ? filters.selectedStatus : [filters.selectedStatus]);
        if (filters.selectedSource) setSelectedSource(filters.selectedSource);
        if (filters.selectedCallStatus) setSelectedCallStatus(filters.selectedCallStatus);
        localStorage.removeItem('filterObjectData');
      } catch (error) {
        console.error('Error restoring filters:', error);
      }
    }
  }, []);

  // Sync local filter state whenever the filter panel is opened
  useEffect(() => {
    if (showFilter) {
      setLocalCounselor(selectedCounselor);
      setLocalStartDate(startDate);
      setLocalEndDate(endDate);
      setLocalSource(selectedSource);
      setLocalStatus(selectedStatus);
      setLocalCallStatus(selectedCallStatus);
      setLocalShowMemberDetails(showMemberDetails);
    }
  }, [showFilter]);

  // Handlers
  const handleSearch = () => {
    setPageNumber(1);
    refetch();
  };

  const handleApplyFilters = () => {
    setSelectedCounselor(localCounselor);
    setStartDate(localStartDate);
    setEndDate(localEndDate);
    setSelectedSource(localSource);
    setSelectedStatus(localStatus);
    setSelectedCallStatus(localCallStatus);
    setShowMemberDetails(localShowMemberDetails);
    setPageNumber(1);
    setShowFilter(false);
  };

  const handleRefresh = () => {
    setSelectedCounselor('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedSource('');
    setSelectedStatus(['pending']);
    setSelectedCallStatus('');
    setShowMemberDetails(false);
    setPageNumber(1);

    // Reset template to default or first available
    if (templates && templates.length > 0) {
      const defaultTemp = templates.find(t => t.viewName === 'default');
      setSelectedTemplate(defaultTemp ? defaultTemp.viewName : templates[0].viewName);
    } else {
      setSelectedTemplate('default');
    }
    // Also reset local filter state
    setLocalCounselor('');
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    setLocalSource('');
    setLocalStatus(['pending']);
    setLocalCallStatus('');
    setLocalShowMemberDetails(false);
  };

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
      onClick: () => { handleRefresh(); handleSearch(); },
      title: 'Refresh',
      className: 'text-primary hover:bg-primary/10 hover:text-primary',
      isVisible: true,
      iconClass: isLoading ? 'animate-spin' : '',
      variant: 'outline'
    }
  ];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete?')) {
      try {
        await admissionLeadLogsService.deleteAdmissionLeadLogs(id);
        refetch();
      } catch (error: any) {
        console.error('Delete failed', error);
        showToast('error', error?.response?.data?.message || 'Failed to delete lead');
      }
    }
  };

  const handleView = async (id: string) => {
    try {
      const lead = await admissionLeadLogsService.viewAdmissionLeadLogs(id);
      setSelectedLead(lead);
      setEditFormData({
        name: lead.name || '',
        dob: lead.dob || null,
        course: lead.course || '',
        stream: lead.stream || '',
        email: lead.email || ''
      });

      // Set streams for selected course
      const course = courseList.find(c => c.name === lead.course);
      if (course) setStreams(course.stream || []);

      setShowEditForm(true);
    } catch (error: any) {
      console.error('View failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to load lead details');
    }
  };

  const handleClickToCall = async (phone: string) => {
    try {
      await admissionLeadLogsService.clickToCall({
        entity: entityId,
        session: session,
        phone: phone,
        applicationNumber: phone,
        myOperatorId: myOperatorId
      });
      showToast('success', 'Call Initiated');
    } catch (error: any) {
      console.error('Call failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to initiate call');
    }
  };

  const handleCourseChange = (courseName: string) => {
    const course = courseList.find(c => c.name === courseName);
    if (course) {
      setStreams(course.stream || []);
      setEditFormData({ ...editFormData, course: courseName, stream: '' });
    }
  };

  const handleEdit = async () => {
    if (!selectedLead) return;

    // Validation
    if (!editFormData.name || !editFormData.course || !editFormData.stream) {
      showToast('warning', 'Please fill all required fields');
      return;
    }

    try {
      const updatedLead = {
        ...selectedLead,
        name: editFormData.name,
        dob: editFormData.dob,
        course: editFormData.course,
        stream: editFormData.stream,
        email: editFormData.email
      };

      await admissionLeadLogsService.editAdmissionLeadLogs(updatedLead);
      showToast('success', 'Lead updated successfully');
      setShowEditForm(false);
      setSelectedLead(null);
      refetch();
    } catch (error: any) {
      console.error('Edit failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to update lead');
    }
  };

  const handleCallNotPicked = async () => {
    if (!selectedLead) return;

    try {
      const updatedLead = {
        ...selectedLead,
        callDetails: {
          ...selectedLead.callDetails,
          callStatus: 'callNotPicked'
        }
      };

      await admissionLeadLogsService.editAdmissionLeadLogs(updatedLead);
      showToast('success', 'Call status updated');
      setShowEditForm(false);
      setSelectedLead(null);
      refetch();
    } catch (error: any) {
      console.error('Update failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to update call status');
    }
  };

  const handleReject = async (remark: string) => {
    if (!selectedLead) return;

    try {
      const updatedLead = {
        ...selectedLead,
        status: 'rejected',
        remark: selectedLead.remark ? `${selectedLead.remark} | ${remark}` : remark,
        updatedByUserName: userName,
        updatedByUserMobile: userMobile
      };

      await admissionLeadLogsService.editAdmissionLeadLogs(updatedLead);
      showToast('success', 'Lead rejected successfully');
      setShowRejectDialog(false);
      setShowEditForm(false);
      setSelectedLead(null);
      refetch();
    } catch (error: any) {
      console.error('Reject failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to reject lead');
    }
  };

  const handleConvertClick = async () => {
    if (!selectedLead) return;

    // Save current data first
    try {
      const updatedLead = {
        ...selectedLead,
        name: editFormData.name,
        dob: editFormData.dob,
        course: editFormData.course,
        stream: editFormData.stream,
        email: editFormData.email
      };

      await admissionLeadLogsService.editAdmissionLeadLogs(updatedLead);
      setConvertingLead(updatedLead);
      setShowTagDialog(true);
    } catch (error: any) {
      console.error('Save before convert failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to save lead before converting');
    }
  };

  const handleTagSelection = (tag: Tag) => {
    setSelectedTag(tag);
    setShowTagDialog(false);

    if (tag.label === 'positive') {
      setShowFollowUpDialog(true);
    } else if (tag.label === 'negative') {
      if (confirm('Are you sure you want to assign negative tag?')) {
        setShowNegativeDialog(true);
      }
    }
  };

  const handleFollowUpSubmit = async (followUpQuery: string, followUpDate: number) => {
    if (!convertingLead || !selectedTag) return;

    try {
      const formData = {
        id: convertingLead._id,
        isDuplicate: false,
        followUpQuery,
        followUpDate,
        tags: [selectedTag.tag]
      };

      await admissionLeadLogsService.convertAdmissionLeadLog(formData);
      showToast('success', 'Lead converted successfully');
      setShowFollowUpDialog(false);
      setShowEditForm(false);
      setConvertingLead(null);
      setSelectedTag(null);
      refetch();
    } catch (error: any) {
      if (error?.response?.data?.message === 'Application already exist with this number') {
        await checkDuplicates(convertingLead.phone);
      } else {
        console.error('Convert failed', error);
        showToast('error', error?.response?.data?.message || 'Failed to convert lead');
      }
    }
  };

  const handleNegativeRemarkSubmit = async (remark: string) => {
    if (!convertingLead || !selectedTag) return;

    try {
      const formData = {
        id: convertingLead._id,
        isDuplicate: false,
        remark,
        tags: [selectedTag.tag]
      };

      await admissionLeadLogsService.convertAdmissionLeadLog(formData);
      showToast('success', 'Lead converted successfully');
      setShowNegativeDialog(false);
      setShowEditForm(false);
      setConvertingLead(null);
      setSelectedTag(null);
      refetch();
    } catch (error: any) {
      if (error?.response?.data?.message === 'Application already exist with this number') {
        await checkDuplicates(convertingLead.phone);
      } else {
        console.error('Convert failed', error);
        showToast('error', error?.response?.data?.message || 'Failed to convert lead');
      }
    }
  };

  const checkDuplicates = async (phone: string) => {
    try {
      const formData = {
        entity: entityId,
        session: session,
        searchBy: 'phone',
        search: phone
      };

      const result = await admissionLeadLogsService.listAdmissionStudentDataMobile(formData);
      if (result.data && result.data.length > 0) {
        setDuplicateStudents(result.data);
        setShowDuplicateDialog(true);
      }
    } catch (error: any) {
      console.error('Duplicate check failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to check for duplicates');
    }
  };

  const handleMarkDuplicate = async () => {
    if (!convertingLead || !selectedTag) return;

    try {
      const formData = {
        id: convertingLead._id,
        isDuplicate: true,
        tags: selectedTag.label === 'positive' ? [selectedTag.tag] : undefined,
        remark: selectedTag.label === 'negative' ? convertingLead.officialRemark : undefined
      };

      await admissionLeadLogsService.convertAdmissionLeadLog(formData);
      showToast('success', 'Lead marked as duplicate');
      setShowDuplicateDialog(false);
      setShowEditForm(false);
      setConvertingLead(null);
      setSelectedTag(null);
      refetch();
    } catch (error: any) {
      console.error('Mark duplicate failed', error);
      showToast('error', error?.response?.data?.message || 'Failed to mark as duplicate');
    }
  };

  const handleNoDuplicate = () => {
    setShowDuplicateDialog(false);
    setShowEditForm(false);
    setConvertingLead(null);
    setSelectedTag(null);
  };

  const handleNavigateToDetails = (row: AdmissionLeadLog) => {
    if (!row.studentData) return;

    const studentId = row.studentData._id;
    if (!studentId) {
      showToast('error', 'Student record not found');
      return;
    }

    // Save filter state
    const filterState = {
      startDate,
      endDate,
      counselorId: selectedCounselor,
      selectedStatus,
      selectedSource,
      selectedCallStatus,
      source: row.source,
      pageFrom: 'admissionLeadLogs'
    };

    localStorage.setItem('filterObjectData', JSON.stringify(filterState));
    navigate(`/admission/student-data/${studentId}`, { state: { from: 'admissionLeadLogs' } });
  };

  // Dynamic Columns from Template
  const columns = useMemo<ColumnDef<AdmissionLeadLog>[]>(() => {
    let tableHeads: TableHead[] = [];

    const currentTemplate = templates?.find((t: any) => t.viewName === selectedTemplate);
    if (currentTemplate) {
      tableHeads = currentTemplate.tableHeads;
    } else if (defaultTemplate) {
      tableHeads = defaultTemplate.tableHeads;
    } else {
      tableHeads = DEFAULT_ADMISSION_LEADS_REPORT_HEADS;
    }

    const generatedColumns: ColumnDef<AdmissionLeadLog>[] = [
      {
        accessorKey: 'position',
        header: 'S.No',
        cell: info => ((pageNumber - 1) * pageSize) + info.row.index + 1
      }
    ];

    tableHeads.sort((a, b) => a.seqNo - b.seqNo).forEach(head => {
      // Skip batch if showBatch is false
      if (head.value === 'batch' && !showBatch) return;

      // Use display name if available
      let headerName = head.name;
      if (head.value === 'course') headerName = displayNames.course;
      if (head.value === 'stream') headerName = displayNames.stream;
      if (head.value === 'batch') headerName = displayNames.batch;
      if (head.value === 'subjectCombination') headerName = displayNames.subjectCombination;

      if (head.value === 'name') {
        generatedColumns.push({
          accessorKey: 'name',
          header: headerName,
          cell: info => (
            <div className="flex flex-col cursor-pointer" onClick={() => handleNavigateToDetails(info.row.original)}>
              <span className="font-medium text-primary">{info.getValue() as string || '-'}</span>
              <span className="text-xs text-gray-500">
                {info.row.original.dob ? new Date(info.row.original.dob).toLocaleDateString() : '-'}
              </span>
            </div>
          )
        });
      } else if (head.value === 'course' || head.value === 'callerInfo' || head.value === 'applicationNumber') {
        generatedColumns.push({
          accessorKey: head.value as any,
          header: headerName,
          cell: info => {
            const value = info.getValue() as string;
            if (!value) return '-';
            return (
              <span
                className="text-primary cursor-pointer font-medium"
                onClick={() => handleNavigateToDetails(info.row.original)}
              >
                {value}
              </span>
            );
          }
        });
      } else if (head.value === 'phone') {
        generatedColumns.push({
          accessorKey: 'phone',
          header: headerName,
          cell: info => (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${permissions.peerToPeerCallForAdmission ? 'text-primary cursor-pointer' : 'text-gray-800'}`}
                  onClick={permissions.peerToPeerCallForAdmission ? () => handleClickToCall(info.getValue() as string) : undefined}
                >
                  {formatPhone(info.getValue() as string, !permissions.viewAdmissionPhoneNumber)}
                </span>
                {permissions.peerToPeerCallForAdmission && (
                  <Phone
                    size={14}
                    className="cursor-pointer text-primary"
                    onClick={() => handleClickToCall(info.getValue() as string)}
                  />
                )}
              </div>
              <span className="text-xs text-gray-500">{info.row.original.email || ''}</span>
            </div>
          )
        });
      } else if (head.value === 'status') {
        generatedColumns.push({
          accessorKey: 'status',
          header: headerName,
          cell: info => {
            const status = (info.getValue() as string).toLowerCase();
            const row = info.row.original;
            let displayStatus = status;

            if (row.source === 'visit') {
              if (status === 'duplicate') displayStatus = 're visit';
              else if (status === 'converted') displayStatus = 'new visit';
            }

            // Map status to Badge variant
            const variantMap: Record<string, 'warning' | 'success' | 'error' | 'info' | 'default'> = {
              pending: 'warning',
              duplicate: 'default',
              converted: 'success',
              rejected: 'error'
            };
            const variant = variantMap[status] ?? 'default';

            return <Badge variant={variant}>{displayStatus}</Badge>;
          }
        });
      } else if (head.value === 'callTimestamp') {
        generatedColumns.push({
          accessorKey: 'callDetails.callTimestamp',
          header: headerName,
          cell: info => {
            const timestamp = info.row.original.callDetails?.callTimestamp;
            if (!timestamp) return '-';
            const date = new Date(timestamp);
            const formattedDate = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            return (
              <div className="flex flex-col">
                <span>{formattedDate}</span>
                <span className="text-xs text-gray-500">{formattedTime}</span>
              </div>
            );
          }
        });
      } else if (head.value === 'callStatus') {
        generatedColumns.push({
          accessorKey: 'callDetails.callStatus',
          header: headerName,
          cell: info => {
            const callStatus = info.row.original.callDetails?.callStatus;

            if (!callStatus) return '-';

            let icon = null;
            const statusLower = callStatus.toLowerCase();

            if (statusLower === 'missed' || statusLower === 'noreceiver') {
              icon = <PhoneMissed size={14} className="text-red-600" />;
            } else if (statusLower === 'received') {
              icon = <PhoneIncoming size={14} className="text-green-600" />;
            } else {
              icon = <Phone size={14} className="text-primary" />;
            }

            return (
              <div className="flex items-center gap-1">
                {icon}
                <span className="uppercase text-xs">{callStatus}</span>
              </div>
            );
          }
        });

      } else if (head.value === 'date') {
        generatedColumns.push({
          accessorKey: 'date',
          header: headerName,
          cell: info => {
            const date = new Date(info.getValue() as number);
            return date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
          }
        });
      } else if (head.value === 'updatedBy') {
        generatedColumns.push({
          accessorKey: 'updatedByUserName',
          header: headerName,
          cell: info => {
            const row = info.row.original as any;
            const updatedDate = row.updatedAt ? new Date(row.updatedAt) : null;
            const formattedDate = updatedDate ? updatedDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : '';
            const formattedTime = updatedDate ? updatedDate.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }) : '';
            return (
              <div className="flex flex-col">
                <span>{row.updatedByUserName || '-'}</span>
                <span className="text-xs text-gray-500">
                  {formattedDate && `${formattedDate} ${formattedTime}`}
                </span>
              </div>
            );
          }
        });
      } else {
        generatedColumns.push({
          accessorKey: head.value as any,
          header: headerName,
          cell: info => info.getValue() || '-'
        });
      }
    });

    // Actions column
    generatedColumns.push({
      id: 'actions',
      header: 'Action',
      cell: info => {
        const row = info.row.original;
        const items = [
          ...(permissions.viewAdmissionLeadLogs ? [{
            key: 'view',
            label: (
              <span className="flex items-center gap-2">
                <Eye size={14} className="text-primary" /> View
              </span>
            ),
            onClick: () => handleView(row._id)
          }] : []),
          ...(permissions.deleteAdmissionLeadLogs ? [{
            key: 'delete',
            label: (
              <span className="flex items-center gap-2 text-red-500">
                <Trash2 size={14} /> Delete
              </span>
            ),
            onClick: () => handleDelete(row._id)
          }] : [])
        ];

        if (items.length === 0) return null;

        return (
          <DropdownMenu
            trigger={
              <button className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <MoreVertical size={16} />
              </button>
            }
            items={items}
            placement="bottom-end"
            usePortal
          />
        );
      }
    });

    return generatedColumns;
  }, [templates, selectedTemplate, defaultTemplate, pageNumber, pageSize, permissions]);

  return (
    <div className="w-full max-w-full font-sans">
      <PageHeader
        title="Admission Lead Logs"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admission Reports', href: '/admission' },
          { label: 'Admission Lead Logs' }
        ]}
        actionButtons={actionButtons}
      />

      <PageToolbar
        tabs={templates && templates.length > 0 ? templates.map((t: any) => ({ label: t.viewName.toUpperCase(), value: t.viewName })) : []}
        activeTab={selectedTemplate}
        onTabChange={(val) => { setSelectedTemplate(val); setEditDrawerOpen(false); }}
        actions={actionButtons}
        extraContent={
          (() => {
            const activeTemplate = templates?.find((t: any) => t.viewName === selectedTemplate);
            const canEdit = permissionsArray.includes('editEntityPreferences');
            if (!activeTemplate?._id || !canEdit) return undefined;
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
          })()
        }
      />

      {/* Collapsible Filter Card */}
      {showFilter && (
        <TemplateFilter
          isAdmissionAdmin={permissions.isAdmissionAdmin}
          isLead={isLead}
          userName={userName}
          isLoading={isLoading}
          localCounselor={localCounselor}
          localStartDate={localStartDate}
          localEndDate={localEndDate}
          localSource={localSource}
          localStatus={localStatus}
          localCallStatus={localCallStatus}
          localShowMemberDetails={localShowMemberDetails}
          setLocalCounselor={setLocalCounselor}
          setLocalStartDate={setLocalStartDate}
          setLocalEndDate={setLocalEndDate}
          setLocalSource={setLocalSource}
          setLocalStatus={setLocalStatus}
          setLocalCallStatus={setLocalCallStatus}
          setLocalShowMemberDetails={setLocalShowMemberDetails}
          counselorOptions={counselorOptions}
          onApply={handleApplyFilters}
        />
      )}

      {/* Edit Form */}
      {showEditForm && selectedLead && (
        <EditForm
          lead={selectedLead}
          formData={editFormData}
          courseList={courseList}
          streams={streams}
          permissions={permissions}
          displayNames={displayNames}
          onFormDataChange={setEditFormData}
          onCourseChange={handleCourseChange}
          onClose={() => setShowEditForm(false)}
          onEdit={handleEdit}
          onCallNotPicked={handleCallNotPicked}
          onReject={() => setShowRejectDialog(true)}
          onConvert={handleConvertClick}
          onClickToCall={handleClickToCall}
        />
      )}

      {/* Table */}
      {reportData && reportData.data && reportData.data.length > 0 && (
          <div className="w-full max-w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={processedData || []}
              isLoading={isLoading}
              showSearch={true}
              showPagination={true}
            />
          </div>
      )}

      {!isLoading && (!reportData || !reportData.data || reportData.data.length === 0) && (
        <EmptyState message="No Records Found" />
      )}

      {/* Dialogs */}
      <RejectRemarkDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onSubmit={handleReject}
      />

      <TagSelectionDialog
        isOpen={showTagDialog}
        onClose={() => setShowTagDialog(false)}
        onSubmit={handleTagSelection}
        tags={tags}
      />

      <FollowUpDialog
        isOpen={showFollowUpDialog}
        onClose={() => setShowFollowUpDialog(false)}
        onSubmit={handleFollowUpSubmit}
      />

      <NegativeRemarkDialog
        isOpen={showNegativeDialog}
        onClose={() => setShowNegativeDialog(false)}
        onSubmit={handleNegativeRemarkSubmit}
      />

      <DuplicateNumbersDialog
        isOpen={showDuplicateDialog}
        onClose={handleNoDuplicate}
        onMarkDuplicate={handleMarkDuplicate}
        onNoDuplicate={handleNoDuplicate}
        duplicateStudents={duplicateStudents}
        displayNames={displayNames}
      />
      {/* Excel Template Edit Drawer */}
      {editDrawerOpen && (() => {
        const activeTemplate = templates?.find((t: any) => t.viewName === selectedTemplate);
        return activeTemplate?._id ? (
          <ExcelTemplateEditDrawer
            open={editDrawerOpen}
            onClose={() => setEditDrawerOpen(false)}
            template={activeTemplate}
            reportDisplayName="Admission Lead Logs"
            availableHeads={ADMISSION_LEADS_AVAILABLE_HEADS}
            availableFilters={ADMISSION_LEADS_AVAILABLE_FILTERS}
            sortByOptions={ADMISSION_LEADS_SORT_BY_OPTIONS}
            defaultHeads={DEFAULT_ADMISSION_LEADS_REPORT_HEADS}
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

export default AdmissionLeadLogs;
