import { useEffect, useState, useMemo } from 'react';
import { Button, Input, Dropdown, Toggle } from '@od-erp/ui';
import {
    useCourses,
    useCourseData,
    useFeeMasterData,
    useAdmissionMaster,
    useStudentMaster,
    useSubjectCombinations,
    useAdmissionStudentDataStageCount,
    useMoveAdmissionStudentData,
    useSessions
} from '@od-erp/query';
import { AdmissionLead } from '@od-erp/types';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';

interface MoveApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: AdmissionLead | null;
    onSuccess?: () => void;
}

interface FormData {
    toEntity: string;
    toSession: string;
    course: string;
    stream: string;
    section: string;
    batch: string;
    category: string;
    oldNew: string;
    regNo: string;
    autoRegNo: boolean;
    subjectCombination?: any;
    doa?: Date;
}

const MoveApplicationModal = ({ isOpen, onClose, student, onSuccess }: MoveApplicationModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};
    const user = useAppSelector((state) => state.auth.user) as any;
    const entityGroup = user?.entityGroup || [];
    const qac = useAppSelector((state) => state.auth.entityDetails?.qac) || '';
    
    // Display names from entity preferences
    const displayNames = useMemo(() => ({
        regNo: entityPreferences.displayNames?.find((item: any) => item.value === 'regNo')?.name || 'Registration No',
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
        category: entityPreferences.displayNames?.find((item: any) => item.value === 'category')?.name || 'Category',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        oldNew: entityPreferences.displayNames?.find((item: any) => item.value === 'oldNew')?.name || 'Old/New',
        subjectCombination: entityPreferences.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
    }), [entityPreferences]);

    // Stage-based flags
    const [rejectionFlag, setRejectionFlag] = useState(false);
    const [withdrawnFlag, setWithdrawnFlag] = useState(false);

    // Form state - start with empty entity (matching Move Application modal)
    const [formData, setFormData] = useState<FormData>({
        toEntity: '',
        toSession: '',
        course: '',
        stream: '',
        section: '',
        batch: '',
        category: '',
        oldNew: '',
        regNo: '',
        autoRegNo: false,
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedEntityQac, setSelectedEntityQac] = useState('');
    const [newEntityPreference, setNewEntityPreference] = useState<any>(null);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [branchId, setBranchId] = useState('');
    const [showSelectSubject, setShowSelectSubject] = useState(false);
    const [showApplicationNumberButton, setShowApplicationNumberButton] = useState(false);
    const [showAutoGenerateToggle, setShowAutoGenerateToggle] = useState(false);
    const [showBoth, setShowBoth] = useState(false);

    // Seat availability state
    const [totalSeats, setTotalSeats] = useState(0);
    const [filledSeats, setFilledSeats] = useState(0);
    const [vacantSeats, setVacantSeats] = useState(0);
    const [disableSeat, setDisableSeat] = useState(false);

    // Queries - fetch sessions based on selected entity
    const { data: sessions } = useSessions(formData.toEntity);
    const { data: courses } = useCourses(formData.toEntity, formData.toSession);
    const { data: courseData } = useCourseData(selectedCourseId, !!selectedCourseId);
    const { data: feeMasterData } = useFeeMasterData(formData.toEntity, formData.toSession, !!formData.toEntity && !!formData.toSession);
    const { data: admissionMaster } = useAdmissionMaster(formData.toEntity, formData.toSession);
    const { data: studentMaster } = useStudentMaster(formData.toEntity, formData.toSession, !!formData.toEntity && !!formData.toSession);
    const { data: subjectCombinations } = useSubjectCombinations(
        formData.toEntity,
        formData.toSession,
        formData.course,
        formData.stream,
        !!formData.course && !!formData.stream
    );

    // Seat count query
    const seatCountEnabled = !!(formData.course && formData.stream && formData.category && formData.oldNew && !rejectionFlag && !withdrawnFlag);
    const { data: seatCount } = useAdmissionStudentDataStageCount(
        {
            course: formData.course,
            stream: formData.stream,
            category: formData.category,
            oldNew: formData.oldNew,
            stages: ['Approved'],
            entity: formData.toEntity,
            session: formData.toSession,
        },
        seatCountEnabled
    );

    // Mutation
    const moveStudentMutation = useMoveAdmissionStudentData();

    // Initialize stage flags
    useEffect(() => {
        if (student) {
            const currentStage = student.currentStage || 'Approved';
            
            switch (currentStage) {
                case 'Rejected':
                    setRejectionFlag(true);
                    setWithdrawnFlag(false);
                    break;
                case 'Withdrawn':
                    setWithdrawnFlag(true);
                    setRejectionFlag(false);
                    break;
                case 'Approved':
                    setRejectionFlag(false);
                    setWithdrawnFlag(false);
                    break;
                default:
                    setRejectionFlag(false);
                    setWithdrawnFlag(false);
            }

            // Set reg no button/toggle visibility
            if (entityPreferences?.regNoOnApprove) {
                if (entityPreferences.regNoOnApprove === 'applicationNumber') {
                    setShowApplicationNumberButton(true);
                } else {
                    setShowAutoGenerateToggle(true);
                }
            } else {
                setShowBoth(true);
            }
        }
    }, [student, entityPreferences]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Reset all form data when modal is closed
            setFormData({
                toEntity: '',
                toSession: '',
                course: '',
                stream: '',
                section: '',
                batch: '',
                category: '',
                oldNew: '',
                regNo: '',
                autoRegNo: false,
            });
            setSelectedCourseId('');
            setNewEntityPreference(null);
            setSelectedEntityQac('');
            setBranchId('');
            setTotalSeats(0);
            setFilledSeats(0);
            setVacantSeats(0);
            setDisableSeat(false);
        }
    }, [isOpen]);

    // Helper function to check if entity should be disabled (matching Angular's checkDisability)
    const checkDisability = (entity: any) => {
        return entity.entityId === entityId;
    };

    // Handle course data loading
    useEffect(() => {
        if (courseData) {
            setFormData(prev => ({
                ...prev,
                stream: '',
                section: '',
                batch: '',
                regNo: '',
                autoRegNo: false,
            }));
            setBranchId(courseData.branchId || '');
        }
    }, [courseData]);

    // Handle subject combinations
    useEffect(() => {
        if (subjectCombinations && subjectCombinations.length > 0) {
            setShowSelectSubject(true);
            // Pre-select if student already has one
            if (student?.subjectCombinationName) {
                const existing = subjectCombinations.find((sc: any) => sc.name === student.subjectCombinationName);
                if (existing) {
                    setFormData(prev => ({ ...prev, subjectCombination: existing }));
                }
            }
        } else {
            setShowSelectSubject(false);
            setFormData(prev => ({ ...prev, subjectCombination: undefined }));
        }
    }, [subjectCombinations, student]);

    // Handle seat availability
    useEffect(() => {
        if (seatCountEnabled && admissionMaster?.seats) {
            const matchingSeat = admissionMaster.seats.find((seat: any) =>
                seat.course === formData.course &&
                seat.stream === formData.stream &&
                seat.category === formData.category &&
                seat.oldNew === formData.oldNew
            );

            if (matchingSeat) {
                setTotalSeats(matchingSeat.total || 0);
                const filled = seatCount || 0;
                setFilledSeats(filled);
                setVacantSeats((matchingSeat.total || 0) - filled);
                
                if (filled >= (matchingSeat.total || 0)) {
                    setDisableSeat(true);
                    alert('No more seats are available in selected course');
                } else {
                    setDisableSeat(false);
                }
            } else {
                setTotalSeats(0);
                setFilledSeats(0);
                setVacantSeats(0);
                setDisableSeat(false);
            }
        }
    }, [seatCount, formData.course, formData.stream, formData.category, formData.oldNew, admissionMaster, seatCountEnabled]);

    const handleEntityChange = (value: string | number | (string | number)[]) => {
        const entityValue = Array.isArray(value) ? value[0] as string : value as string;
        const selectedEntity = entityGroup.find((e: any) => e.entityId === entityValue);
        
        if (selectedEntity) {
            setFormData(prev => ({
                ...prev,
                toEntity: entityValue,
                toSession: '',
                course: '',
                stream: '',
                section: '',
                batch: '',
                category: '',
                oldNew: '',
                regNo: '',
            }));
            setSelectedEntityQac(selectedEntity.qac || '');
            setNewEntityPreference(entityPreferences);
        }
    };

    const handleSessionChange = (value: string | number | (string | number)[]) => {
        const sessionValue = Array.isArray(value) ? value[0] as string : value as string;
        setFormData(prev => ({
            ...prev,
            toSession: sessionValue,
            course: '',
            stream: '',
            section: '',
            batch: '',
            category: '',
            oldNew: '',
            regNo: '',
        }));
    };

    const handleCourseChange = (value: string | number | (string | number)[]) => {
        const courseName = Array.isArray(value) ? value[0] as string : value as string;
        const course = courses?.find((c: any) => c.name === courseName);
        
        if (course) {
            setSelectedCourseId(course._id);
            setFormData(prev => ({
                ...prev,
                course: courseName,
                stream: '',
                section: '',
                batch: '',
                regNo: '',
                autoRegNo: false,
            }));
        }
    };

    const handleStreamChange = (value: string | number | (string | number)[]) => {
        const streamValue = Array.isArray(value) ? value[0] as string : value as string;
        setFormData(prev => ({ ...prev, stream: streamValue }));
    };

    const handleAutoGenerateToggle = () => {
        if (!formData.autoRegNo) {
            // Enabling auto-generate
            if (!formData.course) {
                alert('Please select course first');
                return;
            }
            if (!formData.stream) {
                alert('Please select Stream first');
                return;
            }
            if (entityPreferences.showBatch && !formData.batch) {
                alert('Please select batch first');
                return;
            }

            // Generate registration number
            if (studentMaster?.regNo) {
                const regNoConfig = studentMaster.regNo.find((r: any) =>
                    (Array.isArray(r.course) ? r.course.includes(formData.course) : r.course === formData.course) &&
                    (Array.isArray(r.stream) ? r.stream.includes(formData.stream) : r.stream === formData.stream)
                );

                if (regNoConfig) {
                    const generatedRegNo = `${regNoConfig.prefix || ''}${regNoConfig.number || ''}${regNoConfig.suffix || ''}`;
                    setFormData(prev => ({ ...prev, regNo: generatedRegNo, autoRegNo: true }));
                } else {
                    alert('Course not Exist in Auto Generated Setting');
                    return;
                }
            }
        } else {
            // Disabling auto-generate
            setFormData(prev => ({ ...prev, regNo: '', autoRegNo: false }));
        }
    };

    const handleAssignApplicationNumber = () => {
        if (student?.applicationNumber) {
            setFormData(prev => ({ ...prev, regNo: student.applicationNumber || '' }));
        }
    };

    const validateForm = (): boolean => {
        if (rejectionFlag || withdrawnFlag) {
            // Minimal validation for rejected/withdrawn
            if (!formData.toEntity || !formData.toSession) {
                alert('Please select entity and session');
                return false;
            }
            return true;
        }

        // Full validation for approved
        if (!formData.course) {
            alert('Please select ' + displayNames.course);
            return false;
        }
        if (!formData.stream) {
            alert('Please select ' + displayNames.stream);
            return false;
        }
        if (!formData.section) {
            alert('Please select Section');
            return false;
        }
        if (entityPreferences.showBatch && !formData.batch) {
            alert('Please select ' + displayNames.batch);
            return false;
        }
        if (!formData.category) {
            alert('Please select ' + displayNames.category);
            return false;
        }
        if (!formData.oldNew) {
            alert('Please select ' + displayNames.oldNew);
            return false;
        }
        if (!formData.regNo) {
            alert('Please enter ' + displayNames.regNo);
            return false;
        }

        // Pattern validation for regNo
        const regNoPattern = /^[.a-zA-Z0-9-!?'@()`~=+_;:#*$^<>/ ]*$/;
        if (!regNoPattern.test(formData.regNo)) {
            alert('Invalid String Pattern for Registration Number');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!student) return;
        if (!validateForm()) return;

        setIsLoading(true);
        setLoadingMessage('Updating Data');

        try {
            const payload: any = {
                applicationId: student._id,
                applicationNumber: student.applicationNumber,
                toEntity: formData.toEntity,
                toSession: formData.toSession,
                toStage: 'Approved',
                toEntityQAC: selectedEntityQac || qac,
                oldAutoVoucher: entityPreferences.autoVoucher,
                newAutoVoucher: newEntityPreference?.autoVoucher || entityPreferences.autoVoucher,
            };

            // Add session end date
            const selectedSession = sessions?.find((s: any) => s.name === formData.toSession);
            if (selectedSession) {
                payload.toSessionEndDate = selectedSession.endDate;
            }

            // Add course details if not rejected/withdrawn
            if (!rejectionFlag && !withdrawnFlag) {
                payload.course = formData.course;
                payload.stream = formData.stream;
                payload.section = formData.section;
                payload.batch = formData.batch || (entityPreferences.showBatch ? '' : 'NA');
                payload.category = formData.category;
                payload.oldNew = formData.oldNew;
                payload.regNo = formData.regNo;
                payload.autoRegNo = formData.autoRegNo;
                payload.branchId = branchId;
                payload.doa = new Date();
                
                if (formData.subjectCombination) {
                    payload.subjectCombination = formData.subjectCombination;
                }
            }

            // Simulate multi-step loading (matching Angular)
            if (!rejectionFlag && !withdrawnFlag) {
                setTimeout(() => {
                    setLoadingMessage('Approving Application');
                    setTimeout(() => {
                        setLoadingMessage('Adding Student');
                        setTimeout(() => {
                            setLoadingMessage('Moving Application');
                            setTimeout(() => {
                                setLoadingMessage('Adjusting Transactions');
                            }, 2000);
                        }, 2000);
                    }, 2000);
                }, 2000);
            }

            await moveStudentMutation.mutateAsync(payload);

            // Check if withdrawn and prompt for refund
            if (student.currentStage === 'Withdrawn' && student.studentId) {
                const refund = window.confirm('Do you want to refund?');
                if (refund) {
                    // Navigate to refund page
                    window.location.href = `/fee/refund?studentId=${student.studentId}`;
                }
            }

            alert('Application has been successfully moved');
            
            // Reset form data after successful save
            setFormData({
                toEntity: '',
                toSession: '',
                course: '',
                stream: '',
                section: '',
                batch: '',
                category: '',
                oldNew: '',
                regNo: '',
                autoRegNo: false,
            });
            
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Failed to move application:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to move application';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <ArrowRight className="mr-2 h-5 w-5 text-blue-600" />
                        Move Student Application {student.applicationNumber}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
                        <X size={24} />
                    </button>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-lg font-medium text-gray-700">{loadingMessage}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="px-3 py-2 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Dropdown
                                label="Select Entity"
                                options={entityGroup.map((e: any) => ({ 
                                    label: e.name, 
                                    value: e.entityId,
                                    disabled: checkDisability(e)  // Disable current entity
                                }))}
                                value={formData.toEntity}
                                onChange={handleEntityChange}
                            />
                        </div>

                        {/* Session Selection */}
                        <div>
                            <Dropdown
                                label="Select Session"
                                options={sessions?.map((s: any) => ({ label: s.name.toUpperCase(), value: s.name })) || []}
                                value={formData.toSession}
                                onChange={handleSessionChange}
                            />
                        </div>

                        {/* Course Details - Only show if not rejected/withdrawn */}
                        {!rejectionFlag && !withdrawnFlag && (
                            <>
                                <div>
                                    <Dropdown
                                        label={`Select ${displayNames.course}`}
                                        options={courses?.map((c: any) => ({ label: c.name.toUpperCase(), value: c.name })) || []}
                                        value={formData.course}
                                        onChange={handleCourseChange}
                                    />
                                </div>

                                <div>
                                    <Dropdown
                                        label={`Select ${displayNames.stream}`}
                                        options={courseData?.stream?.map((s: string) => ({ label: s.toUpperCase(), value: s })) || []}
                                        value={formData.stream}
                                        onChange={handleStreamChange}
                                    />
                                </div>

                                <div>
                                    <Dropdown
                                        label="Select Section"
                                        options={courseData?.section?.map((s: string) => ({ label: s.toUpperCase(), value: s })) || []}
                                        value={formData.section}
                                        onChange={(value) => setFormData(prev => ({ ...prev, section: Array.isArray(value) ? value[0] as string : value as string }))}
                                    />
                                </div>

                                {entityPreferences.showBatch && (
                                    <div>
                                        <Dropdown
                                            label={displayNames.batch}
                                            options={courseData?.batch?.map((b: string) => ({ label: b.toUpperCase(), value: b })) || []}
                                            value={formData.batch}
                                            onChange={(value) => setFormData(prev => ({ ...prev, batch: Array.isArray(value) ? value[0] as string : value as string }))}
                                        />
                                    </div>
                                )}

                                <div>
                                    <Dropdown
                                        label={`Select ${displayNames.category}`}
                                        options={feeMasterData?.category?.map((c: string) => ({ label: c.toUpperCase(), value: c })) || []}
                                        value={formData.category}
                                        onChange={(value) => setFormData(prev => ({ ...prev, category: Array.isArray(value) ? value[0] as string : value as string }))}
                                    />
                                </div>

                                <div>
                                    <Dropdown
                                        label={`Select ${displayNames.oldNew}`}
                                        options={feeMasterData?.oldNew?.map((o: string) => ({ label: o.toUpperCase(), value: o })) || []}
                                        value={formData.oldNew}
                                        onChange={(value) => setFormData(prev => ({ ...prev, oldNew: Array.isArray(value) ? value[0] as string : value as string }))}
                                    />
                                </div>

                                {showSelectSubject && (
                                    <div>
                                        <Dropdown
                                            label={displayNames.subjectCombination}
                                            options={subjectCombinations?.map((sc: any) => ({ label: sc.name, value: sc })) || []}
                                            value={formData.subjectCombination}
                                            onChange={(value) => setFormData(prev => ({ ...prev, subjectCombination: value }))}
                                        />
                                    </div>
                                )}

                                <div>
                                    <Input
                                        label={`${displayNames.regNo} *`}
                                        placeholder={displayNames.regNo}
                                        value={formData.regNo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, regNo: e.target.value }))}
                                        disabled={formData.autoRegNo}  // Disable when auto-generate is on
                                    />
                                </div>

                                {(showBoth || showAutoGenerateToggle) && (
                                    <div className="flex items-center pt-2">
                                        <Toggle
                                            label="Auto Generate"
                                            checked={formData.autoRegNo}
                                            onChange={handleAutoGenerateToggle}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Seat Availability */}
                    {!rejectionFlag && !withdrawnFlag && seatCountEnabled && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Seats</p>
                                    <p className="text-2xl font-bold text-blue-600">{totalSeats}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Filled Seats</p>
                                    <p className="text-2xl font-bold text-orange-600">{filledSeats}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Vacant Seats</p>
                                    <p className="text-2xl font-bold text-green-600">{vacantSeats}</p>
                                </div>
                            </div>
                            {disableSeat && (
                                <div className="mt-3 flex items-center justify-center text-red-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span className="text-sm font-medium">No more seats available</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex justify-between gap-2">
                    <div>
                        {(showBoth || showApplicationNumberButton) && !rejectionFlag && !withdrawnFlag && (
                            <Button variant="outline" onClick={handleAssignApplicationNumber} disabled={isLoading}>
                                Assign Application Number
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isLoading || disableSeat}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoveApplicationModal;
