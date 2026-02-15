import { useState } from 'react';
import { Button, Input, DatePicker } from '@od-erp/ui';
import { X } from 'lucide-react';

interface FollowUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_followUpQuery: string, _followUpDate: number) => void;
  isLoading?: boolean;
}

export const FollowUpDialog = ({ isOpen, onClose, onSubmit, isLoading }: FollowUpDialogProps) => {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ query?: string; date?: string }>({});

  const handleSubmit = () => {
    const newErrors: { query?: string; date?: string } = {};
    
    if (!followUpQuery.trim()) {
      newErrors.query = 'Follow-up query is required';
    }
    if (!followUpDate) {
      newErrors.date = 'Follow-up date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(followUpQuery, followUpDate!.getTime());
    setFollowUpQuery('');
    setFollowUpDate(null);
    setErrors({});
  };

  const handleClose = () => {
    setFollowUpQuery('');
    setFollowUpDate(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Follow-up Details</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Query <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter follow-up query"
              value={followUpQuery}
              onChange={(e) => {
                setFollowUpQuery(e.target.value);
                setErrors({ ...errors, query: undefined });
              }}
              className={errors.query ? 'border-red-500' : ''}
            />
            {errors.query && <p className="text-red-500 text-sm mt-1">{errors.query}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={followUpDate}
              onChange={(date) => {
                setFollowUpDate(date);
                setErrors({ ...errors, date: undefined });
              }}
              minDate={new Date()}
              className="w-full"
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
