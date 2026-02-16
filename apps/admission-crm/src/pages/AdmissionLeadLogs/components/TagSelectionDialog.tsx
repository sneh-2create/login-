import { useState } from 'react';
import { Button, Dropdown } from '@od-erp/ui';
import { X } from 'lucide-react';

interface Tag {
  _id: string;
  tag: string;
  label: string;
  colour: string;
}

interface TagSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_tag: Tag) => void;
  tags: Tag[];
  isLoading?: boolean;
}

export const TagSelectionDialog = ({ isOpen, onClose, onSubmit, tags, isLoading }: TagSelectionDialogProps) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedTag) {
      setError('Please select a tag');
      return;
    }
    const tag = tags.find(t => t._id === selectedTag);
    if (tag) {
      onSubmit(tag);
      setSelectedTag('');
      setError('');
    }
  };

  const handleClose = () => {
    setSelectedTag('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Tag</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={selectedTag}
            onChange={(val) => {
              setSelectedTag(val as string);
              setError('');
            }}
            options={tags.map(t => ({
              value: t._id,
              label: t.tag
            }))}
            placeholder="Select Tag"
            className="w-full"
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
