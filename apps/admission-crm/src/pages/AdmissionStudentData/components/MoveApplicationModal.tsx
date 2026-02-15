import { useState, useEffect } from 'react';
import { Button, Dropdown } from '@od-erp/ui';
import { useMoveAdmissionStudentData, useEntityPreferences, useAdmissionStageSetup } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { X, ArrowRight, RefreshCw } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';

interface MoveApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
    onSuccess?: () => void;
    inline?: boolean;
}

const MoveApplicationModal = ({ isOpen, onClose, student, onSuccess, inline = false }: MoveApplicationModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const user = useAppSelector((state) => state.auth.user) as any;
    const entityGroup = user?.entityGroup || [];
    
    const [selectedEntity, setSelectedEntity] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [admissionSession, setAdmissionSession] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Queries - fetch entity preferences to get active admission session
    const { data: entityPreferences } = useEntityPreferences(selectedEntity);
    
    // Fetch stages for the selected entity and session (matching Angular's listStagesForMoveApplication)
    const { data: stageSetup } = useAdmissionStageSetup(selectedEntity, admissionSession);
    const moveStudentMutation = useMoveAdmissionStudentData();

    // Convert stage setup to dropdown options
    const stageOptions = stageSetup?.map(stage => ({
        label: stage.stage,
        value: stage.stage
    })) || [];

    // Set admission session from entity preferences when available
    useEffect(() => {
        if (selectedEntity && entityPreferences?.admissionSession) {
            setAdmissionSession(entityPreferences.admissionSession);
        } else if (!selectedEntity) {
            // Clear session when no entity is selected
            setAdmissionSession('');
        }
    }, [selectedEntity, entityPreferences]);

    // Reset form when modal opens - matching Angular's openMoveApplication behavior
    useEffect(() => {
        if (isOpen && student) {
            setSelectedEntity('');
            setSelectedStage('');
            setAdmissionSession('');
        }
    }, [isOpen, student]);

    const handleEntityChange = (value: string | number | (string | number)[]) => {
        const entityValue = Array.isArray(value) ? value[0] as string : value as string;
        setSelectedEntity(entityValue);
    };

    const handleStageChange = (value: string | number | (string | number)[]) => {
        const stageValue = Array.isArray(value) ? value[0] as string : value as string;
        setSelectedStage(stageValue);
    };

    const handleRefresh = () => {
        setSelectedEntity('');
        setSelectedStage('');
    };

    const handleSubmit = async () => {
        if (!student) return;
        
        if (!selectedEntity) {
            alert('Please select entity');
            return;
        }
        
        if (!selectedStage) {
            alert('Please select stage');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                applicationId: student._id,
                toEntity: selectedEntity,
                toSession: admissionSession,
                toStage: selectedStage,
            };

            await moveStudentMutation.mutateAsync(payload);
            
            alert('Application moved successfully');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Failed to move application:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to move application';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const checkDisability = (item: any) => {
        return item.entityId === entityId;
    };

    if (!isOpen || !student) return null;

    // Content component
    const content = (
        <div className={inline ? "space-y-4" : "px-3 py-2"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Entity Selection */}
                <div>
                    <Dropdown
                        label="Select Entity"
                        options={entityGroup.map((e: any) => ({ 
                            label: e.name, 
                            value: e.entityId,
                            disabled: checkDisability(e)
                        }))}
                        value={selectedEntity}
                        onChange={handleEntityChange}
                    />
                </div>

                {/* Stage Selection */}
                <div>
                    <Dropdown
                        label="Select Stage"
                        options={stageOptions}
                        value={selectedStage}
                        onChange={handleStageChange}
                    />
                </div>
            </div>

            {/* Session Display */}
            {admissionSession && (
                <p className="text-sm text-gray-500 mb-2">
                    Admission Session: {admissionSession}
                </p>
            )}

            {/* Note */}
            <p className="text-sm text-gray-500 mb-4">
                Note: Please make sure if course combination exists in new entity
            </p>

            {/* Submit Button for inline mode */}
            {inline && (
                <div className="flex justify-end pt-4 border-t">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? 'Moving...' : 'Move Application'}
                        <ArrowRight size={16} />
                    </Button>
                </div>
            )}
        </div>
    );

    // Inline mode - render content directly
    if (inline) {
        return content;
    }

    // Modal mode - render with modal wrapper
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Move Application</h2>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRefresh} 
                            className="text-gray-500 hover:text-gray-700"
                            disabled={isLoading}
                            title="Refresh"
                        >
                            <RefreshCw size={20} />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-gray-700"
                            disabled={isLoading}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {content}

                {/* Footer */}
                <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? 'Moving...' : 'Go'}
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MoveApplicationModal;
