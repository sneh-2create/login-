import { X } from 'lucide-react';
import { Button } from '@od-erp/ui';
import { format } from 'date-fns';

interface ViewTransactionDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    transaction: any;
}

export const ViewTransactionDialog = ({ open, onOpenChange, transaction }: ViewTransactionDialogProps) => {
    if (!open || !transaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => onOpenChange(false)}
            />
            
            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Receipt Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Receipt Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Receipt ID" value={transaction.receiptId} />
                            <InfoItem label="Date" value={transaction.date ? format(new Date(transaction.date), 'dd-MMM-yyyy') : '-'} />
                            <InfoItem label="Status" value={transaction.status} badge />
                            <InfoItem label="Voucher Status" value={transaction.voucherStatus ? 'Created' : 'Not Created'} />
                        </div>
                    </div>

                    {/* Student Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Student Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Name" value={transaction.studentData?.name} />
                            <InfoItem label="Phone" value={transaction.studentData?.phone} />
                            <InfoItem label="Email" value={transaction.studentData?.email} />
                            <InfoItem label="Registration No" value={transaction.studentData?.registrationNo} />
                        </div>
                    </div>

                    {/* Application Details */}
                    {transaction.applicationDetails && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Application Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Course" value={transaction.applicationDetails.course} />
                                <InfoItem label="Stream" value={transaction.applicationDetails.stream} />
                                <InfoItem label="Batch" value={transaction.applicationDetails.batch} />
                                <InfoItem label="Application ID" value={transaction.applicationDetails.applicationId} />
                            </div>
                        </div>
                    )}

                    {/* Payment Details */}
                    {transaction.paymentDetails && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Payment Mode" value={transaction.paymentDetails.paymentMode} />
                                <InfoItem label="Bank Name" value={transaction.paymentDetails.bankName} />
                                <InfoItem label="Reference ID" value={transaction.paymentDetails.referenceId} />
                                <InfoItem label="Payment Date" value={transaction.paymentDetails.date ? format(new Date(transaction.paymentDetails.date), 'dd-MMM-yyyy') : '-'} />
                            </div>
                        </div>
                    )}

                    {/* Fee Heads */}
                    {transaction.admissionHead && transaction.admissionHead.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Fee Breakdown</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fee Head</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transaction.admissionHead.map((head: any, index: number) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 text-sm text-gray-800">{head.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800 text-right">₹{head.amount?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-semibold">
                                            <td className="px-4 py-2 text-sm text-gray-900">Total</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">₹{transaction.totalPaidAmount?.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {(transaction.editRemark || transaction.cancellationRemark) && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Remarks</h3>
                            {transaction.editRemark && (
                                <div className="mb-2">
                                    <span className="text-sm font-medium text-gray-600">Edit Remark: </span>
                                    <span className="text-sm text-gray-800">{transaction.editRemark}</span>
                                </div>
                            )}
                            {transaction.cancellationRemark && (
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Cancellation Remark: </span>
                                    <span className="text-sm text-gray-800">{transaction.cancellationRemark}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, badge = false }: { label: string; value: any; badge?: boolean }) => {
    const displayValue = value !== undefined && value !== null && value !== '' ? value : '-';
    
    return (
        <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            {badge ? (
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    displayValue === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {displayValue}
                </span>
            ) : (
                <p className="text-sm text-gray-900">{displayValue}</p>
            )}
        </div>
    );
};
