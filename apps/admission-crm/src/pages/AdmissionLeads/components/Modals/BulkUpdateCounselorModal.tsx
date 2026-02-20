import { useState } from 'react';
import { X, Users } from 'lucide-react';
import { Button, SelectSingle } from '@od-erp/ui';
import { useCounselors } from '@od-erp/query';

interface BulkUpdateCounselorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    entityId: string;
    onUpdate: (_counselorId: string) => void;
}

const BulkUpdateCounselorModal = ({ isOpen, onClose, selectedCount, entityId, onUpdate }: BulkUpdateCounselorModalProps) => {
    const [counselorId, setCounselorId] = useState('');
    const { data: counselors, isLoading } = useCounselors(entityId, 'counselor');

    if (!isOpen) return null;

    const handleUpdate = () => {
        if (!counselorId) return;
        onUpdate(counselorId);
        setCounselorId('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 flex flex-col overflow-visible">
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        Update Counselor
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-3 py-2 overflow-visible">
                    <p className="text-sm text-gray-600 mb-2">
                        Assigning new counselor for <span className="font-bold text-gray-900">{selectedCount}</span> selected leads.
                    </p>
                    
                    <div className="mb-4">
                        <SelectSingle
                            label="Select Counselor"
                            options={counselors?.map((c: any) => ({ value: c._id, label: c.name })) || []}
                            value={counselorId}
                            onChange={(val) => setCounselorId(val as string)}
                            placeholder={isLoading ? 'Loading...' : 'Select Counselor'}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate}
                        disabled={!counselorId}
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BulkUpdateCounselorModal;
