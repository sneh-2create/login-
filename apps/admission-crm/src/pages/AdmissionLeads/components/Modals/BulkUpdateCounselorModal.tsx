import { useState } from 'react';
import { X, Users } from 'lucide-react';
import { Button, Dropdown } from '@od-erp/ui';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 flex flex-col overflow-visible">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Users size={18} className="text-blue-600" />
                        Update Counselor
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-visible">
                    <p className="text-sm text-gray-600 mb-4">
                        Assigning new counselor for <span className="font-bold text-gray-900">{selectedCount}</span> selected leads.
                    </p>
                    
                    <div className="mb-4">
                        <Dropdown
                            label="Select Counselor"
                            options={counselors?.map((c: any) => ({ value: c._id, label: c.name })) || []}
                            value={counselorId}
                            onChange={(val) => setCounselorId(val as string)}
                            placeholder={isLoading ? "Loading..." : "Select Counselor"}
                            searchable
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate}
                        disabled={!counselorId}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BulkUpdateCounselorModal;
