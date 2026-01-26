import { useState } from 'react';
import { Button } from '@od-erp/ui';
import { X } from 'lucide-react';

interface NegativeTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (_remark: string) => void;
    title?: string;
}

const NegativeTagModal = ({ isOpen, onClose, onSave, title = 'Add Remark' }: NegativeTagModalProps) => {
    const [remark, setRemark] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        // Simulate async if needed, or just pass back
        await onSave(remark);
        setIsLoading(false);
        setRemark(''); // Reset
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Remark *</label>
                            <textarea
                                rows={4}
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter remark here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!remark.trim()}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NegativeTagModal;
