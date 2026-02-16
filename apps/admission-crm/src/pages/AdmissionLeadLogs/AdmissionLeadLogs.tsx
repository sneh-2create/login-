import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmissionLeadLog, useExcelTemplates, useDefaultExcelTemplates } from '@od-erp/query';
import { Button, Breadcrumb, Card, DataTable, Dropdown, DatePicker, Toggle, HorizontalTabs, Tooltip } from '@od-erp/ui';
import { AdmissionLeadLog, TableHead } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { Phone, Eye, Trash2, SlidersHorizontal, RefreshCw, X, PhoneIncoming, PhoneMissed } from 'lucide-react';

import { admissionLeadLogsService, admissionService } from '@od-erp/api-client';
import { useAppSelector } from '@od-erp/store';
import { formatPhone } from '../../utils/phoneUtils';
import { RejectRemarkDialog } from './components/RejectRemarkDialog';
import { TagSelectionDialog } from './components/TagSelectionDialog';
import { FollowUpDialog } from './components/FollowUpDialog';
import { NegativeRemarkDialog } from './components/NegativeRemarkDialog';
import { DuplicateNumbersDialog } from './components/DuplicateNumbersDialog';

interface Tag {
  _id: string;
  tag: string;
  label: string;
  colour: string;
}

const AdmissionLeadLogs = () => {
  const navigate = useNavigate();

  // State for Filters
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];
  const [selectedCounselor, setSelectedCounselor] = useState<string>('');
  const [startDate, setStartDate] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<number | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['pending']);
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('');
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

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

  // Pagination calculations
  const totalCount = reportData?.count || 0;
  const startNumber = ((pageNumber - 1) * pageSize) + 1;
  const lastNumber = Math.min(pageNumber * pageSize, totalCount);
  const disableNext = processedData.length < pageSize;

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

  // Status options based on source
  const statusOptions = useMemo(() => {
    const baseOptions = [{ label: 'All Status', value: '' }];
    if (selectedSource === 'visit') {
      return [
        ...baseOptions,
        { label: 'Pending', value: 'pending' },
        { label: 'Re Visit', value: 'duplicate' },
        { label: 'New Visit', value: 'converted' }
      ];
    }
    return [
      ...baseOptions,
      { label: 'Pending', value: 'pending' },
      { label: 'Duplicate', value: 'duplicate' },
      { label: 'Converted', value: 'converted' },
      { label: 'Rejected', value: 'rejected' }
    ];
  }, [selectedSource]);

  const sourceOptions = [
    { label: 'All Sources', value: '' },
    { label: 'Visit', value: 'visit' },
    { label: 'MyOperator', value: 'myOperator' }
  ];

  const callStatusOptions = [
    { label: 'All Call Status', value: '' },
    { label: 'Received', value: 'received' },
    { label: 'Missed', value: 'missed' },
    { label: 'Transferred', value: 'transferred' },
    { label: 'No Receiver', value: 'noReceiver' },
    { label: 'Call Not Picked', value: 'callNotPicked' }
  ];

  // Handlers
  const handleSearch = () => {
    setPageNumber(1);
    refetch();
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
  };



  const handlePageSizeChange = (newSize: string | number | (string | number)[]) => {
    const size = Array.isArray(newSize) ? newSize[0] : newSize;
    setPageSize(Number(size));
    setPageNumber(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete?')) {
      try {
        await admissionLeadLogsService.deleteAdmissionLeadLogs(id);
        refetch();
      } catch (error) {
        console.error('Delete failed', error);
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
    } catch (error) {
      console.error('View failed', error);
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
      alert('Call Initiated');
    } catch (error) {
      console.error('Call failed', error);
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
      alert('Please fill all required fields');
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
      alert('Lead updated successfully');
      setShowEditForm(false);
      setSelectedLead(null);
      refetch();
    } catch (error) {
      console.error('Edit failed', error);
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
      alert('Call status updated');
      setShowEditForm(false);
      setSelectedLead(null);
      refetch();
    } catch (error) {
      console.error('Update failed', error);
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
      alert('Lead rejected successfully');
      setShowRejectDialog(false);
      setShowEditForm(false);
      setSelectedLead(null);
      refetch();
    } catch (error) {
      console.error('Reject failed', error);
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
    } catch (error) {
      console.error('Save before convert failed', error);
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
      alert('Lead converted successfully');
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
      alert('Lead converted successfully');
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
    } catch (error) {
      console.error('Duplicate check failed', error);
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
      alert('Lead marked as duplicate');
      setShowDuplicateDialog(false);
      setShowEditForm(false);
      setConvertingLead(null);
      setSelectedTag(null);
      refetch();
    } catch (error) {
      console.error('Mark duplicate failed', error);
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
    navigate(`/admission/studentDataDetails/${row.studentData}?tab=timeline`);
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
      // Fallback columns
      tableHeads = [
        { value: 'name', name: 'Name', seqNo: 1 },
        { value: 'course', name: displayNames.course, seqNo: 2 },
        { value: 'stream', name: displayNames.stream, seqNo: 3 },
        { value: 'phone', name: 'Phone', seqNo: 4 },
        { value: 'status', name: 'Status', seqNo: 5 },
        { value: 'source', name: 'Source', seqNo: 6 },
        { value: 'date', name: 'Date', seqNo: 7 },
        { value: 'counselorName', name: 'Counselor', seqNo: 8 }
      ];
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
                  className="text-primary cursor-pointer font-medium"
                  onClick={() => handleView(info.row.original._id)}
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
            let displayStatus = status.toUpperCase();

            if (row.source === 'visit') {
              if (status === 'duplicate') displayStatus = 'RE VISIT';
              else if (status === 'converted') displayStatus = 'NEW VISIT';
            }

            let colorClass = 'bg-gray-100 text-gray-800';
            if (status === 'pending') colorClass = 'bg-red-100 text-red-800';
            else if (status === 'duplicate') colorClass = 'bg-orange-100 text-orange-800';
            else if (status === 'converted') colorClass = 'bg-green-100 text-green-800';
            else if (status === 'rejected') colorClass = 'bg-primary text-primary';

            return (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {displayStatus}
              </span>
            );
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
      cell: info => (
        <div className="flex gap-2">
          {permissions.viewAdmissionLeadLogs && (
            <Button variant="ghost" size="sm" onClick={() => handleView(info.row.original._id)}>
              <Eye size={16} className="text-primary" />
            </Button>
          )}
          {permissions.deleteAdmissionLeadLogs && (
            <Button variant="ghost" size="sm" onClick={() => handleDelete(info.row.original._id)}>
              <Trash2 size={16} className="text-red-500" />
            </Button>
          )}
        </div>
      )
    });

    return generatedColumns;
  }, [templates, selectedTemplate, defaultTemplate, pageNumber, pageSize, permissions]);

  return (
    <div className="w-full max-w-full font-sans pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admission Lead Logs</h1>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Admission', href: '/admission' },
              { label: 'Admission Lead Logs' }
            ]}
          />
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
              onClick={() => { handleRefresh(); handleSearch(); }}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Collapsible Filter Card */}
      {showFilter && (
        <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Counselor Dropdown - For Admin or Team Lead */}
            {(permissions.isAdmissionAdmin || isLead) && (
              <div className="w-full">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Counselor</label>
                <Dropdown
                  value={selectedCounselor}
                  onChange={(val) => setSelectedCounselor(val as string)}
                  options={counselorOptions}
                  placeholder="Select Counselor"
                  className="w-full"
                />
                {/* Show Members Toggle - Only for Team Lead */}
                {isLead && (
                  <div className="mt-2">
                    <Toggle
                      label="Show Member Details"
                      checked={showMemberDetails}
                      onChange={(e) => setShowMemberDetails(e.target.checked)}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="w-full">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
              <DatePicker
                value={startDate ? new Date(startDate) : null}
                onChange={(date) => setStartDate(date ? date.getTime() : undefined)}
                maxDate={endDate ? new Date(endDate) : undefined}
                className="w-full"
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
              <DatePicker
                value={endDate ? new Date(endDate) : null}
                onChange={(date) => setEndDate(date ? date.getTime() : undefined)}
                minDate={startDate ? new Date(startDate) : undefined}
                className="w-full"
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Source</label>
              <Dropdown
                value={selectedSource}
                onChange={(val) => setSelectedSource(val as string)}
                options={sourceOptions}
                placeholder="Select Source"
                className="w-full"
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Status (Multi-select)</label>
              <Dropdown
                value={selectedStatus}
                onChange={(val) => {
                  if (Array.isArray(val)) {
                    setSelectedStatus(val as string[]);
                  } else if (val) {
                    setSelectedStatus([val as string]);
                  } else {
                    setSelectedStatus([]);
                  }
                }}
                options={statusOptions}
                placeholder="Select Status"
                className="w-full"
                multiple
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Call Status</label>
              <Dropdown
                value={selectedCallStatus}
                onChange={(val) => setSelectedCallStatus(val as string)}
                options={callStatusOptions}
                placeholder="Select Call Status"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => { handleSearch(); setShowFilter(false); }} isLoading={isLoading}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && selectedLead && (
        <Card className="mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Lead Details</h2>
            <button onClick={() => setShowEditForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
              <p className="text-sm">{new Date(selectedLead.date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
              <div className="flex items-center gap-2">
                <p className="text-sm">{formatPhone(selectedLead.phone, !permissions.viewAdmissionPhoneNumber)}</p>
                {permissions.peerToPeerCallForAdmission && (
                  <Phone
                    size={14}
                    className="cursor-pointer text-primary"
                    onClick={() => handleClickToCall(selectedLead.phone)}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Source</label>
              <p className="text-sm">{selectedLead.source}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Counselor</label>
              <p className="text-sm">{selectedLead.counselorName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">DOB</label>
              <DatePicker
                value={editFormData.dob ? new Date(editFormData.dob) : null}
                onChange={(date) => setEditFormData({ ...editFormData, dob: date?.getTime() })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{displayNames.course} *</label>
              <Dropdown
                value={editFormData.course}
                onChange={(val) => handleCourseChange(val as string)}
                options={courseList.map(c => ({ label: c.name, value: c.name }))}
                placeholder={`Select ${displayNames.course}`}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{displayNames.stream} *</label>
              <Dropdown
                value={editFormData.stream}
                onChange={(val) => setEditFormData({ ...editFormData, stream: val as string })}
                options={streams.map(s => ({ label: s, value: s }))}
                placeholder={`Select ${displayNames.stream}`}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {selectedLead.callDetails && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Call Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="text-xs text-gray-500">Call Timestamp</label>
                  <p>{new Date(selectedLead.callDetails.callTimestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Call Duration</label>
                  <p>{selectedLead.callDetails.callDuration}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Call Status</label>
                  <p className="uppercase">{selectedLead.callDetails.callStatus}</p>
                </div>
                {selectedLead.callDetails.callRecordingLink && (
                  <div>
                    <label className="text-xs text-gray-500">Recording</label>
                    <a
                      href={selectedLead.callDetails.callRecordingLink.replace('http://', 'https://')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedLead.tags && selectedLead.tags.length > 0 && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {selectedLead.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedLead.remark && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Remark</label>
              <p className="text-sm">{selectedLead.remark}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {permissions.convertAdmissionLeadLogs && selectedLead.status !== 'rejected' && selectedLead.status !== 'converted' && (
              <Button variant="outline" className="border-primary text-primary" onClick={handleCallNotPicked}>
                Call Not Picked
              </Button>
            )}
            {permissions.convertAdmissionLeadLogs && selectedLead.status !== 'rejected' && (
              <Button variant="outline" className="border-red-500 text-red-500" onClick={() => setShowRejectDialog(true)}>
                Reject
              </Button>
            )}
            {permissions.convertAdmissionLeadLogs && selectedLead.status !== 'converted' && (
              <Button variant="outline" className="border-green-500 text-green-500" onClick={handleConvertClick}>
                Convert
              </Button>
            )}
            {permissions.editAdmissionLeadLogs && (
              <Button onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </Card>
      )}

      {templates && templates.length > 0 && (
        <HorizontalTabs
          tabs={templates.map((t: any) => ({ label: t.viewName.toUpperCase(), value: t.viewName }))}
          activeTab={selectedTemplate}
          onTabChange={setSelectedTemplate}
          className="px-4 mb-3"
        />
      )}

      {/* Table */}
      {reportData && reportData.data && reportData.data.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Report Data</h3>
          </div>

          <div className="w-full max-w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={processedData || []}
              isLoading={isLoading}
              showSearch={false}
              showPagination={false}
            />
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {processedData.length > 0 ? startNumber : 0}-{lastNumber} of {totalCount} records
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Page size:</span>
                <Dropdown
                  value={pageSize.toString()}
                  onChange={handlePageSizeChange}
                  options={pageSizeOptions.map(size => ({ label: size.toString(), value: size.toString() }))}
                  className="w-20 h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {pageNumber} {totalCount ? `of ${Math.ceil(totalCount / pageSize)}` : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(p => p + 1)}
                disabled={isLoading || disableNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (!reportData || !reportData.data || reportData.data.length === 0) && (
        <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <span className="text-gray-400 text-lg font-medium">No Records Found</span>
        </div>
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
    </div>
  );
};

export default AdmissionLeadLogs;
