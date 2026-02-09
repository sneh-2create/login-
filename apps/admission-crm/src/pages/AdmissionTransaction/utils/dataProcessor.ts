import { AdmissionTransaction } from '@od-erp/types';

export interface ProcessedTransaction extends AdmissionTransaction {
    studentName?: string;
    applicationDetailsCourse?: string;
    applicationDetailsBatch?: string;
    applicationDetailsStream?: string;
    paymentDetailsPaymentMode?: string;
    paymentDetailsDate?: number;
    paymentDetailsBankName?: string;
    paymentDetailsReferenceId?: string;
    [key: string]: any; // For dynamic fee head columns
}

/**
 * Flattens nested transaction data for table display
 */
export function flattenTransactionData(transactions: AdmissionTransaction[]): ProcessedTransaction[] {
    return transactions.map(t => {
        const flattened: ProcessedTransaction = {
            ...t,
            studentName: t.studentData?.name,
            applicationDetailsCourse: t.applicationDetails?.course,
            applicationDetailsBatch: t.applicationDetails?.batch,
            applicationDetailsStream: t.applicationDetails?.stream,
            paymentDetailsPaymentMode: t.paymentDetails?.paymentMode,
            paymentDetailsDate: t.paymentDetails?.date,
            paymentDetailsBankName: t.paymentDetails?.bankName,
            paymentDetailsReferenceId: t.paymentDetails?.refId,
        };

        // Add fee head amounts as individual columns from receipt array
        if (t.receipt && Array.isArray(t.receipt)) {
            t.receipt.forEach(item => {
                if (item.admissionHead && item.paidAmount !== undefined) {
                    flattened[`feeHead_${item.admissionHead}`] = item.paidAmount;
                }
            });
        }

        return flattened;
    });
}

/**
 * Calculates total row including fee head totals
 */
export function calculateTotalRow(
    transactions: ProcessedTransaction[],
    includeFeeHeads: boolean = false
): ProcessedTransaction {
    const totalRow: ProcessedTransaction = {
        receiptId: 'Total',
        totalPaidAmount: 0,
    } as ProcessedTransaction;

    transactions.forEach(t => {
        // Sum total paid amount
        totalRow.totalPaidAmount = (totalRow.totalPaidAmount || 0) + (t.totalPaidAmount || 0);

        // Sum individual fee heads if enabled
        if (includeFeeHeads) {
            Object.keys(t).forEach(key => {
                if (key.startsWith('feeHead_')) {
                    totalRow[key] = (totalRow[key] || 0) + (t[key] || 0);
                }
            });
        }
    });

    return totalRow;
}

/**
 * Extracts unique fee head names from transactions
 */
export function extractFeeHeadNames(transactions: AdmissionTransaction[]): string[] {
    const feeHeadSet = new Set<string>();
    
    transactions.forEach(t => {
        // Use receipt array to extract fee head names
        if (t.receipt && Array.isArray(t.receipt)) {
            t.receipt.forEach(item => {
                if (item.admissionHead) {
                    feeHeadSet.add(item.admissionHead);
                }
            });
        }
    });

    return Array.from(feeHeadSet).sort();
}

/**
 * Processes transaction data for display with totals
 */
export function processTransactionData(
    transactions: AdmissionTransaction[] | undefined,
    includeFeeHeads: boolean = false
): ProcessedTransaction[] {
    if (!transactions || transactions.length === 0) return [];

    const flattened = flattenTransactionData(transactions);
    const totalRow = calculateTotalRow(flattened, includeFeeHeads);
    
    return [...flattened, totalRow];
}
