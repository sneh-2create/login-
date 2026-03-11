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
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-sm mx-4 flex flex-col overflow-visible">
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        Update Counselor
                    </h2>
                    <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-3 py-2 overflow-visible">
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                        Assigning new counselor for <span className="font-bold text-[var(--color-foreground)]">{selectedCount}</span> selected leads.
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

                <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-background)] rounded-b-lg flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-[var(--color-border)] text-[var(--color-foreground)]">
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
