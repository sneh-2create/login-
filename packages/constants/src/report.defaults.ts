// Default table heads for various reports
// Used as fallback when no custom templates or API default templates are available

/**
 * Default table heads for Admission Transaction Report
 * Source: Angular data.json
 */
export const DEFAULT_ADMISSION_TRANSACTION_REPORT_HEADS = [
    { name: 'Receipt No.', value: 'receiptId', seqNo: 1 },
    { name: 'Date', value: 'date', seqNo: 2 },
    { name: 'Application Number', value: 'applicationNumber', seqNo: 3 },
    { name: 'Name', value: 'studentName', seqNo: 4 },
    { name: 'Class', value: 'applicationDetailsCourse', seqNo: 5 },
    { name: 'Pay Mode', value: 'paymentDetailsPaymentMode', seqNo: 6 },
    { name: 'Remarks', value: 'remark', seqNo: 7 },
    { name: 'Bank Name', value: 'paymentDetailsBankName', seqNo: 8 },
    { name: 'Cheque Date', value: 'paymentDetailsDate', seqNo: 9 },
    { name: 'Ref/ Chqno', value: 'paymentDetailsRefId', seqNo: 10 },
    { name: 'Admission Heads', value: 'admissionHeads', seqNo: 11 }
];

/**
 * Default table heads for Daily Admission Collection Report
 * Source: Angular data.json (defaultDailyAdmissionCollectionReportHeads)
 */
export const DEFAULT_DAILY_ADMISSION_COLLECTION_REPORT_HEADS = [
    { name: 'Receipt No.', value: 'receiptId', seqNo: 1 },
    { name: 'Receipt Date', value: 'date', seqNo: 2 },
    { name: 'RegNo', value: 'studentRegNo', seqNo: 3 },
    { name: 'Name', value: 'studentName', seqNo: 4 },
    { name: 'Class', value: 'applicationDetailsCourse', seqNo: 5 },
    { name: 'Pay Mode', value: 'paymentDetailsPaymentMode', seqNo: 6 },
    { name: 'Remarks', value: 'remark', seqNo: 7 },
    { name: 'Bank Name', value: 'paymentDetailsBankName', seqNo: 8 },
    { name: 'Cheque Date', value: 'paymentDetailsDate', seqNo: 9 },
    { name: 'Installments', value: 'installments', seqNo: 10 },
    { name: 'Ref/ Chqno', value: 'paymentDetailsRefId', seqNo: 11 },
    { name: 'User Name', value: 'userName', seqNo: 12 },
    { name: 'Roll No', value: 'rollNo', seqNo: 13 }
];

/**
 * Default table heads for Admission Application Report (Student Data)
 * Source: Angular data.json - defaultAdmissionApplicationReportHeads
 * Used as fallback when no custom templates are available from API
 */
export const DEFAULT_ADMISSION_APPLICATION_REPORT_HEADS = [
    { name: 'Current Stage', value: 'currentStage', seqNo: 0 }, // Added - critical field
    { name: 'Student Name', value: 'name', seqNo: 1 },
    { name: 'Date of Birth', value: 'dob', seqNo: 2 },
    { name: 'Course', value: 'course', seqNo: 3 },
    { name: 'Stream', value: 'stream', seqNo: 4 },
    { name: 'Gender', value: 'gender', seqNo: 5 },
    { name: 'Application Form No', value: 'applicationNumber', seqNo: 6 },
    { name: 'Category', value: 'category', seqNo: 7 },
    { name: 'Phone', value: 'phone', seqNo: 8 },
    { name: 'Mother Name', value: 'motherName', seqNo: 10 },
    { name: 'Admission Date', value: 'doa', seqNo: 11 },
    { name: 'Application Date', value: 'date', seqNo: 12 },
    { name: 'Receipt Id', value: 'receiptId', seqNo: 13 }
];

/**
 * Default table heads for Admission Lead Logs Report
 * Source: Angular data.json (defaultAdmissionLeadsReportHeads)
 */
export const DEFAULT_ADMISSION_LEADS_REPORT_HEADS = [
    { name: 'CallerInfo', value: 'name', seqNo: 1 },
    { name: 'Course', value: 'course', seqNo: 2 },
    { name: 'Stream', value: 'stream', seqNo: 3 },
    { name: 'Phone', value: 'phone', seqNo: 4 },
    { name: 'Status', value: 'status', seqNo: 5 },
    { name: 'Source', value: 'source', seqNo: 6 },
    { name: 'Call Date', value: 'callTimestamp', seqNo: 7 },
    { name: 'Call Status', value: 'callStatus', seqNo: 8 },
    { name: 'Counselor Name', value: 'counselorName', seqNo: 9 },
    { name: 'Updated By', value: 'updatedBy', seqNo: 10 }
];

/**
 * All selectable column fields for Daily Admission Collection Report edit dialog.
 * Source: Angular data.json "dailyAdmissionCollectionReport"
 */
export const DAILY_ADMISSION_COLLECTION_AVAILABLE_HEADS = [
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Student Name', value: 'studentName' },
    { name: 'Session', value: 'session' },
    { name: 'Class', value: 'applicationDetailsCourse' },
    { name: 'Stream', value: 'applicationDetailsStream' },
    { name: 'Rec No', value: 'receiptId' },
    { name: 'Receipt Date', value: 'date' },
    { name: 'Batch', value: 'batch' },
    { name: 'Father Name', value: 'fatherName' },
    { name: 'Mobile No.', value: 'phone' },
    { name: 'Pay Mode', value: 'paymentDetailsPaymentMode' },
    { name: 'Admission Heads', value: 'admissionHeads' },
    { name: 'Remarks', value: 'remark' },
    { name: 'Ref / Chq No', value: 'paymentDetailsRefId' },
    { name: 'Cheque Date', value: 'paymentDetailsDate' },
    { name: 'Bank Name', value: 'paymentDetailsBankName' },
    { name: 'Total Payable Amount', value: 'totalPaybleAmount' },
    { name: 'Fine Remark', value: 'fineRemark' },
    { name: 'User Name', value: 'userName' },
    { name: 'Cancellation Remark', value: 'cancellationRemark' },
    { name: 'Cancelled By User Name', value: 'cancelledByUserName' },
    { name: 'Cancelled By User Mobile', value: 'cancelledByUserMobile' },
    { name: 'Family Id', value: 'familyId' },
];

/**
 * Available filter keys for the Daily Admission Collection Report edit dialog.
 * Source: Angular data.json "dailyAdmissionCollectionFilters"
 */
export const DAILY_ADMISSION_COLLECTION_AVAILABLE_FILTERS = [
    { name: 'Start Date', value: 'startDate' },
    { name: 'End Date', value: 'endDate' },
    { name: 'Status', value: 'status' },
    { name: 'Courses', value: 'course' },
    { name: 'Payment Mode', value: 'paymentMode' },
];

/**
 * Sort-by options for the Daily Admission Collection Report edit dialog.
 * Source: Angular data.json "dailyAdmissionCollectionSortBy"
 */
export const DAILY_ADMISSION_COLLECTION_SORT_BY_OPTIONS = [
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Student Name', value: 'studentName' },
    { name: 'Course', value: 'course' },
    { name: 'Receipt No', value: 'receiptId' },
    { name: 'Admission Heads', value: 'admissionHeads' },
    { name: 'Receipt Date', value: 'date' },
    { name: 'Pay Mode', value: 'paymentDetailsPaymentMode' },
    { name: 'User Name', value: 'userName' },
];

/**
 * Date preset options for startDate / endDate filter defaults.
 */
export const EXCEL_FILTER_DATE_PRESETS = [
    { name: 'Current Date', value: 'currentDate' },
    { name: 'Last Week', value: 'lastWeek' },
    { name: 'Last Month', value: 'lastMonth' },
    { name: 'This Year', value: 'thisYear' },
];

// ─── Admission Transaction Report ────────────────────────────────────────────

export const ADMISSION_TRANSACTION_AVAILABLE_HEADS = [
    { name: 'Receipt No.', value: 'receiptId' },
    { name: 'Date', value: 'date' },
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Student Name', value: 'studentName' },
    { name: 'Class', value: 'applicationDetailsCourse' },
    { name: 'Stream', value: 'applicationDetailsStream' },
    { name: 'Batch', value: 'batch' },
    { name: 'Father Name', value: 'fatherName' },
    { name: 'Mobile No.', value: 'phone' },
    { name: 'Pay Mode', value: 'paymentDetailsPaymentMode' },
    { name: 'Ref / Chq No', value: 'paymentDetailsRefId' },
    { name: 'Cheque Date', value: 'paymentDetailsDate' },
    { name: 'Bank Name', value: 'paymentDetailsBankName' },
    { name: 'Remarks', value: 'remark' },
    { name: 'Total Paid Amount', value: 'totalPaidAmount' },
    { name: 'Admission Heads', value: 'admissionHeads' },
    { name: 'Status', value: 'status' },
    { name: 'User Name', value: 'userName' },
];

export const ADMISSION_TRANSACTION_AVAILABLE_FILTERS = [
    { name: 'Start Date', value: 'startDate' },
    { name: 'End Date', value: 'endDate' },
    { name: 'Status', value: 'status' },
    { name: 'Payment Mode', value: 'paymentMode' },
];

export const ADMISSION_TRANSACTION_SORT_BY_OPTIONS = [
    { name: 'Receipt No.', value: 'receiptId' },
    { name: 'Date', value: 'date' },
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Student Name', value: 'studentName' },
    { name: 'Pay Mode', value: 'paymentDetailsPaymentMode' },
    { name: 'Total Paid Amount', value: 'totalPaidAmount' },
];

// ─── Admission Lead Logs Report ───────────────────────────────────────────────

export const ADMISSION_LEADS_AVAILABLE_HEADS = [
    { name: 'Name', value: 'name' },
    { name: 'Course', value: 'course' },
    { name: 'Stream', value: 'stream' },
    { name: 'Phone', value: 'phone' },
    { name: 'Status', value: 'status' },
    { name: 'Source', value: 'source' },
    { name: 'Call Date', value: 'callTimestamp' },
    { name: 'Call Status', value: 'callStatus' },
    { name: 'Counselor Name', value: 'counselorName' },
    { name: 'Updated By', value: 'updatedBy' },
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Date', value: 'date' },
    { name: 'Caller Info', value: 'callerInfo' },
    { name: 'Email', value: 'email' },
    { name: 'Remark', value: 'remark' },
];

export const ADMISSION_LEADS_AVAILABLE_FILTERS = [
    { name: 'Start Date', value: 'startDate' },
    { name: 'End Date', value: 'endDate' },
    { name: 'Status', value: 'status' },
    { name: 'Source', value: 'source' },
];

export const ADMISSION_LEADS_SORT_BY_OPTIONS = [
    { name: 'Name', value: 'name' },
    { name: 'Course', value: 'course' },
    { name: 'Status', value: 'status' },
    { name: 'Call Date', value: 'callTimestamp' },
    { name: 'Date', value: 'date' },
];

// ─── Admission Student Data (Application) Report ──────────────────────────────

export const ADMISSION_APPLICATION_AVAILABLE_HEADS = [
    { name: 'Student Name', value: 'name' },
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Date of Birth', value: 'dob' },
    { name: 'Course', value: 'course' },
    { name: 'Stream', value: 'stream' },
    { name: 'Batch', value: 'batch' },
    { name: 'Gender', value: 'gender' },
    { name: 'Category', value: 'category' },
    { name: 'Phone', value: 'phone' },
    { name: 'Email', value: 'email' },
    { name: 'Father Name', value: 'fatherName' },
    { name: 'Mother Name', value: 'motherName' },
    { name: 'Admission Date', value: 'doa' },
    { name: 'Application Date', value: 'date' },
    { name: 'Receipt Id', value: 'receiptId' },
    { name: 'Current Stage', value: 'currentStage' },
    { name: 'Source', value: 'source' },
    { name: 'Tags', value: 'tag' },
    { name: 'Counselor Name', value: 'counselorName' },
    { name: 'Reg No', value: 'regNo' },
];

export const ADMISSION_APPLICATION_AVAILABLE_FILTERS = [
    { name: 'Start Date', value: 'startDate' },
    { name: 'End Date', value: 'endDate' },
    { name: 'Stage', value: 'stage' },
    { name: 'Source', value: 'source' },
];

export const ADMISSION_APPLICATION_SORT_BY_OPTIONS = [
    { name: 'Student Name', value: 'name' },
    { name: 'Application Number', value: 'applicationNumber' },
    { name: 'Course', value: 'course' },
    { name: 'Application Date', value: 'date' },
    { name: 'Admission Date', value: 'doa' },
    { name: 'Current Stage', value: 'currentStage' },
];
