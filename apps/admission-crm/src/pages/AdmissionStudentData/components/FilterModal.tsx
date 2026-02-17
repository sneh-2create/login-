import { useState, useEffect, useMemo } from 'react';
import { Button, Dropdown, DatePicker, Checkbox, Toggle } from '@od-erp/ui';
import { X, Calendar, BookOpen, Target, Users, ArrowRightIcon } from 'lucide-react';
import { AdmissionStudentDataPayload } from '@od-erp/types';
import { useCourses, useSources, useCounselors } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (_filters: Partial<AdmissionStudentDataPayload>) => void;
    currentFilters: Partial<AdmissionStudentDataPayload>;
    stages: string[];
}

const FilterModal = ({ isOpen, onClose, onApply, currentFilters, stages }: FilterModalProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    
    // Display Names
    const displayNames = {
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    };

    const [filters, setFilters] = useState<Partial<AdmissionStudentDataPayload>>(currentFilters);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [showMemberDetails, setShowMemberDetails] = useState(false);

    // Fetch data for dropdowns
    const { data: courses } = useCourses(entityId, session);
    const { data: sources } = useSources(entityId, session);
    const { data: counselors } = useCounselors(entityId, 'counselor');

    // Client-side filtering for streams and batches from course data
    const streams = useMemo(() => {
        if (!selectedCourses.length || !courses) return [];
        
        // Get unique streams from all selected courses
        const allStreams = selectedCourses.flatMap(courseName => {
            const course = courses.find((c: any) => c.name === courseName);
            return course ? (course.stream || course.streams || []) : [];
        });
        
        return Array.from(new Set(allStreams));
    }, [courses, selectedCourses]);

    const batches = useMemo(() => {
        if (!selectedCourses.length || !courses) return [];
        
        // Get unique batches from all selected courses
        const allBatches = selectedCourses.flatMap(courseName => {
            const course = courses.find((c: any) => c.name === courseName);
            return course ? (course.batch || course.batches || []) : [];
        });
        
        return Array.from(new Set(allBatches));
    }, [courses, selectedCourses]);

    // Tags list (from viewAdmissionMaster)
    const tags = [
        { tag: 'Hot', colour: '#ff4444' },
        { tag: 'Warm', colour: '#ff8800' },
        { tag: 'Cold', colour: '#4444ff' },
        { tag: 'Positive', colour: '#00aa00' },
        { tag: 'Negative', colour: '#aa0000' },
    ];

    // Engagement Status options
    const engagementStatusList = [
        { name: 'Not Engaged', value: 'notEngaged' },
        { name: 'Engaged with pending follow up', value: 'engagedWithPendingFollowUp' },
        { name: 'Engaged with completed follow up', value: 'engagedWithCompletedFollowUp' }
    ];

    useEffect(() => {
        setFilters(currentFilters);
        setSelectedCourses(Array.isArray(currentFilters.course) ? currentFilters.course : (currentFilters.course ? [currentFilters.course] : []));
    }, [currentFilters]);

    // Auto-select streams when courses change
    useEffect(() => {
        if (selectedCourses.length > 0 && streams.length > 0) {
            // Auto-select all available streams for the selected courses
            setFilters(prev => ({ ...prev, stream: streams }));
        }
    }, [streams, selectedCourses.length]);

    const handleChange = (field: keyof AdmissionStudentDataPayload, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));

        // Handle cascading dropdowns
        if (field === 'course') {
            setSelectedCourses(value || []);
            setFilters(prev => ({ ...prev, course: value, stream: undefined, batch: undefined }));
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate' | 'updatedAtStartDate' | 'updatedAtEndDate', date: Date | null) => {
        if (date) {
            const dateObj = new Date(date);
            
            // Set to beginning of day for start dates (00:00:00.000)
            if (field === 'startDate' || field === 'updatedAtStartDate') {
                dateObj.setHours(0, 0, 0, 0);
            }
            
            // Set to end of day for end dates (23:59:59.999)
            if (field === 'endDate' || field === 'updatedAtEndDate') {
                dateObj.setHours(23, 59, 59, 999);
            }
            
            const timestamp = dateObj.getTime();
            setFilters(prev => ({ ...prev, [field]: timestamp }));
        } else {
            setFilters(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleApply = () => {
        const processedFilters = { ...filters };
        
        // Add memberDetails if toggle is on
        if (showMemberDetails) {
            processedFilters.memberDetails = true;
        }

        onApply(processedFilters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Application Data Filters</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-3 py-2">
                    <div className="space-y-6">
                        {/* Section 1: Date Filters */}
                        <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Date Filters</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <DatePicker
                                    label="Start Date"
                                    value={filters.startDate ? new Date(filters.startDate) : null}
                                    onChange={(date) => handleDateChange('startDate', date)}
                                    placeholder="dd/mm/yyyy"
                                />
                                <DatePicker
                                    label="End Date"
                                    value={filters.endDate ? new Date(filters.endDate) : null}
                                    onChange={(date) => handleDateChange('endDate', date)}
                                    placeholder="dd/mm/yyyy"
                                    minDate={filters.startDate ? new Date(filters.startDate) : undefined}
                                />
                                <DatePicker
                                    label="Updated At Start"
                                    value={filters.updatedAtStartDate ? new Date(filters.updatedAtStartDate) : null}
                                    onChange={(date) => handleDateChange('updatedAtStartDate', date)}
                                    placeholder="dd/mm/yyyy"
                                />
                                <DatePicker
                                    label="Updated At End"
                                    value={filters.updatedAtEndDate ? new Date(filters.updatedAtEndDate) : null}
                                    onChange={(date) => handleDateChange('updatedAtEndDate', date)}
                                    placeholder="dd/mm/yyyy"
                                    minDate={filters.updatedAtStartDate ? new Date(filters.updatedAtStartDate) : undefined}
                                />
                            </div>
                        </div>

                        {/* Section 2: Academic, Batch & Source */}
                        <div className="bg-purple-50 rounded-xl px-3 py-2 border border-purple-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Academic, Batch & Source</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Dropdown
                                    label={`${displayNames.course}`}
                                    multiple
                                    value={filters.course || []}
                                    onChange={(val) => handleChange('course', (val as string[]).length > 0 ? val : undefined)}
                                    options={(courses || []).map((course: any) => ({ 
                                        label: course.name.toUpperCase(), 
                                        value: course.name 
                                    }))}
                                    placeholder={`Select ${displayNames.course}`}
                                />

                                <Dropdown
                                    label={`Select ${displayNames.stream}`}
                                    multiple
                                    value={filters.stream || []}
                                    onChange={(val) => handleChange('stream', (val as string[]).length > 0 ? val : undefined)}
                                    options={(streams || []).map((stream: string) => ({ 
                                        label: stream.toUpperCase(), 
                                        value: stream 
                                    }))}
                                    placeholder={`Select ${displayNames.stream}`}
                                    disabled={!selectedCourses.length}
                                />

                                <Dropdown
                                    label="Choose Source"
                                    multiple
                                    value={filters.source || []}
                                    onChange={(val) => handleChange('source', (val as string[]).length > 0 ? val : undefined)}
                                    options={(sources || []).map((source: string) => ({ 
                                        label: source, 
                                        value: source 
                                    }))}
                                    placeholder="Select Source"
                                />
                            </div>

                            {entityPreferences.showBatch && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <Dropdown
                                        label={displayNames.batch}
                                        multiple
                                        value={filters.batch || []}
                                        onChange={(val) => handleChange('batch', (val as string[]).length > 0 ? val : undefined)}
                                        options={(batches || []).map((batch: string) => ({ 
                                            label: batch.toUpperCase(), 
                                            value: batch 
                                        }))}
                                        placeholder={`Select ${displayNames.batch}`}
                                        disabled={!selectedCourses.length || !(filters.stream as string[])?.length}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Section 3: Stage & Engagement */}
                        <div className="bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Stage & Engagement</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Dropdown
                                    label="Select Stage"
                                    value={filters.stage || ''}
                                    onChange={(val) => handleChange('stage', val || undefined)}
                                    options={stages.map(stage => ({ label: stage, value: stage }))}
                                    placeholder="Select Stage"
                                />

                                <Dropdown
                                    label="Engagement Status"
                                    multiple
                                    value={filters.engagementStatus || []}
                                    onChange={(val) => handleChange('engagementStatus', (val as string[]).length > 0 ? val : undefined)}
                                    options={engagementStatusList.map(status => ({ 
                                        label: status.name, 
                                        value: status.value 
                                    }))}
                                    placeholder="Select Status"
                                />
                            </div>
                        </div>

                        {/* Section 4: Counselor & Tag */}
                        <div className="bg-orange-50 rounded-xl px-3 py-2 border border-orange-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-500 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Counselor & Tag</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Dropdown
                                    label="Select Counselor"
                                    value={filters.counselorId || ''}
                                    onChange={(val) => handleChange('counselorId', val || undefined)}
                                    options={(counselors || []).map((counselor: any) => ({ 
                                        label: counselor.name, 
                                        value: counselor._id 
                                    }))}
                                    placeholder="Select Counselor"
                                />

                                <Dropdown
                                    label="Select Tag"
                                    multiple
                                    value={filters.tag || []}
                                    onChange={(val) => handleChange('tag', (val as string[]).length > 0 ? val : undefined)}
                                    options={tags.map(tag => ({ label: tag.tag, value: tag.tag }))}
                                    placeholder="Select Tag"
                                />
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <Toggle
                                    label="Show Member Details"
                                    checked={showMemberDetails}
                                    onChange={(e) => setShowMemberDetails(e.target.checked)}
                                />

                                {permissions.includes('isAdmissionAdmin') && (
                                    <Checkbox
                                        label="No Counselor"
                                        checked={filters.noCounselor || false}
                                        onChange={(checked) => handleChange('noCounselor', checked)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <Button 
                        variant="primary" 
                        onClick={handleApply}
                        className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                        Go <ArrowRightIcon className="w-5 h-5 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
