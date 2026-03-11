import { useState } from 'react';
import { Button, Input } from '@od-erp/ui';
import { X } from 'lucide-react';

interface RejectRemarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_remark: string) => void;
  isLoading?: boolean;
}

export const RejectRemarkDialog = ({ isOpen, onClose, onSubmit, isLoading }: RejectRemarkDialogProps) => {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!remark.trim()) {
      setError('Remark is required');
      return;
    }
    onSubmit(remark);
    setRemark('');
    setError('');
  };

  const handleClose = () => {
    setRemark('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Enter Remark</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remark <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter rejection remark"
            value={remark}
            onChange={(e) => {
              setRemark(e.target.value);
              setError('');
            }}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
