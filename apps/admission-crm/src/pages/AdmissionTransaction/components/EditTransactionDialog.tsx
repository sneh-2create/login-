import { Button, Input, Dropdown, DatePicker } from '@od-erp/ui';
import { useEffect, useState } from 'react';
import { useEditAdmissionTransaction } from '@od-erp/query';
import { X } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';

interface EditTransactionDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    transaction: any;
    paymentModes?: string[];
    bankAccounts?: string[];
    onSuccess?: () => void;
}

export const EditTransactionDialog = ({
    open,
    onOpenChange,
    transaction,
    paymentModes = [],
    bankAccounts = [],
    onSuccess
}: EditTransactionDialogProps) => {
    const entityPreferences = useAppSelector((state) => state.config.entityPreferences) || null;
    const displayNames = {
        instituteBank: (entityPreferences as any)?.displayNames?.find((item: any) => item.value === 'instituteBank')?.name || 'Institute Bank'
    };

    const [receiptId, setReceiptId] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [remark, setRemark] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [refId, setRefId] = useState('');
    const [paymentDate, setPaymentDate] = useState<Date | null>(null);
    const [customerBankName, setCustomerBankName] = useState('');
    const [previousRemark, setPreviousRemark] = useState('');
    const [studentRegNo, setStudentRegNo] = useState('');

    const editMutation = useEditAdmissionTransaction();

    useEffect(() => {
        if (transaction && open) {
            setReceiptId(transaction.receiptId || '');
            setDate(transaction.date ? new Date(transaction.date) : null);
            setRemark('');
            setPreviousRemark(transaction.editRemark ? transaction.editRemark + '|' : '');
            setStudentRegNo(transaction.studentRegNo || '');
            
            const pd = transaction.paymentDetails || {};
            setPaymentMode(pd.paymentMode || '');
            setBankAccount(''); // Not selected by default in Angular
            setRefId(pd.refId || '');
            setPaymentDate(pd.date ? new Date(pd.date) : null);
            setCustomerBankName(pd.bankName || '');
        }
    }, [transaction, open]);

    const handleSubmit = async () => {
        if (!remark) {
            return; // Validation will be shown in UI
        }

        const payload = {
            _id: transaction._id,
            receiptId,
            date: date ? date.getTime() : null,
            editRemark: previousRemark + remark,
            paymentDetails: {
                paymentMode,
                bankAccount,
                refId,
                date: paymentMode !== 'Cash' && paymentDate ? paymentDate.getTime() : undefined,
                bankName: paymentMode !== 'Cash' ? customerBankName : undefined,
            }
        };

        try {
            await editMutation.mutateAsync(payload);
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            // Error will be handled by parent component via toast
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Edit Transaction</h2>
                    <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                    {/* Student Reg No - Read Only */}
                    {studentRegNo && (
                        <div className="mb-4 bg-gray-50 p-3 rounded">
                            <label className="text-sm font-medium text-gray-600">Student Registration No</label>
                            <div className="text-base font-semibold mt-1">{studentRegNo}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Receipt Id */}
                        <div>
                            <Input 
                                label="Receipt Id"
                                value={receiptId} 
                                onChange={(e) => setReceiptId(e.target.value)} 
                            />
                        </div>

                        {/* Select Date */}
                        <div>
                            <DatePicker
                                label="Select Date"
                                value={date}
                                onChange={(value) => setDate(value)}
                            />
                        </div>

                        {/* Enter Remark */}
                        <div>
                            <Input 
                                label="Enter Remark"
                                value={remark} 
                                onChange={(e) => setRemark(e.target.value)} 
                                required
                                error={!remark ? 'Field Required' : ''}
                            />
                        </div>

                        {/* Select Payment Mode */}
                        <div>
                            <Dropdown
                                label="Select Payment Mode"
                                value={paymentMode}
                                onChange={(value) => setPaymentMode(String(value))}
                                options={paymentModes.map(mode => ({ label: mode, value: mode }))}
                            />
                        </div>

                        {/* Select Institute Bank */}
                        <div>
                            <Dropdown
                                label={`Select ${displayNames.instituteBank}`}
                                value={bankAccount}
                                onChange={(value) => setBankAccount(String(value))}
                                options={bankAccounts.map(bank => ({ label: bank, value: bank }))}
                                disabled={paymentMode === 'Cash'}
                            />
                        </div>

                        {/* Enter Reference Number */}
                        <div>
                            <Input 
                                label={`Enter ${paymentMode || 'Payment'} Refrence Number`}
                                value={refId} 
                                onChange={(e) => setRefId(e.target.value)} 
                            />
                        </div>

                        {/* Choose a date (Payment Date) - Hidden for Cash */}
                        {paymentMode !== 'Cash' && (
                            <div>
                                <DatePicker
                                    label="Choose a date"
                                    value={paymentDate}
                                    onChange={(value) => setPaymentDate(value)}
                                />
                            </div>
                        )}

                        {/* Enter Customer Bank Name - Hidden for Cash */}
                        {paymentMode !== 'Cash' && (
                            <div>
                                <Input 
                                    label="Enter Customer Bank Name"
                                    value={customerBankName} 
                                    onChange={(e) => setCustomerBankName(e.target.value)} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Back
                    </Button>
                    <Button onClick={handleSubmit} isLoading={editMutation.isPending}>
                        Edit
                    </Button>
                </div>
            </div>
        </div>
    );
};
