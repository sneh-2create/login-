import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Printer, Flag } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';
import {
    useAdmissionMaster,
    useCourses,
    useCounselors,
    useAdmissionStageSetup,
    useAddAdmissionStudentData,
    useEditAdmissionStudentData,
    useViewAdmissionStudentData,
    useViewFeeMasterData,
    useListSubjectCombination,
    useListNepSubject,
    useListPartnerInstitute,
} from '@od-erp/query';
import { Input, Dropdown, Checkbox, Button, Badge } from '@od-erp/ui';
import { ALL_STUDENT_FIELDS } from '@od-erp/constants';
import { FieldRenderer } from './FieldRenderer';
import { admissionStudentDataService } from '@od-erp/api-client';

interface AddApplicationDataPanelProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    studentId?: string;
    onSuccess: () => void;
}

interface FormData {
    _id?: string;
    date: string;
    course: string;
    stream: string;
    batch: string;
    applicationNumber: string;
    category: string;
    oldNew: string;
    source: string;
    partnerInstitute: string;
    subjectCombination: string;
    mdcSubject: string;
    aecSubject: string;
    secSubject: string;
    vacSubject: string;
    name: string;
    phone: string;
    [key: string]: any;
    currentStage: string;
    tags: string[];
    counselorId: string;
    followUpDate: string;
    totalPaid: number;
    registrationAnalytics: boolean;
    admissionAnalytics: boolean;
    withdrawalAnalytics: boolean;
    addToStudentFlag: boolean;
}

const AddApplicationDataPanel = ({
    isOpen,
    onClose,
    mode,
    studentId,
    onSuccess,
}: AddApplicationDataPanelProps) => {
    // Redux State
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences);
    const permissions = useAppSelector((state) => state.auth.permissions) || [];

    // Display Names
    const displayNames = useMemo(
        () => ({
            course:
                entityPreferences?.displayNames?.find((item: any) => item.value === 'course')?.name ||
                'Class',
            stream:
                entityPreferences?.displayNames?.find((item: any) => item.value === 'stream')?.name ||
                'Stream',
            batch:
                entityPreferences?.displayNames?.find((item: any) => item.value === 'batch')?.name ||
                'Batch',
            category:
                entityPreferences?.displayNames?.find((item: any) => item.value === 'category')?.name ||
                'Category',
            oldNew:
                entityPreferences?.displayNames?.find((item: any) => item.value === 'oldNew')?.name ||
                'Old/New',
        }),
        [entityPreferences]
    );

    // Form State
    const [formData, setFormData] = useState<FormData>({
        date: new Date().toISOString().split('T')[0],
        course: '',
        stream: '',
        batch: '',
        applicationNumber: '',
        category: '',
        oldNew: '',
        source: '',
        partnerInstitute: '',
        subjectCombination: '',
        mdcSubject: '',
        aecSubject: '',
        secSubject: '',
        vacSubject: '',
        name: '',
        phone: '',
        currentStage: 'Registered',
        tags: [],
        counselorId: '',
        followUpDate: '',
        totalPaid: 0,
        registrationAnalytics: false,
        admissionAnalytics: false,
        withdrawalAnalytics: false,
        addToStudentFlag: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [copyCorrespondenceAddress, setCopyCorrespondenceAddress] = useState(false);
    const [selectedSchoolData, setSelectedSchoolData] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [duplicateStudents, setDuplicateStudents] = useState<any[]>([]);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [showPrintMenu, setShowPrintMenu] = useState(false);
    const [showVisitRemarkModal, setShowVisitRemarkModal] = useState(false);
    const [visitRemark, setVisitRemark] = useState('');
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpRemark, setFollowUpRemark] = useState('');
    const [showNegativeTagModal, setShowNegativeTagModal] = useState(false);
    const [negativeTagRemark, setNegativeTagRemark] = useState('');

    // Queries
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);
    const { data: schoolLevelList } = useCourses(entityId, session);
    const { data: counselors } = useCounselors(entityId, 'counselor');
    const { data: stageSetup } = useAdmissionStageSetup(entityId, session);
    const { data: studentData } = useViewAdmissionStudentData(studentId || '');

    // Dynamic data queries
    const { data: feeMaster } = useViewFeeMasterData(entityId, session);
    const { data: partnerInstitutes } = useListPartnerInstitute(entityId);
    const { data: subjectCombinations } = useListSubjectCombination(
        entityId,
        session,
        formData.course,
        formData.stream,
        entityPreferences?.showBatch ? formData.batch : undefined
    );
    const { data: nepSubjects } = useListNepSubject(
        entityId,
        session,
        formData.course,
        formData.stream,
        entityPreferences?.showBatch ? formData.batch : undefined
    );

    // Mutations
    const addMutation = useAddAdmissionStudentData();
    const editMutation = useEditAdmissionStudentData();

    // Stage Management
    const currentStageIndex = useMemo(() => {
        if (!stageSetup || !formData.currentStage) return 0;
        return stageSetup.findIndex((s: any) => s.stage === formData.currentStage);
    }, [stageSetup, formData.currentStage]);

    const isFirstStage = currentStageIndex === 0;
    const isFinalStage = currentStageIndex === (stageSetup?.length || 1) - 1;
    
    const currentStageConfig = useMemo(() => {
        if (!stageSetup || currentStageIndex < 0) return null;
        return stageSetup[currentStageIndex];
    }, [stageSetup, currentStageIndex]);

    const txnRequiredFlag = (currentStageConfig as any)?.transactionRequired || false;
    const txnPaidFlag = formData.totalPaid > 0;

    // Permission checks
    const canViewPhone = permissions.includes('viewAdmissionPhoneNumber');

    // Tag color display
    const selectedTag = useMemo(() => {
        if (!formData.tags || formData.tags.length === 0) return null;
        return admissionMaster?.tags?.find((t: any) => t.tag === formData.tags[0]);
    }, [formData.tags, admissionMaster]);

    // Filter NEP subjects by type
    const mdcList = useMemo(() => {
        return nepSubjects?.filter((s: any) => s.nepSubjectType === 'MDC') || [];
    }, [nepSubjects]);

    const aecList = useMemo(() => {
        return nepSubjects?.filter((s: any) => s.nepSubjectType === 'AEC') || [];
    }, [nepSubjects]);

    const secList = useMemo(() => {
        return nepSubjects?.filter((s: any) => s.nepSubjectType === 'SEC') || [];
    }, [nepSubjects]);

    const vacList = useMemo(() => {
        return nepSubjects?.filter((s: any) => s.nepSubjectType === 'VAC') || [];
    }, [nepSubjects]);

    // Visibility flags based on data availability
    const showListPartnerInstitute = partnerInstitutes && partnerInstitutes.length > 0;

    // Age calculation function
    // Calculate age in detailed format (Angular parity)
    const calculateAge = (dob: string, referenceDate?: string): string => {
        if (!dob) return '';
        
        const birthDate = new Date(dob);
        const refDate = referenceDate ? new Date(referenceDate) : new Date();
        
        let years = refDate.getFullYear() - birthDate.getFullYear();
        let months = refDate.getMonth() - birthDate.getMonth();
        let days = refDate.getDate() - birthDate.getDate();
        
        if (days < 0) {
            months--;
            const lastMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
            days += lastMonth.getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        return `${years} years, ${months} months, and ${days} days old.`;
    };

    // Calculate age when DOB or date changes
    useEffect(() => {
        if (formData.dob) {
            // Use admission date as reference for age calculation
            const ageString = calculateAge(formData.dob, formData.date);
            setFormData(prev => ({ ...prev, ageAtAdmission: ageString }));
        }
    }, [formData.dob, formData.date]);

    // Load student data in edit mode
    useEffect(() => {
        if (mode === 'edit' && studentData) {
            setFormData({
                ...formData, // Start with default values
                ...studentData, // Override with student data
                // Fix date timezone - use local date string
                date: studentData.date
                    ? new Date(new Date(studentData.date).getTime() + new Date(studentData.date).getTimezoneOffset() * 60000).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                followUpDate: studentData.followUpDate
                    ? new Date(studentData.followUpDate).toISOString().split('T')[0]
                    : '',
                tags: Array.isArray(studentData.tags) 
                    ? studentData.tags.map((t: any) => typeof t === 'string' ? t : t.tag)
                    : [],
                // Ensure required fields have defaults
                batch: studentData.batch || '',
                category: studentData.category || '',
                oldNew: studentData.oldNew || '',
                partnerInstitute: studentData.partnerInstitute || '',
                subjectCombination: studentData.subjectCombinationName || studentData.subjectCombination || '',
                // Map NEP subjects from API response (mdcName -> mdcSubject)
                mdcSubject: studentData.mdcName || studentData.mdcSubject || '',
                aecSubject: studentData.aecName || studentData.aecSubject || '',
                secSubject: studentData.secName || studentData.secSubject || '',
                vacSubject: studentData.vacName || studentData.vacSubject || '',
                applicationNumber: studentData.applicationNumber || '',
            });
        }
    }, [mode, studentData]);

    // Fetch stage counselor when stage changes (Angular parity)
    useEffect(() => {
        const fetchStageCounselor = async () => {
            const currentStageConfig = stageSetup?.find((s: any) => s.stage === formData.currentStage);
            
            if (currentStageConfig?.stageCounselor && currentStageConfig.stageCounselor.length > 0) {
                try {
                    const counselorData = await admissionStudentDataService.getStageCounselor({
                        entity: entityId,
                        stageCounselor: currentStageConfig.stageCounselor
                    });
                    
                    setFormData(prev => ({
                        ...prev,
                        stageCounselorId: counselorData.id,
                        stageCounselorName: counselorData.name,
                        stageCounselorMobile: counselorData.mobile,
                        stageCounselorEmail: counselorData.email
                    }));
                } catch (error) {
                    console.error('Failed to fetch stage counselor:', error);
                }
            }
        };
        
        if (mode === 'edit' && formData.currentStage && stageSetup) {
            fetchStageCounselor();
        }
    }, [formData.currentStage, stageSetup, entityId, mode]);

    // Update selected school when course changes
    useEffect(() => {
        if (formData.course && schoolLevelList) {
            const school = schoolLevelList.find((s: any) => (s.name || s) === formData.course);
            setSelectedSchoolData(school || null);
        }
    }, [formData.course, schoolLevelList]);

    // Copy correspondence address
    useEffect(() => {
        if (copyCorrespondenceAddress) {
            setFormData((prev) => ({
                ...prev,
                corAddress: prev.address,
                corCity: prev.city,
                corState: prev.state,
                corDistrict: prev.district,
                corPinCode: prev.pinCode,
                corCountry: prev.country,
            }));
        }
    }, [copyCorrespondenceAddress, formData.address, formData.city, formData.state]);

    // Duplicate detection function (Angular parity)
    const checkForDuplicates = async (phone: string) => {
        if (phone.length === 10 && mode === 'add') {
            try {
                const response = await admissionStudentDataService.listAdmissionStudentData({
                    entity: entityId,
                    session,
                    searchBy: 'phone',
                    search: phone,
                    pageNumber: 1,
                    pageSize: 10
                });
                
                if (response.data && response.data.length > 0) {
                    setDuplicateStudents(response.data);
                    setShowDuplicateModal(true);
                }
            } catch (error) {
                console.error('Duplicate check failed:', error);
            }
        }
    };

    // Handlers
    const handleChange = (field: string, value: any) => {
        // Find field configuration for validation
        const fieldConfig = ALL_STUDENT_FIELDS.find(f => f.value === field);
        
        // Validate field if configuration exists
        if (fieldConfig && typeof value === 'string') {
            const error = validateField(fieldConfig, value);
            if (error) {
                setErrors(prev => ({ ...prev, [field]: error }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        } else if (errors[field]) {
            // Clear error if no validation needed
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Check for duplicates on phone input (Angular parity)
        if (field === 'phone' && typeof value === 'string') {
            checkForDuplicates(value);
        }

        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.course) newErrors.course = `${displayNames.course} is required`;
        if (!formData.stream) newErrors.stream = 'Stream is required';
        if (!formData.source) newErrors.source = 'Source is required';

        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 10 digits';
        }

        if (entityPreferences?.counselorRequired && !formData.counselorId) {
            newErrors.counselorId = 'Counselor is required';
        }

        if (entityPreferences?.subjectCombination && !formData.subjectCombination) {
            newErrors.subjectCombination = 'Subject Combination is required';
        }

        if (entityPreferences?.partnerInstitute && !formData.partnerInstitute) {
            newErrors.partnerInstitute = 'Partner Institute is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Advanced Field Validators
    const validators = {
        alphaNumeric: (value: string) => {
            return /^[a-zA-Z0-9\s]*$/.test(value) ? null : 'Only letters and numbers allowed';
        },
        
        numericOnly: (value: string) => {
            return /^\d*$/.test(value) ? null : 'Only numbers allowed';
        },
        
        minLength: (min: number) => (value: string) => {
            if (!value) return null;
            return value.length >= min ? null : `Minimum ${min} characters required`;
        },
        
        maxLength: (max: number) => (value: string) => {
            if (!value) return null;
            return value.length <= max ? null : `Maximum ${max} characters allowed`;
        }
    };

    const validateField = (field: any, value: string): string | null => {
        // Min length
        if (field.minLength && value) {
            const error = validators.minLength(field.minLength)(value);
            if (error) return error;
        }
        
        // Max length
        if (field.maxLength && value) {
            const error = validators.maxLength(field.maxLength)(value);
            if (error) return error;
        }
        
        // Pattern validation
        if (field.pattern === 'alphaNumeric' && value) {
            const error = validators.alphaNumeric(value);
            if (error) return error;
        }
        
        if (field.pattern === 'numeric' && value) {
            const error = validators.numericOnly(value);
            if (error) return error;
        }
        
        return null;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const payload = {
                ...formData,
                entity: entityId,
                session: session,
                date: new Date(formData.date).getTime(),
                followUpDate: formData.followUpDate ? new Date(formData.followUpDate).getTime() : undefined,
            };

            if (mode === 'add') {
                await addMutation.mutateAsync(payload);
            } else {
                await editMutation.mutateAsync({ ...payload, _id: studentId });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save student data:', error);
        }
    };

    // Stage Navigation
    const handlePreviousStage = async () => {
        if (isFirstStage || !stageSetup) return;
        
        setIsProcessing(true);
        try {
            const prevStage = stageSetup[currentStageIndex - 1];
            await editMutation.mutateAsync({
                ...formData,
                currentStage: prevStage.stage,
                _id: studentId,
            });
            setFormData(prev => ({ ...prev, currentStage: prevStage.stage }));
            onSuccess();
        } catch (error) {
            console.error('Failed to move to previous stage:', error);
            alert('Failed to move to previous stage');
        } finally {
            setIsProcessing(false);
        }
    };

    const checkSeatAvailability = async (): Promise<boolean> => {
        if (!entityPreferences?.seatManagement) return true;

        try {
            await admissionStudentDataService.getAdmissionStudentDataStageCount({
                entity: entityId,
                session: session,
                course: formData.course,
                stream: formData.stream,
                category: formData.category,
                oldNew: formData.oldNew,
                stages: ['Approved'],
            });

            // Get total seats from configuration (this would come from seat setup)
            // For now, we'll assume seats are available
            // In production, you'd fetch seat configuration and compare
            // const filledSeats = (response as any)?.data?.count || 0;
            
            return true; // Placeholder - implement actual seat checking
        } catch (error) {
            console.error('Failed to check seat availability:', error);
            return true; // Allow progression on error
        }
    };

    // Handle Next Stage (Angular parity)
    const handleNextStage = async () => {
        if (!formData._id || !stageSetup || currentStageIndex < 0) return;

        // Check if we're already at the final stage
        if (isFinalStage) {
            alert('Already at final stage');
            return;
        }

        const nextStageConfig = stageSetup[currentStageIndex + 1];
        if (!nextStageConfig) {
            alert('No next stage found');
            return;
        }

        // Check if next stage requires seat validation
        const checkSeatsFlag = (nextStageConfig as any).checkSeats;
        
        if (checkSeatsFlag) {
            // Validate required fields for seat check
            if (!formData.course || !formData.stream || !formData.category || !formData.oldNew) {
                alert('Please add Course, Stream, Category and Old/New to check seats');
                return;
            }

            // Check seat availability
            const hasSeats = await checkSeatAvailability();
            if (!hasSeats) {
                alert('No more seats are available in selected course');
                return;
            }
        }

        // Move to next stage
        setIsProcessing(true);
        try {
            const updatedData = {
                ...formData,
                currentStage: nextStageConfig.stage,
                // Clear stage counselor (will be refetched if configured)
                stageCounselorId: null,
                stageCounselorName: null,
                stageCounselorMobile: null,
                stageCounselorEmail: null,
                _id: studentId,
            };

            await editMutation.mutateAsync(updatedData);
            
            // Update local state
            setFormData(prev => ({
                ...prev,
                currentStage: nextStageConfig.stage,
                stageCounselorId: null,
                stageCounselorName: null,
                stageCounselorMobile: null,
                stageCounselorEmail: null,
            }));

            // Fetch new stage counselor if configured
            if (nextStageConfig.stageCounselor && nextStageConfig.stageCounselor.length > 0) {
                try {
                    const counselorData = await admissionStudentDataService.getStageCounselor({
                        entity: entityId,
                        stageCounselor: nextStageConfig.stageCounselor
                    });
                    
                    setFormData(prev => ({
                        ...prev,
                        stageCounselorId: counselorData.id,
                        stageCounselorName: counselorData.name,
                        stageCounselorMobile: counselorData.mobile,
                        stageCounselorEmail: counselorData.email
                    }));
                } catch (error) {
                    console.error('Failed to fetch stage counselor:', error);
                }
            }

            onSuccess();
        } catch (error) {
            console.error('Failed to move to next stage:', error);
            alert('Failed to move to next stage');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!formData._id) return;

        const remark = prompt('Please enter rejection reason:');
        if (!remark) return;

        setIsProcessing(true);
        try {
            await editMutation.mutateAsync({
                ...formData,
                currentStage: 'Rejected',
                rejectionRemark: remark,
                _id: studentId,
            });
            setFormData(prev => ({ ...prev, currentStage: 'Rejected' }));
            onSuccess();
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Failed to reject admission');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdrawn = async () => {
        if (!formData._id || formData.currentStage !== 'Approved') return;

        const confirmed = confirm('Are you sure you want to mark this admission as withdrawn?');
        if (!confirmed) return;

        setIsProcessing(true);
        try {
            await editMutation.mutateAsync({
                ...formData,
                currentStage: 'Withdrawn',
                _id: studentId,
            });
            setFormData(prev => ({ ...prev, currentStage: 'Withdrawn' }));
            onSuccess();
        } catch (error) {
            console.error('Failed to mark as withdrawn:', error);
            alert('Failed to mark as withdrawn');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReOpen = async () => {
        if (!formData._id || formData.currentStage !== 'Rejected') return;

        setIsProcessing(true);
        try {
            // Re-open to the first stage
            const firstStage = stageSetup?.[0]?.stage || 'Registered';
            await editMutation.mutateAsync({
                ...formData,
                currentStage: firstStage,
                _id: studentId,
            });
            setFormData(prev => ({ ...prev, currentStage: firstStage }));
            onSuccess();
        } catch (error) {
            console.error('Failed to re-open:', error);
            alert('Failed to re-open admission');
        } finally {
            setIsProcessing(false);
        }
    };

    // Add To Student Flag
    const handleAddToStudentFlag = async () => {
        if (!formData._id || formData.currentStage !== 'Approved') return;

        setIsProcessing(true);
        try {
            await editMutation.mutateAsync({
                ...formData,
                addToStudentFlag: true,
                _id: studentId,
            });
            setFormData(prev => ({ ...prev, addToStudentFlag: true }));
            onSuccess();
        } catch (error) {
            console.error('Failed to add to student flag:', error);
            alert('Failed to add to student flag');
        } finally {
            setIsProcessing(false);
        }
    };

    // Analytics Toggle
    const toggleAnalytics = async (type: 'registration' | 'admission' | 'withdrawal') => {
        if (!formData._id) return;

        const field = `${type}Analytics`;
        const newValue = !formData[field];

        setIsProcessing(true);
        try {
            await editMutation.mutateAsync({
                ...formData,
                [field]: newValue,
                _id: studentId,
            });
            setFormData(prev => ({ ...prev, [field]: newValue }));
        } catch (error) {
            console.error(`Failed to toggle ${type} analytics:`, error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Print Handlers
    const handlePrintAdmissionForm = () => {
        setShowPrintMenu(false);
        // TODO: Implement print admission form logic
        console.log('Print Admission Form for student:', formData._id);
        alert('Print Admission Form functionality will be implemented');
    };

    const handlePrintTimeline = () => {
        setShowPrintMenu(false);
        // TODO: Implement print timeline logic
        console.log('Print Timeline for student:', formData._id);
        alert('Print Timeline functionality will be implemented');
    };

    // Save & Add Visit
    const handleSaveAndAddVisit = () => {
        setShowVisitRemarkModal(true);
    };

    const handleVisitRemarkSubmit = async () => {
        if (!visitRemark.trim()) {
            alert('Please enter a visit remark');
            return;
        }

        if (!validateForm()) return;

        setIsProcessing(true);
        try {
            // Save student
            const payload = {
                ...formData,
                entity: entityId,
                session: session,
            };
            const response = await addMutation.mutateAsync(payload);

            // TODO: Add visit log API call when available
            console.log('Student saved, visit log would be created:', {
                studentId: response.data._id,
                remark: visitRemark
            });

            setShowVisitRemarkModal(false);
            setVisitRemark('');
            onSuccess();
        } finally {
            setIsProcessing(false);
        }
    };

    // Duplicate Detection
    // TODO: Re-enable duplicate detection for dynamic fields
    /* const checkDuplicate = async (field: string, value: string) => {
        if (!value || !value.trim()) return;
        
        // Skip check in edit mode for unchanged values
        if (mode === 'edit' && studentData && studentData[field] === value) return;
        
        try {
            const response = await admissionStudentDataService.checkDuplicate({
                entity: entityId,
                session: session,
                field: field,
                value: value,
                excludeId: formData._id || '' // Don't flag current student as duplicate
            });
            
            if (response?.duplicates?.length > 0) {
                setDuplicateWarning({
                    field,
                    value,
                    duplicates: response.duplicates
                });
                setShowDuplicateModal(true);
            }
        } catch (error) {
            console.error('Duplicate check failed:', error);
            // Don't block user if API fails
        }
    }; */

    // Follow-Up Modal Handler
    const handleFollowUpSubmit = async () => {
        if (!followUpDate || !followUpRemark.trim()) {
            alert('Please enter follow-up date and remark');
            return;
        }
        
        try {
            await admissionStudentDataService.addAdmissionFollowUp({
                studentData: formData._id,
                followUpDate: new Date(followUpDate).getTime(),
                remark: followUpRemark,
                entity: entityId,
                session: session
            });
            
            setShowFollowUpModal(false);
            setFollowUpDate('');
            setFollowUpRemark('');
        } catch (error) {
            console.error('Failed to add follow-up:', error);
            alert('Failed to add follow-up');
        }
    };

    // Negative Tag Modal Handler
    const handleNegativeTagSubmit = () => {
        if (!negativeTagRemark.trim()) {
            alert('Please enter a remark');
            return;
        }
        
        setFormData(prev => ({ ...prev, negativeTagRemark: negativeTagRemark }));
        setShowNegativeTagModal(false);
        setNegativeTagRemark('');
    };

    // Tag Change Handler
    const handleTagChange = (tagValue: string | number | (string | number)[]) => {
        // Convert to string since tags are always strings
        const tagString = String(tagValue);
        const tag = admissionMaster?.tags?.find((t: any) => t.tag === tagString);
        
        setFormData(prev => ({ ...prev, tags: [tagString] }));
        
        // Show modal based on tag type
        if (tag?.type === 'positive') {
            setShowFollowUpModal(true);
        } else if (tag?.type === 'negative') {
            setShowNegativeTagModal(true);
        }
    };

    const handleClose = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            course: '',
            stream: '',
            batch: '',
            applicationNumber: '',
            category: '',
            oldNew: '',
            source: '',
            partnerInstitute: '',
            subjectCombination: '',
            mdcSubject: '',
            aecSubject: '',
            secSubject: '',
            vacSubject: '',
            name: '',
            phone: '',
            currentStage: 'Registered',
            tags: [],
            counselorId: '',
            followUpDate: '',
            totalPaid: 0,
            registrationAnalytics: false,
            admissionAnalytics: false,
            withdrawalAnalytics: false,
            addToStudentFlag: false,
        });
        setErrors({});
        setPaymentAmount('');
        onClose();
    };


    const groupedFields = useMemo(() => {
        const currentStageConfig = stageSetup?.find((s: any) => s.stage === formData.currentStage);
        const stageFields = currentStageConfig?.fields || [];
        
        // Fallback: show ALL fields if no config (matching View form)
        if (!stageFields.length) {
            const groups: { [key: string]: any[] } = {};
            ALL_STUDENT_FIELDS.forEach((field) => {
                if (!groups[field.groupBy]) {
                    groups[field.groupBy] = [];
                }
                groups[field.groupBy].push(field);
            });
            return groups;
        }
        
        const allowedFieldKeys = new Set(stageFields.map((f: any) => f.key));
        const visible = ALL_STUDENT_FIELDS.filter(f => allowedFieldKeys.has(f.value));
        
        const groups: { [key: string]: any[] } = {};
        visible.forEach(field => {
            if (!groups[field.groupBy]) {
                groups[field.groupBy] = [];
            }
            groups[field.groupBy].push(field);
        });
        
        return groups;
    }, [formData.currentStage, stageSetup]);




    const checkPermission = (permission: string) => permissions.includes(permission);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
                    isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
                }`}
                onClick={handleClose}
            />

            {/* Sliding Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-5xl bg-white shadow-2xl transform transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {mode === 'add' ? 'Add Application Data' : formData.applicationNumber || 'Edit Application'}
                            </h2>
                            {mode === 'edit' && (
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <span>
                                        Current Stage: <Badge variant="primary">{formData.currentStage}</Badge>
                                    </span>
                                    {formData.totalPaid > 0 && (
                                        <span>
                                            Total Paid: <span className="font-medium text-green-600">₹{formData.totalPaid}</span>
                                        </span>
                                    )}
                                    {formData.nextFollowUpDate && (
                                        <span>
                                            Next Follow-Up: <span className="font-medium text-blue-600">
                                                {new Date(formData.nextFollowUpDate).toLocaleDateString('en-GB')}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Print Button with Dropdown (Edit mode only) */}
                            {mode === 'edit' && formData._id && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowPrintMenu(!showPrintMenu)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <Printer size={18} />
                                        <span>Print</span>
                                    </button>
                                    
                                    {showPrintMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                            <div className="py-1">
                                                <button
                                                    onClick={handlePrintAdmissionForm}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    Print Admission Form
                                                </button>
                                                <button
                                                    onClick={handlePrintTimeline}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    Print Timeline
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {/* Payment Section (if transaction required but not paid) */}
                            {mode === 'edit' && txnRequiredFlag && !txnPaidFlag && checkPermission('saveAdmissionTransaction') && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-4">Payment Required</h3>
                                    <div className="flex items-end gap-4">
                                        <Input
                                            label="Total Payable Amount"
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            containerClassName="flex-1"
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                // Implement payment logic
                                                alert('Payment functionality to be implemented');
                                            }}
                                            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                                        >
                                            PAY ₹{paymentAmount || '0'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Analytics Flags (Edit mode only) */}
                            {mode === 'edit' && formData._id && entityPreferences?.showAnalyticsModule && (
                                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Analytics Tracking</h3>
                                    <div className="flex gap-6">
                                        {/* Registration Analytics */}
                                        <button
                                            onClick={() => toggleAnalytics('registration')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                                formData.registrationAnalytics
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 bg-white text-gray-600 hover:border-blue-300'
                                            }`}
                                        >
                                            <Flag size={20} className={formData.registrationAnalytics ? 'fill-blue-500' : ''} />
                                            <span className="font-medium">Registration</span>
                                        </button>

                                        {/* Admission Analytics - Only when Approved */}
                                        {formData.currentStage === 'Approved' && (
                                            <button
                                                onClick={() => toggleAnalytics('admission')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                                    formData.admissionAnalytics
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
                                                }`}
                                            >
                                                <Flag size={20} className={formData.admissionAnalytics ? 'fill-green-500' : ''} />
                                                <span className="font-medium">Admission</span>
                                            </button>
                                        )}

                                        {/* Withdrawal Analytics - Only when Withdrawn */}
                                        {formData.currentStage === 'Withdrawn' && (
                                            <button
                                                onClick={() => toggleAnalytics('withdrawal')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                                    formData.withdrawalAnalytics
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
                                                }`}
                                            >
                                                <Flag size={20} className={formData.withdrawalAnalytics ? 'fill-red-500' : ''} />
                                                <span className="font-medium">Withdrawal</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Course Selection Form */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Selection</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Input
                                        type="date"
                                        label="Date *"
                                        value={formData.date}
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            
                                            if (entityPreferences?.disableBackDateAdmission && selectedDate < today) {
                                                alert('Back-dated admission is not allowed');
                                                return;
                                            }
                                            
                                            handleChange('date', e.target.value);
                                        }}
                                        min={entityPreferences?.disableBackDateAdmission ? new Date().toISOString().split('T')[0] : undefined}
                                        disabled={true}
                                        error={errors.date}
                                    />

                                    <Dropdown
                                        label={`${displayNames.course} *`}
                                        options={
                                            schoolLevelList?.map((s: any) => ({
                                                label: s.name || s,
                                                value: s.name || s,
                                            })) || []
                                        }
                                        value={formData.course}
                                        onChange={(value) => {
                                            handleChange('course', value);
                                            handleChange('stream', '');
                                            handleChange('batch', '');
                                        }}
                                        error={errors.course}
                                        placeholder={`Select ${displayNames.course}`}
                                        searchable
                                    />

                                    {formData.course && <Dropdown
                                        label={`${displayNames.stream} *`}
                                        options={
                                            selectedSchoolData?.stream?.map((s: string) => ({
                                                label: s,
                                                value: s,
                                            })) || []
                                        }
                                        value={formData.stream}
                                        onChange={(value) => handleChange('stream', value)}
                                        error={errors.stream}
                                        placeholder={`Select ${displayNames.stream}`}
                                        disabled={!formData.course}
                                        searchable
                                    />}

                                    {formData.course && entityPreferences?.showBatch && (
                                        <Dropdown
                                            label={displayNames.batch}
                                            options={
                                                selectedSchoolData?.batch?.map((b: string) => ({
                                                    label: b,
                                                    value: b,
                                                })) || []
                                            }
                                            value={formData.batch}
                                            onChange={(value) => handleChange('batch', value)}
                                            placeholder={`Select ${displayNames.batch}`}
                                            disabled={!formData.course}
                                            searchable
                                        />
                                    )}

                                    <Input
                                        label="Application Number"
                                        value={formData.applicationNumber}
                                        onChange={(e) => handleChange('applicationNumber', e.target.value)}
                                        error={errors.applicationNumber}
                                    />

                                    <Dropdown
                                        label={displayNames.category}
                                        options={
                                            feeMaster?.category?.map((c: string) => ({
                                                label: c.toUpperCase(),
                                                value: c,
                                            })) || []
                                        }
                                        value={formData.category}
                                        onChange={(value) => handleChange('category', value)}
                                        searchable
                                        placeholder={`Select ${displayNames.category}`}
                                    />

                                    <Dropdown
                                        label={displayNames.oldNew}
                                        options={
                                            feeMaster?.oldNew?.map((item: string) => ({
                                                label: item.toUpperCase(),
                                                value: item,
                                            })) || []
                                        }
                                        value={formData.oldNew}
                                        onChange={(value) => handleChange('oldNew', value)}
                                        placeholder={`Select ${displayNames.oldNew}`}
                                    />

                                    
                                        <Dropdown
                                            label="Source *"
                                            options={
                                                admissionMaster?.source?.map((s: any) => ({
                                                    label: s.name || s,
                                                    value: s.name || s,
                                                })) || []
                                            }
                                            value={formData.source}
                                            onChange={(value) => handleChange('source', value)}
                                            error={errors.source}
                                            placeholder="Select Source"
                                            searchable
                                        />


                                    {showListPartnerInstitute && (
                                        <Input
                                            label="Partner Institute"
                                            value={formData.partnerInstitute}
                                            onChange={(e) => handleChange('partnerInstitute', e.target.value)}
                                            error={errors.partnerInstitute}
                                        />
                                    )}

                                        {subjectCombinations && subjectCombinations.length > 0 && (
                                            <Dropdown
                                                label="Subject Combination"
                                                options={
                                                    subjectCombinations?.map((sc: any) => ({
                                                        label: sc.name || sc,
                                                        value: sc.name || sc,
                                                    })) || []
                                                }
                                                value={formData.subjectCombination}
                                                onChange={(value) => handleChange('subjectCombination', value)}
                                                error={errors.subjectCombination}
                                                placeholder="Select Subject Combination"
                                                searchable
                                            />
                                        )}

                                        {mdcList.length > 0 && (
                                            <Dropdown
                                                label="MDC Subject"
                                                options={
                                                    mdcList?.map((s: any) => ({
                                                        label: s.name || s,
                                                        value: s.name || s,
                                                    })) || []
                                                }
                                                value={formData.mdcSubject}
                                                onChange={(value) => handleChange('mdcSubject', value)}
                                                placeholder="Select MDC Subject"
                                                searchable
                                            />
                                        )}
                                        {aecList.length > 0 && (
                                            <Dropdown
                                                label="AEC Subject"
                                                options={
                                                    aecList?.map((s: any) => ({
                                                        label: s.name || s,
                                                        value: s.name || s,
                                                    })) || []
                                                }
                                                value={formData.aecSubject}
                                                onChange={(value) => handleChange('aecSubject', value)}
                                                placeholder="Select AEC Subject"
                                                searchable
                                            />
                                        )}
                                        {secList.length > 0 && (
                                            <Dropdown
                                                label="SEC Subject"
                                                options={
                                                    secList?.map((s: any) => ({
                                                        label: s.name || s,
                                                        value: s.name || s,
                                                    })) || []
                                                }
                                                value={formData.secSubject}
                                                onChange={(value) => handleChange('secSubject', value)}
                                                placeholder="Select SEC Subject"
                                                searchable
                                            />
                                        )}
                                        {vacList.length > 0 && (
                                            <Dropdown
                                                label="VAC Subject"
                                                options={
                                                    vacList?.map((s: any) => ({
                                                        label: s.name || s,
                                                        value: s.name || s,
                                                    })) || []
                                                }
                                                value={formData.vacSubject}
                                                onChange={(value) => handleChange('vacSubject', value)}
                                                placeholder="Select VAC Subject"
                                                searchable
                                            />
                                        )}
                                </div>
                            </div>



                            {/* Dynamic Student Fields */}
                            {Object.entries(groupedFields).map(([groupName, fields]) => (
                                <div key={groupName} className="mb-8 border-b pb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{groupName}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                                        {fields.map((field) => (
                                            <div key={field.value}>
                                                <FieldRenderer
                                                    field={field}
                                                    value={formData[field.value]}
                                                    onChange={(value) => handleChange(field.value, value)}
                                                    error={errors[field.value]}
                                                    canViewPhone={canViewPhone}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {groupName === 'Contact Details' && (
                                        <Checkbox
                                            label="Same as Permanent Address"
                                            checked={copyCorrespondenceAddress}
                                            onChange={(e) => setCopyCorrespondenceAddress(e.target.checked)}
                                            containerClassName="mt-4"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Side Panel Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                    <Dropdown
                                        label="Select Tag"
                                        options={
                                            admissionMaster?.tags?.map((t: any) => ({
                                                label: t.tag || t,
                                                value: t.tag || t,
                                            })) || []
                                        }
                                        value={formData.tags[0] || ''}
                                        onChange={(value) => handleTagChange(value)}
                                        placeholder="Select Tag"
                                        searchable
                                    />

                                    <Dropdown
                                        label="Assign Counselor"
                                        options={
                                            counselors?.map((c: any) => ({
                                                label: c.name,
                                                value: c._id,
                                            })) || []
                                        }
                                        value={formData.counselorId}
                                        onChange={(value) => handleChange('counselorId', value)}
                                        error={errors.counselorId}
                                        placeholder="Select Counselor"
                                        searchable
                                    />
                                    
                                    {/* Tag Color Display */}
                                    {selectedTag && (
                                        <div className="flex items-center">
                                            <div 
                                                className="inline-flex items-center px-3 py-2 rounded-full text-white text-sm font-medium"
                                                style={{ backgroundColor: selectedTag.colour || '#6B7280' }}
                                            >
                                                {selectedTag.tag}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Age Display for Schools/Colleges */}
                                    {formData.ageAtAdmission && (
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Age:</span> {formData.ageAtAdmission}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Action Buttons */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            {/* Left: Stage Navigation */}
                            <div className="flex gap-2">
                                {mode === 'edit' && formData._id && !isFinalStage && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handlePreviousStage}
                                            disabled={isFirstStage || isProcessing}
                                        >
                                            <ChevronLeft size={16} className="mr-1" />
                                            Previous Stage
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleNextStage}
                                            disabled={isProcessing || (txnRequiredFlag && !txnPaidFlag)}
                                        >
                                            Next Stage
                                            <ChevronRight size={16} className="ml-1" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Right: Primary Actions */}
                            <div className="flex gap-3">
                                {/* Print Button (Edit mode only) */}
                                {mode === 'edit' && formData._id && checkPermission('editAdmissionStudentData') && (
                                    <Button variant="outline">
                                        <Printer size={16} className="mr-1" />
                                        Print
                                    </Button>
                                )}

                                {/* Reject Button */}
                                {mode === 'edit' && formData._id && formData.currentStage !== 'Rejected' && checkPermission('editAdmissionStudentData') && (
                                    <Button variant="outline" onClick={handleReject} disabled={isProcessing}>
                                        Reject
                                    </Button>
                                )}

                                {/* Re-Open Button (Rejected only) */}
                                {mode === 'edit' && formData.currentStage === 'Rejected' && (
                                    <Button variant="primary" onClick={handleReOpen} disabled={isProcessing}>
                                        Re-Open
                                    </Button>
                                )}

                                {/* Withdrawn Button (Approved only) */}
                                {mode === 'edit' && formData.currentStage === 'Approved' && (
                                    <Button variant="outline" onClick={handleWithdrawn} disabled={isProcessing}>
                                        Withdrawn
                                    </Button>
                                )}

                                {/* Add To Student Flag (Approved only, not yet added) */}
                                {mode === 'edit' && formData.currentStage === 'Approved' && !formData.addToStudentFlag && (
                                    <Button variant="primary" onClick={handleAddToStudentFlag} disabled={isProcessing}>
                                        Add To Student Flag
                                    </Button>
                                )}

                                {/* Next Stage Button (Angular parity - not final stage, not approved/rejected) */}
                                {mode === 'edit' && formData._id && !isFinalStage && 
                                 formData.currentStage !== 'Approved' && formData.currentStage !== 'Rejected' && 
                                 checkPermission('editAdmissionStudentData') && (
                                    <Button variant="primary" onClick={handleNextStage} disabled={isProcessing}>
                                        Next Stage
                                    </Button>
                                )}

                                {/* Save/Update Button */}
                                {formData.currentStage !== 'Approved' && formData.currentStage !== 'Rejected' && formData.currentStage !== 'Withdrawn' && (
                                    <>
                                        <Button variant="outline" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleSave}
                                            isLoading={addMutation.isPending || editMutation.isPending}
                                            disabled={isProcessing || (mode === 'edit' && txnRequiredFlag && !txnPaidFlag)}
                                        >
                                            {mode === 'add' ? 'Save' : 'Update'}
                                        </Button>
                                        
                                        {/* Save & Add Visit (Add mode only) */}
                                        {mode === 'add' && (
                                            <Button
                                                variant="outline"
                                                onClick={handleSaveAndAddVisit}
                                                disabled={isProcessing}
                                            >
                                                Save & Add Visit
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Visit Remark Modal */}
            {showVisitRemarkModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Visit Remark</h3>
                        <Input
                            label="Visit Remark *"
                            value={visitRemark}
                            onChange={(e) => setVisitRemark(e.target.value)}
                            placeholder="Enter visit remark"
                            containerClassName="mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowVisitRemarkModal(false);
                                    setVisitRemark('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleVisitRemarkSubmit}
                                disabled={!visitRemark.trim() || isProcessing}
                                isLoading={isProcessing}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Follow-Up Modal */}
            {showFollowUpModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Follow-Up</h3>
                        <Input
                            label="Follow-Up Date *"
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            containerClassName="mb-4"
                        />
                        <Input
                            label="Remark *"
                            value={followUpRemark}
                            onChange={(e) => setFollowUpRemark(e.target.value)}
                            placeholder="Enter follow-up remark"
                            containerClassName="mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowFollowUpModal(false);
                                    setFollowUpDate('');
                                    setFollowUpRemark('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleFollowUpSubmit}
                                disabled={!followUpDate || !followUpRemark.trim()}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Negative Tag Modal */}
            {showNegativeTagModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Negative Tag Remark</h3>
                        <Input
                            label="Remark *"
                            value={negativeTagRemark}
                            onChange={(e) => setNegativeTagRemark(e.target.value)}
                            placeholder="Enter remark for negative tag"
                            containerClassName="mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowNegativeTagModal(false);
                                    setNegativeTagRemark('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleNegativeTagSubmit}
                                disabled={!negativeTagRemark.trim()}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Students Modal */}
            {showDuplicateModal && duplicateStudents.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Duplicate Students Found</h3>
                        </div>
                        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
                            <p className="text-sm text-gray-600 mb-4">
                                {duplicateStudents.length} student(s) found with this phone number:
                            </p>
                            <div className="space-y-3">
                                {duplicateStudents.map((student, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>{' '}
                                                <span className="text-gray-900">{student.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Phone:</span>{' '}
                                                <span className="text-gray-900">{student.phone}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Course:</span>{' '}
                                                <span className="text-gray-900">{student.course}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Stage:</span>{' '}
                                                <span className="text-gray-900">{student.currentStage}</span>
                                            </div>
                                            {student.applicationNumber && (
                                                <div>
                                                    <span className="font-medium text-gray-700">App No:</span>{' '}
                                                    <span className="text-gray-900">{student.applicationNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <Button variant="outline" onClick={() => setShowDuplicateModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddApplicationDataPanel;
