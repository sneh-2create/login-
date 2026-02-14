import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input } from '@od-erp/ui';
import { useCancelAdmissionTransaction } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';

interface CancelTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    receipt: any;
    onSuccess: () => void;
}

const CancelTransactionDialog = ({ isOpen, onClose, receipt, onSuccess }: CancelTransactionDialogProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    
    const [reason, setReason] = useState<'chequeBounce' | 'other'>('chequeBounce');
    const [cancellationRemark, setCancellationRemark] = useState('Cheque Bounce');
    const [chequeBounceCharge, setChequeBounceCharge] = useState<number>(0);
    const [hasError, setHasError] = useState(false);

    const cancelMutation = useCancelAdmissionTransaction();

    const handleReasonChange = (newReason: 'chequeBounce' | 'other') => {
        setReason(newReason);
        if (newReason === 'chequeBounce') {
            setCancellationRemark('Cheque Bounce');
            setChequeBounceCharge(0);
        } else {
            setCancellationRemark('');
            setChequeBounceCharge(0);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (reason === 'other' && !cancellationRemark.trim()) {
            setHasError(true);
            return;
        }

        setHasError(false);

        const receiptData = {
            _id: receipt._id,
            entity: entityId,
            session: session,
            cancellationRemark: cancellationRemark,
            chequeBounceCharge: reason === 'chequeBounce' ? chequeBounceCharge : 0,
        };

        try {
            await cancelMutation.mutateAsync(receiptData);
            alert(`${receipt.receiptId} Receipt Cancelled`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to cancel receipt:', error);
            alert('Failed to cancel receipt. Please try again.');
        }
    };

    if (!isOpen || !receipt) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 z-[10001]"
                onClick={onClose}
            />
            
            {/* Dialog */}
            <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b bg-primary/10">
                        <h2 className="text-xl font-semibold text-primary">
                            Receipt ID {receipt.receiptId}
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-white/50"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Error Alert */}
                        {hasError && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <p className="text-sm text-yellow-700">
                                    Oh snap! Change a few things up and try submitting again.
                                </p>
                            </div>
                        )}

                        {/* Receipt Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <strong>Student Name:</strong> {receipt.student?.name || 'N/A'}
                            </div>
                            <div>
                                <strong>Student Reg No:</strong> {receipt.studentRegNo || 'N/A'}
                            </div>
                            <div>
                                <strong>Paid Amount:</strong> {receipt.totalPaidAmount || 0}
                            </div>
                        </div>

                        <hr className="border-dashed" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <strong>Father's Name:</strong> {receipt.student?.fatherName || 'N/A'}
                            </div>
                            <div>
                                <strong>Class:</strong> {receipt.studentDetails?.course || receipt.applicationDetails?.course || 'N/A'}
                            </div>
                            <div>
                                <strong>Date of Payment:</strong> {receipt.date ? new Date(receipt.date).toLocaleDateString('en-GB') : 'N/A'}
                            </div>
                        </div>

                        <hr className="border-dashed" />

                        {/* Cancellation Reason */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <strong>Reason for cancellation:</strong>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value="chequeBounce"
                                        checked={reason === 'chequeBounce'}
                                        onChange={() => handleReasonChange('chequeBounce')}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span>Cheque Bounce</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value="other"
                                        checked={reason === 'other'}
                                        onChange={() => handleReasonChange('other')}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span>Other</span>
                                </label>
                            </div>
                            <div>
                                {reason === 'other' ? (
                                    <Input
                                        label=""
                                        placeholder="Enter cancellation Remark"
                                        value={cancellationRemark}
                                        onChange={(e) => setCancellationRemark(e.target.value)}
                                        required
                                    />
                                ) : (
                                    <Input
                                        label=""
                                        type="number"
                                        placeholder="Cheque Bounce Charges"
                                        value={chequeBounceCharge.toString()}
                                        onChange={(e) => setChequeBounceCharge(Number(e.target.value) || 0)}
                                        min={0}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            <strong>Note:</strong> Please make sure you have created cheque bounce feeHead
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CancelTransactionDialog;
