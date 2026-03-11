import { useEffect, useState } from 'react';
import { Button, SelectSingle, TextArea, useToast } from '@od-erp/ui';
import { AdmissionFollowUp } from '@od-erp/types';
import { format } from 'date-fns';
import { admissionFollowUpService } from '@od-erp/api-client';
import { X } from 'lucide-react';

interface EditFollowUpDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  data: AdmissionFollowUp | null;
  onSuccess: () => void;
  hasViewPhoneNumberPermission: boolean;
}

export const EditFollowUpDialog = ({
  open,
  onOpenChange,
  data,
  onSuccess
}: EditFollowUpDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  // Form State
  const [status, setStatus] = useState<string>('');
  const [completionRemark, setCompletionRemark] = useState<string>('');
  const [errors, setErrors] = useState<{ status?: string; completionRemark?: string }>({});

  useEffect(() => {
    if (open && data) {
      setStatus(data.status || 'pending');
      setCompletionRemark(data.completionRemark || '');
      setErrors({});
    }

    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, data]);

  const handleSubmit = async () => {
    // Validation
    const newErrors: { status?: string; completionRemark?: string } = {};
    if (!status) newErrors.status = 'Status is required';
    if (!completionRemark || completionRemark.length < 2) {
      newErrors.completionRemark = 'Completion remark is required (min 2 chars)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!data) return;

    setLoading(true);
    try {
      const payload = {
        ...data,
        status,
        completionRemark,
        studentData: data.studentData
      };

      await admissionFollowUpService.editAdmissionFollowUp(payload);
      showToast('success', 'Follow-up updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Update failed', error);
      showToast('error', 'Failed to update follow-up');
    } finally {
      setLoading(false);
    }
  };

  if (!data || !open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 font-sans">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">Follow Up Details</h2>
                <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="p-3 bg-gray-50/50 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Counselor Information Card */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group">
                        <h3 className="text-gray-600 font-bold mb-3">Counselor Information</h3>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Counselor Name</span>
                                <span className="text-gray-900 font-medium text-sm">{data.counselorName || '-'}</span>
                            </div>
                            <div className="border-b border-gray-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Phone</span>
                                <span className="text-gray-900 font-medium text-sm">+91 7890543212</span> {/* Hardcoded as per design or need source */}
                            </div>
                            <div className="border-b border-gray-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Follow Up Query</span>
                                <span className="text-gray-900 font-medium text-sm">{data.followUpQuery || 'Pending'}</span>
                            </div>
                            <div className="border-b border-gray-100"></div>
                        </div>
                    </div>

                    {/* Application Details Card */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group">
                        <h3 className="text-gray-600 font-bold mb-3">Application Details</h3>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Application Number</span>
                                <span className="text-gray-900 font-bold text-sm">{data.applicationNumber || '-'}</span>
                            </div>
                            <div className="border-b border-gray-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Date</span>
                                <span className="text-gray-900 font-medium text-sm">
                                    {data.studentData?.date ? format(new Date(data.studentData.date), 'dd-MM-yyyy') : '-'}
                                </span>
                            </div>
                            <div className="border-b border-gray-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Course</span>
                                <span className="text-gray-900 font-medium text-sm">{data.studentData?.course || '-'}</span>
                            </div>
                            <div className="border-b border-gray-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Stream</span>
                                <span className="text-gray-900 font-medium text-sm">{data.studentData?.stream || '-'}</span>
                            </div>
                            <div className="border-b border-gray-100"></div>
                        </div>
                    </div>
                </div>

                {/* Follow Up Information Card */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group">
                    <h3 className="text-gray-600 font-bold mb-3">Follow Up Information</h3>

                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Name</span>
                            <span className="text-gray-900 font-medium text-sm">{data.studentData?.name || '-'}</span>
                        </div>
                         <div className="border-b border-gray-100"></div>
                        
                        <div className="flex justify-between items-center">
                             <span className="text-gray-500 text-sm">Follow Up Date</span>
                             <span className="text-gray-900 font-medium text-sm">
                                {data.followUpDate ? format(new Date(data.followUpDate), 'dd-MM-yyyy') : '-'}
                             </span>
                        </div>
                        <div className="border-b border-gray-100"></div>

                        <div className="flex justify-between items-center">
                             <span className="text-gray-500 text-sm">Status</span>
                             <div className="w-1/2">
                                <SelectSingle
                                    value={status}
                                    onChange={(val) => setStatus(val as string)}
                                    options={[
                                        { label: 'Pending', value: 'pending' },
                                        { label: 'Completed', value: 'completed' }
                                    ]}
                                    error={errors.status}
                                    containerClassName="w-full"
                                />
                            </div>
                        </div>
                        <div className="border-b border-gray-100"></div>

                        <div className="flex justify-between items-start pt-2">
                             <span className="text-gray-500 text-sm mt-2">Completion Remark</span>
                             <div className="w-1/2">
                                <TextArea
                                    value={completionRemark}
                                    onChange={(val) => setCompletionRemark(val)}
                                    placeholder="Enter remark..."
                                    rows={2}
                                    error={errors.completionRemark}
                                />
                             </div>
                        </div>
                        <div className="border-b border-gray-100"></div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-3 py-2 border-t border-gray-100 bg-white rounded-b-lg flex-shrink-0">
                <Button 
                    variant="primary"
                    onClick={handleSubmit} 
                    isLoading={loading}
                >
                    Save Changes
                </Button>
            </div>
        </div>
    </div>
  );
};
