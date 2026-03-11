import { useState, useEffect } from 'react';
import { useViewAdmissionStudentData, useEditAdmissionStudentData, useCounselors, useAdmissionMaster, useCourses, useAdmissionLeadLog } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Button, Input, Select } from '@od-erp/ui';
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react';
import { format } from 'date-fns';
import NegativeTagModal from './NegativeTagModal';
import ViewFollowUpModal from '../../../components/Modals/ViewFollowUpModal';
import { useAdmissionStageSetup } from '@od-erp/query';
import { ALL_STUDENT_FIELDS } from '@od-erp/constants';
import { useMemo } from 'react';

interface ViewAdmissionDetailsProps {
    studentId: string | null;
    onClose: () => void;
}

const ViewAdmissionDetails = ({ studentId, onClose }: ViewAdmissionDetailsProps) => {
    const { data: student, isLoading } = useViewAdmissionStudentData(studentId || '');

    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityDetails = useAppSelector((state) => state.auth.entityDetails);
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences);
    const session = student?.session || '24-25'; // Default session if missing

    // --- TIMELINE DATA FETCHING (Matched with TimelineModal) ---
    const timelineQueryPayload = useMemo(() => {
        if (!student) return null;
        return {
            entity: entityId,
            session: session,
            pageNumber: 1,
            pageSize: 100,
            phone: student.phone || '',
            search: ''
        };
    }, [entityId, session, student]);

    const { data: timelineResponse } = useAdmissionLeadLog(timelineQueryPayload || { entity: '', session: '', pageNumber: 1, pageSize: 0 });

    const timelineData = useMemo(() => {
        // Safe check for both local timeline and fetched logs
        const localTimeline = student?.timeline || [];

        // timelineResponse might be undefined initially or empty
        const fetchedLogs = timelineResponse?.data || [];

        // Combine arrays
        const combined = [...localTimeline, ...fetchedLogs];

        // Sort by date descending (newest first)
        return combined.sort((a: any, b: any) => {
            const dateA = a.date || a.createdAt || 0;
            const dateB = b.date || b.createdAt || 0;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    }, [student, timelineResponse]);

    const updateMutation = useEditAdmissionStudentData();
    const { data: counselors } = useCounselors(entityId || '', 'counselor');
    const { data: admissionMaster } = useAdmissionMaster(entityId || '', student?.session || '');
    // Renaming for clarity: The API returns a list of Schools (containing nested courses/streams)
    const { data: schoolLevelList } = useCourses(entityId || '', student?.session || '');

    const [selectedSchoolData, setSelectedSchoolData] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    // When student loads or school list loads, try to set the selected school object to populate dependent dropdowns
    useEffect(() => {
        if (formData.school && schoolLevelList) {
            const school = schoolLevelList.find((s: any) => (s.name || s) === formData.school);
            if (school) setSelectedSchoolData(school);
        }
    }, [formData.school, schoolLevelList]);

    // Initialize form data when student data loads
    useEffect(() => {
        if (student) {
            setFormData({
                ...student,
                // Ensure date fields are formatted for date input if needed
                date: student.date ? format(new Date(student.date), 'yyyy-MM-dd') : '',
                followUpDate: student.followUpDate ? format(new Date(student.followUpDate), 'yyyy-MM-dd') : '',
                dob: student.dob ? format(new Date(student.dob), 'yyyy-MM-dd') : '',
                currentStage: student.currentStage,
            });
        }
    }, [student]);

    const { data: stageSetup } = useAdmissionStageSetup(entityId, session || '24-25');

    // Calculate Ordered Stages and Current Index
    const orderedStages = useMemo(() => {
        return stageSetup?.sort((a: any, b: any) => a.sequence - b.sequence) || [];
    }, [stageSetup]);

    const currentStageIndex = useMemo(() => {
        if (!orderedStages.length || !formData.currentStage) return 0;
        return orderedStages.findIndex((s: any) => s.stage === formData.currentStage);
    }, [orderedStages, formData.currentStage]);

    // Active Fields Logic
    const activeFields = useMemo(() => {
        if (!orderedStages.length) return [];
        const stageConfig = orderedStages.find((s: any) => s.stage === formData.currentStage);
        // If stage config doesn't have fields or is empty, we default to SHOWING ALL (fallback) or SHOWING NONE?
        // Angular logic: "let stageFields = this.selectedStage.fields".
        // If stageFields is null, it shows nothing?
        // Let's fallback to showing defaults if no config is found to avoid empty form.
        if (!stageConfig?.fields?.length) return ALL_STUDENT_FIELDS.map(f => f.value);
        return stageConfig.fields.map((f: any) => f.key || f);
    }, [orderedStages, formData.currentStage]);

    // Group Visible Fields
    const groupedFields = useMemo(() => {
        const visible = ALL_STUDENT_FIELDS.filter(f => activeFields.includes(f.value));
        const groups: { [key: string]: typeof ALL_STUDENT_FIELDS } = {};
        visible.forEach(field => {
            if (!groups[field.groupBy]) {
                groups[field.groupBy] = [];
            }
            groups[field.groupBy].push(field);
        });
        return groups;
    }, [activeFields]);

    const handleNextStage = () => {
        if (currentStageIndex < orderedStages.length - 1) {
            const nextStage = orderedStages[currentStageIndex + 1];
            setFormData((prev: any) => ({ ...prev, currentStage: nextStage.stage }));
        }
    };

    const handlePreviousStage = () => {
        if (currentStageIndex > 0) {
            const prevStage = orderedStages[currentStageIndex - 1];
            setFormData((prev: any) => ({ ...prev, currentStage: prevStage.stage }));
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const [showNegativeModal, setShowNegativeModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [showPrintMenu, setShowPrintMenu] = useState(false);
    const [pendingTag, setPendingTag] = useState<any>(null);

    const handleUpdate = async (overrideData?: any) => {
        try {
            await updateMutation.mutateAsync({
                ...formData,
                ...overrideData,
                _id: studentId,
                // Ensure converted back to timestamps if backend expects numbers
                date: new Date(formData.date).getTime(),
                dob: formData.dob ? new Date(formData.dob).getTime() : undefined,
                followUpDate: formData.followUpDate ? new Date(formData.followUpDate).getTime() : undefined,
            });
            // Optionally show success toast
        } catch (error) {
            console.error('Failed to update student', error);
        }
    };

    const handleTagChange = (selectedTagValue: string) => {
        const tagObject = admissionMaster?.tags?.find((t: any) => (t.tag || t) === selectedTagValue);

        // If no tag found or just string, default behavior
        if (!tagObject) {
            handleChange('tag', selectedTagValue);
            return;
        }

        setPendingTag(tagObject);

        if (tagObject.label === 'positive') {
            // For positive tags, set the tag and open Follow Up Modal
            handleChange('tag', selectedTagValue);
            setShowFollowUpModal(true);
        } else {
            // For negative/other tags, open Negative Remark Modal first
            setShowNegativeModal(true);
        }
    };

    const handleNegativeTagSave = async (remark: string) => {
        const tagName = pendingTag?.tag || pendingTag;
        // Update local form data
        setFormData((prev: any) => ({ ...prev, tag: tagName, officialRemark: remark }));

        // Persist immediately
        await handleUpdate({ tag: tagName, officialRemark: remark });

        setShowNegativeModal(false);
        setPendingTag(null);
    };

    const handleNegativeModalClose = () => {
        setShowNegativeModal(false);
        setPendingTag(null);
        // We don't change the tag in formData, effectively reverting/ignoring the selection if it wasn't committed
    };

    if (!studentId) return null;

    if (isLoading) {
        return <div className="p-8 text-center bg-[var(--color-card)] rounded shadow text-[var(--color-muted-foreground)]">Loading student details...</div>;
    }

    if (!student) {
        return <div className="p-8 text-center bg-[var(--color-card)] rounded shadow text-[var(--color-muted-foreground)]">Student not found.</div>;
    }

    return (
        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="bg-[var(--color-card)] p-4 rounded-t-lg border-b border-[var(--color-border)]">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                            {formData.applicationNumber || 'Application No'}
                        </h2>
                        <div className="text-[var(--color-muted-foreground)] mt-1 font-medium">{formData.currentStage || 'Data Requested'}</div>
                    </div>
                    <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            <div className="bg-[var(--color-card)] p-4 rounded-b-lg shadow-sm border border-t-0 border-[var(--color-border)]">

                {/* Top Section */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    {/* Left Main Form - Taking up more space */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <Input
                            type="date"
                            label="Date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                        />
                        {/* TODO: Populate options from Master Data */}
                        <Select
                            label="Select School Name *"
                            options={schoolLevelList?.map((s: any) => ({ label: s.name || s, value: s.name || s })) || []}
                            value={formData.school || ''}
                            onChange={(e) => {
                                const selectedName = e.target.value;
                                handleChange('school', selectedName);
                                // Find and set the school object to update dependent dropdowns
                                const school = schoolLevelList?.find((s: any) => (s.name || s) === selectedName);
                                setSelectedSchoolData(school || null);
                                // Reset dependent fields
                                handleChange('course', '');
                                handleChange('stream', '');
                                handleChange('semester', '');
                            }}
                        />
                        <Select
                            label="Select Course *"
                            options={selectedSchoolData?.stream?.map((courseName: string) => ({ label: courseName, value: courseName })) || []}
                            value={formData.course || ''}
                            onChange={(e) => handleChange('course', e.target.value)}
                        />
                        <Select
                            label="Select Semester *"
                            options={selectedSchoolData?.batch?.map((batchName: string) => ({ label: batchName, value: batchName })) || []}
                            value={formData.semester || ''}
                            onChange={(e) => handleChange('semester', e.target.value)}
                        />
                        <Select
                            label="Select Fee Category"
                            options={admissionMaster?.feeCategories?.map((f: any) => ({ label: f.name || f, value: f.name || f })) || [{ label: 'General', value: 'General' }]}
                            value={formData.feeCategory || 'General'}
                            onChange={(e) => handleChange('feeCategory', e.target.value)}
                        />
                        <Select
                            label="Select Admission Category"
                            options={admissionMaster?.admissionCategories?.map((a: any) => ({ label: a.name || a, value: a.name || a })) || [{ label: 'Regular', value: 'Regular' }]}
                            value={formData.admissionCategory || 'Regular'}
                            onChange={(e) => handleChange('admissionCategory', e.target.value)}
                        />
                        <Select
                            label="Choose Source"
                            options={admissionMaster?.source?.map((s: any) => ({ label: s.name || s, value: s.name || s })) || []}
                            value={formData.source}
                            onChange={(e) => handleChange('source', e.target.value)}
                        />
                    </div>

                    {/* Right Action Card */}
                    <div className="w-full lg:w-80 bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-border)] flex flex-col gap-4 h-fit">



                        <div className="flex flex-col gap-2">
                            <Select
                                label="Choose Tag"
                                options={admissionMaster?.tags?.map((t: any) => ({ label: t.tag || t, value: t.tag || t })) || []}
                                value={formData.tag}
                                onChange={(e) => handleTagChange(e.target.value)}
                                className="w-full"
                            />
                            {/* Display Tag Bar */}
                            {formData.tag && (
                                <div
                                    className="w-full py-2 px-4 rounded text-white text-center font-bold shadow-sm uppercase tracking-wide text-xs"
                                    style={{
                                        backgroundColor: admissionMaster?.tags?.find((t: any) => (t.tag || t) === formData.tag)?.colour || '#3b82f6',
                                    }}
                                >
                                    {formData.tag}
                                </div>
                            )}
                        </div>

                        <Select
                            label=""
                            placeholder="Assign Counselor"
                            options={counselors?.map((c: any) => ({ label: c.name, value: c._id })) || []}
                            value={formData.counselorId}
                            onChange={(e) => handleChange('counselorId', e.target.value)}
                        />

                        <Button
                            className="w-full bg-[#1e429f] hover:bg-[#1e429f]/90 text-white"
                            onClick={() => handleUpdate()}
                            isLoading={updateMutation.isPending}
                        >
                            Update
                        </Button>
                    </div>
                </div>

                {/* Modals */}
                <NegativeTagModal
                    isOpen={showNegativeModal}
                    onClose={() => {
                        // Revert tag if cancelled
                        setFormData((prev: any) => ({ ...prev, tag: student?.tag }));
                        handleNegativeModalClose();
                    }}
                    onSave={handleNegativeTagSave}
                    title={`Add Remark for ${pendingTag?.tag || 'Tag'}`}
                />

                <ViewFollowUpModal
                    isOpen={showFollowUpModal}
                    onClose={() => {
                        // If we are in "Pending Tag" mode (user selected a new tag), and they close without success callback handling it...
                        // We check if pendingTag is set. If so, revert.
                        if (pendingTag) {
                            setFormData((prev: any) => ({ ...prev, tag: student?.tag }));
                            setPendingTag(null);
                        }
                        setShowFollowUpModal(false);
                    }}
                    student={student}
                    onSaveSuccess={async () => {
                        // If we have a pending tag, save it now
                        if (pendingTag) {
                            const tagName = pendingTag.tag || pendingTag;
                            await handleUpdate({ tag: tagName });
                            setPendingTag(null); // Clear pending so onClose doesn't revert
                        }
                    }}
                />

                {/* Personal Details Section */}
                {/* Core Details (Always Visible) */}
                <div className="mb-8 border-b pb-6">
                    <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">Core Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                        <Input
                            label="Primary Mobile (Student) *"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        <Input
                            label="Student's Name *"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>

                {/* Dynamic Fields Section */}
                {Object.entries(groupedFields).map(([groupName, fields]) => (
                    <div key={groupName} className="mb-8 border-b pb-6">
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">{groupName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                            {fields.map((field) => (
                                <div key={field.value}>
                                    {field.fieldType === 'select' ? (
                                        <Select
                                            label={field.name}
                                            value={formData[field.value] || ''}
                                            options={field.options?.map(opt => ({ label: opt, value: opt })) || []}
                                            onChange={(e) => handleChange(field.value, e.target.value)}
                                        />
                                    ) : (
                                        <Input
                                            label={field.name}
                                            type={field.fieldType === 'date' ? 'date' : field.fieldType === 'email' ? 'email' : 'text'}
                                            value={formData[field.value] || ''}
                                            onChange={(e) => handleChange(field.value, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end mb-4">
                    <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Age As on is: {formData.age || '-'}</span>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t pt-4">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-full px-6"
                        onClick={handlePreviousStage}
                        disabled={currentStageIndex <= 0}
                    >
                        <ArrowLeft size={16} /> Previous Stage
                    </Button>

                    <div className="flex gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowPrintMenu(!showPrintMenu)}
                                className='p-2 rounded-full border border-primary text-primary hover:bg-primary/10'
                                title="Print Options"
                            >
                                <Printer size={20} />
                            </button>

                            {showPrintMenu && (
                                <>
                                    {/* Backdrop to close on click outside */}
                                    <div
                                        className="fixed inset-0 z-[60]"
                                        onClick={() => setShowPrintMenu(false)}
                                    ></div>

                                    {/* Dropdown Menu */}
                                    <div className="absolute bottom-full mb-2 right-0 w-56 bg-[var(--color-card)] rounded-lg shadow-xl border border-[var(--color-border)] z-[70] overflow-hidden">
                                        <button
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--color-background)] flex items-center gap-3 text-[var(--color-foreground)] transition-colors"
                                            onClick={() => {
                                                if (studentId) {
                                                    const angularAppUrl = import.meta.env.VITE_ANGULAR_TEMPLATES_URL || 'http://localhost:4200';

                                                    const printWindow = window.open(
                                                        `${angularAppUrl}/print/open/printAdmissionForm`,
                                                        '_blank'
                                                    );

                                                    if (printWindow) {
                                                        const sendData = () => {
                                                            printWindow.postMessage(
                                                                {
                                                                    type: 'PRINT_ADMISSION_FORM',
                                                                    data: {
                                                                        studentId: studentId,
                                                                        entityId: entityId,
                                                                        session: session,
                                                                        entity: {
                                                                            _id: entityId,
                                                                            displayName: entityDetails?.displayName,
                                                                            logo: entityDetails?.logo,
                                                                        },
                                                                        entityPreferences: entityPreferences,
                                                                        entityType: 'school'
                                                                    }
                                                                },
                                                                angularAppUrl
                                                            );
                                                        };

                                                        setTimeout(sendData, 500);
                                                        setTimeout(sendData, 1000);
                                                        setTimeout(sendData, 2000);
                                                    }
                                                }
                                                setShowPrintMenu(false);
                                            }}
                                        >
                                            <Printer size={16} className="text-[var(--color-muted-foreground)]" />
                                            <span className="font-medium">Print Admission Form</span>
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--color-background)] flex items-center gap-3 text-[var(--color-foreground)] border-t border-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={() => {
                                                console.log('Print Timeline Clicked. Data:', timelineData);
                                                if (studentId) {
                                                    // Robust extraction: handle if data is wrapped
                                                    let finalTimeline = timelineData;
                                                    if (!Array.isArray(timelineData) && (timelineData as any)?.data) {
                                                        finalTimeline = (timelineData as any).data;
                                                    }

                                                    // Inject Counselor Name
                                                    const counselor = counselors?.find((c: any) => c._id === student?.counselorId);
                                                    const studentWithCounselor = {
                                                        ...student,
                                                        counselorName: counselor?.name || '-'
                                                    };

                                                    // Pass data via localStorage as per SourceWiseReport pattern
                                                    localStorage.setItem('print_student_data', JSON.stringify(studentWithCounselor));
                                                    // Default to empty array if missing to avoid crash
                                                    localStorage.setItem('print_timeline_data', JSON.stringify(finalTimeline || []));

                                                    const url = `/admission/print/open/studentTimeline`;
                                                    window.open(url, '_blank');
                                                }
                                                setShowPrintMenu(false);
                                            }}
                                        >
                                            <Printer size={16} className="text-[#1e429f]" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">Print Timeline</span>
                                                {!timelineData && <span className="text-[10px] text-[var(--color-muted-foreground)]">Loading data...</span>}
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            className="bg-[#1e429f] hover:bg-[#1e429f]/90 text-white min-w-[120px]"
                            onClick={() => handleUpdate()}
                            isLoading={updateMutation.isPending}
                        >
                            Update
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-full px-6"
                        onClick={handleNextStage}
                        disabled={currentStageIndex >= orderedStages.length - 1}
                    >
                        Next Stage <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ViewAdmissionDetails;
