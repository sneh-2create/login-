import { Button, Input } from '@od-erp/ui';
import { useState, useEffect } from 'react';
import { useCancelAdmissionTransaction } from '@od-erp/query';
import { X } from 'lucide-react';

interface CancelTransactionDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    transaction: any;
    entityId: string;
    session: string;
    onSuccess?: () => void;
}

export const CancelTransactionDialog = ({
    open,
    onOpenChange,
    transaction,
    entityId,
    session,
    onSuccess
}: CancelTransactionDialogProps) => {
    const [reason, setReason] = useState('chequeBounce');
    const [remark, setRemark] = useState('Cheque Bounce');
    const [charges, setCharges] = useState<number | ''>(0);

    const cancelMutation = useCancelAdmissionTransaction();

    useEffect(() => {
        if (open) {
            setReason('chequeBounce');
            setRemark('Cheque Bounce');
            setCharges(0);
        }
    }, [open]);

    const handleReasonChange = (val: string) => {
        setReason(val);
        if (val === 'chequeBounce') {
            setRemark('Cheque Bounce');
            setCharges(0);
        } else {
            setRemark('');
            setCharges('');
        }
    };

    const handleSubmit = async () => {
        if (!remark) {
            return; // Validation shown in UI
        }

        const payload = {
            _id: transaction._id,
            entity: entityId,
            session: transaction.session || session,
            cancellationRemark: remark,
            chequeBounceCharge: reason === 'chequeBounce' ? Number(charges || 0) : null
        };

        try {
            await cancelMutation.mutateAsync(payload);
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            // Error handled by parent via toast
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Cancel Receipt {transaction?.receiptId}</h2>
                    <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 pb-0">
                    {/* Transaction Details */}
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Application: </span>
                                <span className="font-medium">{transaction?.applicationNumber || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Courses: </span>
                                <span className="font-medium">{transaction?.applicationDetails?.course || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Stream: </span>
                                <span className="font-medium">{transaction?.applicationDetails?.stream || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-dashed border-gray-300"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Payment Mode: </span>
                                <span className="font-medium">{transaction?.paymentDetails?.paymentMode || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Date of Payment: </span>
                                <span className="font-medium">
                                    {transaction?.date ? new Date(transaction.date).toLocaleDateString('en-GB') : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Paid Amount: </span>
                                <span className="font-medium">{transaction?.totalPaidAmount || 0}</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-dashed border-gray-300"></div>
                        
                        <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Reason for cancellation</span>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 pb-6 grid gap-4">
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="reason" 
                                value="chequeBounce" 
                                checked={reason === 'chequeBounce'} 
                                onChange={(e) => handleReasonChange(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span>Cheque Bounce</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="reason" 
                                value="other" 
                                checked={reason === 'other'} 
                                onChange={(e) => handleReasonChange(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span>Other</span>
                        </label>
                    </div>

                <div className="grid gap-2">
                        <Input
                            label="Remark"
                            required
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                        />
                    </div>

                    {reason === 'chequeBounce' && (
                         <div className="grid gap-2">
                            <Input
                                label="Cheque Bounce Charges"
                                type="number"
                                value={charges}
                                onChange={(e) => setCharges(Number(e.target.value))}
                            />
                         </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button 
                        variant="danger" 
                        onClick={handleSubmit} 
                        isLoading={cancelMutation.isPending}
                    >
                        Cancel Receipt
                    </Button>
                </div>
            </div>
        </div>
    );
};
