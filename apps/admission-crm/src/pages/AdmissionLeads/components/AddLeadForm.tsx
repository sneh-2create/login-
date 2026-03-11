import { useState, useEffect, useMemo } from 'react';
import { Button, Input, Dropdown, Toggle } from '@od-erp/ui';
import { useAppSelector } from '@od-erp/store';
import { useCounselors, useCourses, useSources, useAddAdmissionLead, useUpdateAdmissionLead, useAdmissionStages } from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { X } from 'lucide-react';

interface AddLeadFormProps {
    onClose: () => void;
    onSuccess: () => void;
    entityId: string;
    session: string;
    permissions: string[];
    initialData?: AdmissionLead | null;
    isEditMode?: boolean;
}

const AddLeadForm = ({ onClose, onSuccess, entityId, session, permissions, initialData, isEditMode }: AddLeadFormProps) => {
    // Selectors
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences);


    // Queries
    const { data: counselors } = useCounselors(entityId, 'counselor');
    const { data: sources } = useSources(entityId, session);
    const { data: courses } = useCourses(entityId, session);

    // Mutations
    const addLeadMutation = useAddAdmissionLead();
    const updateLeadMutation = useUpdateAdmissionLead();
    const { refetch: refetchStageCounts } = useAdmissionStages(entityId, session);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        email: '',
        fatherName: '',
        alternatePhone: '',
        course: '',
        stream: '',
        batch: '',
        applicationNumber: '',
        source: '',
        reference1: '',
        reference2: '',
        campusVisited: false,
        addCounselor: false,
        counselorId: ''
    });

    // Initialize/Update form data when initialData changes
    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                phone: initialData.phone || '',
                name: initialData.name || '',
                email: initialData.email || '',
                fatherName: initialData.fatherName || '',
                alternatePhone: (initialData as any).alternatePhone || '', // Type assertion if needed
                course: initialData.course || '',
                stream: initialData.stream || '',
                batch: initialData.batch || '',
                applicationNumber: initialData.applicationNumber || '',
                source: initialData.source || '',
                reference1: (initialData as any).reference1 || '',
                reference2: (initialData as any).reference2 || '',
                campusVisited: initialData.campusVisited === 'yes',
                addCounselor: !!initialData.counselorId,
                counselorId: initialData.counselorId || ''
            });
        }
    }, [isEditMode, initialData]);

    // Derived State
    const streams = useMemo(() => {
        if (!formData.course || !courses) return [];
        const selectedCourse = courses.find((c: any) => c.name === formData.course);
        return selectedCourse ? (selectedCourse.stream || selectedCourse.streams || []) : [];
    }, [courses, formData.course]);

    const batches = useMemo(() => {
        if (!formData.course || !courses) return [];
        const selectedCourse = courses.find((c: any) => c.name === formData.course);
        return selectedCourse ? (selectedCourse.batch || selectedCourse.batches || []) : [];
    }, [courses, formData.course]);

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Permission Check Helper
    const checkPermission = (permission: string) => permissions.includes(permission);

    // Display Names
    const getDisplayName = (key: string) => {
        return entityPreferences?.displayNames?.find((d: any) => d.value === key)?.name || key.charAt(0).toUpperCase() + key.slice(1);
    };

    // Handlers
    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const updates: any = { [field]: value };
            if (field === 'course') {
                updates.stream = '';
                updates.batch = '';
            }
            if (field === 'stream') {
                updates.batch = '';
            }
            return { ...prev, ...updates };
        });
        // Clear error when field is modified
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.phone) newErrors.phone = 'Phone Number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';

        if (!formData.name) newErrors.name = 'Name is required';

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.course) newErrors.course = `${getDisplayName('course')} is required`;
        if (!formData.stream) newErrors.stream = `${getDisplayName('stream')} is required`;
        if (entityPreferences?.showBatch && !formData.batch) newErrors.batch = `${getDisplayName('batch')} is required`;

        // Source validation might be relaxed in edit mode if not changing? Assuming required always.
        if (!formData.source) newErrors.source = 'Source is required';
        if (formData.source === 'Reference' && !formData.reference1) newErrors.reference1 = 'Reference 1 is required';

        // Application Number validation if visible
        if (!entityPreferences?.autoGenerateAdmissionNumber && !formData.applicationNumber) {
            newErrors.applicationNumber = `${getDisplayName('applicationNumber')} is required`;
        }

        if (formData.addCounselor && !formData.counselorId) {
            newErrors.counselorId = 'Please select a counselor';
            alert('Please select a counselor');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const { addCounselor: _addCounselor, ...restFormData } = formData;
            
            const payload: any = {
                ...restFormData,
                entityId,
                session,
                campusVisited: formData.campusVisited ? 'yes' : 'no',
                // Handle Counselor Logic: Only send if enabled
                counselorId: formData.addCounselor ? formData.counselorId : undefined
            };

            // Remove counselorId if it was set to undefined (or just not included)
            if (!formData.addCounselor) {
                delete payload.counselorId;
            }

            // Clean up reference fields if not applicable
            if (payload.source !== 'Reference') {
                delete payload.reference1;
                delete payload.reference2;
            }

            if (isEditMode && initialData) {
                payload.leadId = initialData._id; // Assuming _id is the identifier
                await updateLeadMutation.mutateAsync(payload);
            } else {
                await addLeadMutation.mutateAsync(payload);
            }

            refetchStageCounts();
            onSuccess();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${isEditMode ? 'update' : 'add'} lead`);
        }
    };

    const isLoading = addLeadMutation.isPending || updateLeadMutation.isPending;

    return (
        <div className="h-full flex flex-col bg-[var(--color-card)]">
            <div className="flex justify-between items-center px-2 py-2 border-b">
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
                        {isEditMode ? 'Edit' : 'Add'} Lead
                    </h3>
                </div>
                <div className="cursor-pointer text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] p-1 hover:bg-[var(--color-background)] rounded-full transition-colors" onClick={onClose}>
                    <X size={24} />
                </div>
            </div>

            {isEditMode && initialData && (
                <div className="mx-6 mt-2 px-3 py-2 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] flex justify-between items-center">
                    <div>
                        <span className="block text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">{getDisplayName('applicationNumber')}</span>
                        <span className="text-lg font-bold text-[var(--color-foreground)]">{initialData.applicationNumber || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Created On</span>
                        <span className="text-sm font-semibold text-[var(--color-foreground)]">
                            {initialData.date ? new Date(initialData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <Input
                        label="Name"
                        placeholder="Type name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                    />

                    {/* Phone Number */}
                    <Input
                        label="Phone Number"
                        placeholder="10 digit number"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        error={errors.phone}
                        disabled={isEditMode} // Usually phone is unique identifier or restricted
                    />

                    {/* Alternate Phone Number */}
                    <Input
                        label="Alternate Phone Number"
                        placeholder="Enter alternate phone number"
                        value={formData.alternatePhone}
                        onChange={(e) => handleChange('alternatePhone', e.target.value)}
                    />

                    {/* Email */}
                    <Input
                        label="Email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                    />

                    {/* Father Name */}
                    <Input
                        label="Father Name"
                        placeholder="Enter father name"
                        value={formData.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                    />

                    {/* Source */}
                    <Dropdown
                        label="Source"
                        options={sources?.map((s) => ({ value: s, label: s })) || []}
                        value={formData.source}
                        onChange={(val) => handleChange('source', val)}
                        error={errors.source}
                        placeholder="Select Source"
                    />

                    {/* Counselor Toggle & Dropdown */}
                    <div className="flex flex-col gap-2">
                        <Toggle
                            label="Assign Counselor"
                            checked={formData.addCounselor}
                            onChange={(e) => handleChange('addCounselor', e.target.checked)}
                        />
                        
                        {formData.addCounselor && (
                            <Dropdown
                                label="Counselor"
                                options={counselors?.map((c: any) => ({ value: c._id, label: c.name })) || []}
                                value={formData.counselorId}
                                onChange={(val) => handleChange('counselorId', val)}
                                placeholder="Select Counselor"
                                searchable
                            />
                        )}
                    </div>

                    {/* Reference Fields - Conditional */}
                    {formData.source === 'Reference' && (
                        <>
                            <Input
                                label="Reference 1 *"
                                placeholder="Enter Reference 1"
                                value={formData.reference1}
                                onChange={(e) => handleChange('reference1', e.target.value)}
                                error={errors.reference1}
                            />
                            <Input
                                label="Reference 2"
                                placeholder="Enter Reference 2"
                                value={formData.reference2}
                                onChange={(e) => handleChange('reference2', e.target.value)}
                            />
                        </>
                    )}

                    {/* Campus Visited */}
                    {checkPermission('isAdmissionFrontDeskAdmin') && (
                        <Dropdown
                            label="Campus Visited"
                            options={[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                            ]}
                            value={formData.campusVisited ? 'yes' : 'no'}
                            onChange={(val) => handleChange('campusVisited', val === 'yes')}
                            placeholder="Select"
                        />
                    )}

                    {/* Course */}
                    <Dropdown
                        label={`Select ${getDisplayName('course')} *`}
                        options={courses?.map((c: any) => ({ value: c.name, label: c.name })) || []}
                        value={formData.course}
                        onChange={(val) => handleChange('course', val)}
                        error={errors.course}
                        placeholder={`Select ${getDisplayName('course')}`}
                    />

                    {/* Stream */}
                    {formData.course && (
                        <Dropdown
                            label={`Select ${getDisplayName('stream')} *`}
                            options={streams?.map((s: string) => ({ value: s, label: s })) || []}
                            value={formData.stream}
                            onChange={(val) => handleChange('stream', val)}
                            error={errors.stream}
                            placeholder={`Select ${getDisplayName('stream')}`}
                        />
                    )}

                    {/* Batch */}
                    {entityPreferences?.showBatch && formData.stream && (
                        <Dropdown
                            label={`Select ${getDisplayName('batch')} *`}
                            options={batches?.map((b: string) => ({ value: b, label: b })) || []}
                            value={formData.batch}
                            onChange={(val) => handleChange('batch', val)}
                            error={errors.batch}
                            placeholder={`Select ${getDisplayName('batch')}`}
                        />
                    )}

                    {/* Application Number */}
                        <Input
                            label={`Application Number *`}
                            placeholder={`Application Number`}
                            value={formData.applicationNumber}
                            onChange={(e) => handleChange('applicationNumber', e.target.value)}
                            error={errors.applicationNumber}
                        />

                </div>
            </div>

            <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-card)] flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} className="border-[var(--color-border)] text-[var(--color-foreground)]">
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    className="min-w-[100px]"
                >
                    {isEditMode ? 'Edit Lead' : 'Add Lead'}
                </Button>
            </div>
        </div>
    );
};

export default AddLeadForm;
