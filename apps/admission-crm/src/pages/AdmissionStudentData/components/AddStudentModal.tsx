import { useState } from 'react';
import { Button, Input, Select } from '@od-erp/ui';
import { X } from 'lucide-react';
import { useCounselors } from '@od-erp/query';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (_data: any) => void;
    isLoading?: boolean;
    entityId: string;
}

const AddStudentModal = ({ isOpen, onClose, onSubmit, isLoading, entityId }: AddStudentModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        fatherName: '',
        applicationNumber: '',
        course: '',
        stream: '',
        source: '',
        counselorId: '',
    });

    const { data: counselors } = useCounselors(entityId, 'counselor');

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.phone) {
            alert('Name and Phone are required');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Add Application Data</h2>
                    <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Student Name *"
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <Input
                        label="Phone Number *"
                        placeholder="Enter Phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                    <Input
                        label="Father Name"
                        placeholder="Enter Father Name"
                        value={formData.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                    />
                    <Input
                        label="Email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    <Input
                        label="Application Number"
                        placeholder="Enter Application No"
                        value={formData.applicationNumber}
                        onChange={(e) => handleChange('applicationNumber', e.target.value)}
                    />
                    <Select
                        label="Course"
                        options={[
                            { label: 'B.Tech', value: 'B.Tech' },
                            { label: 'MBA', value: 'MBA' },
                            { label: 'BBA', value: 'BBA' }
                        ]} // TODO: Fetch dynamic courses
                        value={formData.course}
                        onChange={(e) => handleChange('course', e.target.value)}
                    />
                    <Select
                        label="Stream"
                        options={[
                            { label: 'CSE', value: 'CSE' },
                            { label: 'Mechanical', value: 'Mechanical' },
                            { label: 'Civil', value: 'Civil' }
                        ]}
                        value={formData.stream}
                        onChange={(e) => handleChange('stream', e.target.value)}
                    />
                    <Select
                        label="Source"
                        options={[
                            { label: 'Walk-in', value: 'Walk-in' },
                            { label: 'Reference', value: 'Reference' },
                            { label: 'Online', value: 'Online' }
                        ]}
                        value={formData.source}
                        onChange={(e) => handleChange('source', e.target.value)}
                    />
                    <Select
                        label="Counselor"
                        options={counselors?.map((c: any) => ({ label: c.name, value: c._id })) || []}
                        value={formData.counselorId}
                        onChange={(e) => handleChange('counselorId', e.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
