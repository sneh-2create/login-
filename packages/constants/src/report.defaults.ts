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
