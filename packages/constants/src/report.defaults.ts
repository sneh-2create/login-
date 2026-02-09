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

// Add more report defaults here as needed
// Example:
// export const DEFAULT_STUDENT_REPORT_HEADS = [...];
// export const DEFAULT_FEE_REPORT_HEADS = [...];
