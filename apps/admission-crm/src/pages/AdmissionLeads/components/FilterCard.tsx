import React, { useState, useEffect, useMemo } from 'react';
import { Button, SelectSingle, DatePicker, MultiSelect, Checkbox } from '@od-erp/ui';
import { useCounselors, useAdmissionMaster, useCourses } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { X } from 'lucide-react';

interface FilterCardProps {
    onClose: () => void;
    onApply: (_filters: any, _globalSearch: boolean) => void;
    initialFilters: any;
    initialGlobalSearch: boolean;
}

const FilterCard: React.FC<FilterCardProps> = ({ onClose, onApply, initialFilters, initialGlobalSearch }) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const session = useAppSelector((state) => state.session.academicSession) || '';
    
    const entityPreferences = useAppSelector((state: any) => state.auth.entityPreferences);
    const getDisplayName = (key: string) => {
        return entityPreferences?.displayNames?.find((d: any) => d.value === key)?.name || key.charAt(0).toUpperCase() + key.slice(1);
    };
    
    // Master Data
    const { data: counselors } = useCounselors(entityId, 'counselor');
    const { data: admissionMaster } = useAdmissionMaster(entityId, session);
    const { data: coursesData } = useCourses(entityId, session);

    // Local State
    const [filters, setFilters] = useState(initialFilters);
    const [globalSearch, setGlobalSearch] = useState(initialGlobalSearch);

    // Sync local state when initialFilters change
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    // Sync local globalSearch when prop changes (optional, but good for consistency if parent updates it specifically)
    useEffect(() => {
        setGlobalSearch(initialGlobalSearch);
    }, [initialGlobalSearch]);

    // Auto-select positive tags when master data loads
    useEffect(() => {
        if (admissionMaster?.tags && (!filters.tag || filters.tag.length === 0)) {
            const positiveTags = admissionMaster.tags
                .filter((t: any) => t.label === 'positive')
                .map((t: any) => t.tag);
            
            if (positiveTags.length > 0) {
                setFilters((prev: any) => ({
                    ...prev,
                    tag: positiveTags
                }));
            }
        }
    }, [admissionMaster]);

    // Derived Data for Cascading Filters
    const streams = useMemo(() => {
        if (!filters.course || filters.course.length === 0 || !coursesData) return [];
        const selectedCourses = coursesData.filter((c: any) => filters.course.includes(c.name));
        const allStreams = selectedCourses.flatMap((c: any) => c.stream || c.streams || []);
        return [...new Set(allStreams)];
    }, [filters.course, coursesData]);

    const batches = useMemo(() => {
        if (!filters.course || filters.course.length === 0 || !coursesData) return [];
        const selectedCourses = coursesData.filter((c: any) => filters.course.includes(c.name));
        const allBatches = selectedCourses.flatMap((c: any) => c.batch || c.batches || []);
        return [...new Set(allBatches)];
    }, [filters.course, coursesData]);

    const handleApply = () => {
        onApply(filters, globalSearch);
    };

    const handleReset = () => {
        setFilters((prev: any) => ({
            ...prev,
            course: [],
            stream: [],
            batch: [],
            tag: [],
            source: [],
            engagementStatus: [],
            startDate: undefined,
            endDate: undefined,
            followUpEndDate: new Date().setHours(23, 59, 59, 999) // Reset to end of today
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center px-3 py-2 border-b bg-gray-50/50">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Filter Leads</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div
                         className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-colors ${globalSearch ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                         onClick={() => setGlobalSearch(!globalSearch)}
                     >
                         <div className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${globalSearch ? 'bg-blue-600' : 'bg-gray-300'}`}>
                             <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform duration-300 ease-in-out ${globalSearch ? 'translate-x-4' : 'translate-x-0'}`}></div>
                         </div>
                         <span className={`text-xs font-medium ${globalSearch ? 'text-blue-700' : 'text-gray-600'}`}>Global Search</span>
                     </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>
            
            <div className="p-4 bg-white">
                <div className="space-y-4">
                    {/* Academic Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-semibold text-sm text-gray-700 tracking-wide">Academic</h3>
                                <div className="h-px bg-gray-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <MultiSelect
                                label={getDisplayName('course')}
                                options={coursesData?.map((c: any) => ({ value: c.name, label: c.name })) || []}
                                value={filters.course || []}
                                onChange={(val) => {
                                    setFilters({ ...filters, course: val, stream: [], batch: [] }); // Reset dependent fields
                                }}
                                placeholder={`Select ${getDisplayName('course')}`}
                            />
                            <MultiSelect
                                label={getDisplayName('stream')}
                                options={streams.map((s: string) => ({ value: s, label: s }))}
                                value={filters.stream || []}
                                onChange={(val) => setFilters({ ...filters, stream: val })}
                                placeholder={`Select ${getDisplayName('stream')}`}
                                disabled={!filters.course || filters.course.length === 0}
                            />
                            <MultiSelect
                                label={getDisplayName('batch')}
                                options={batches.map((b: string) => ({ value: b, label: b }))}
                                value={filters.batch || []}
                                onChange={(val) => setFilters({ ...filters, batch: val })}
                                placeholder={`Select ${getDisplayName('batch')}`}
                                disabled={!filters.course || filters.course.length === 0}
                            />
                        </div>
                    </section>

                    {/* Application Details Section */}
                    <section>
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-semibold text-sm text-gray-700 tracking-wide">Application Details</h3>
                                <div className="h-px bg-gray-100 flex-1"></div>
                        </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            <MultiSelect
                                label="Tags"
                                options={admissionMaster?.tags?.map((t: any) => ({ 
                                    value: t.tag, 
                                    label: t.tag
                                })) || []}
                                value={filters.tag || []}
                                onChange={(val) => setFilters({ ...filters, tag: val })}
                                placeholder="Select Tags"
                            />
                            <MultiSelect
                                label="Source"
                                options={admissionMaster?.sources?.map((s: any) => ({ value: s.source, label: s.source })) || []}
                                value={filters.source || []}
                                onChange={(val) => setFilters({ ...filters, source: val })}
                                placeholder="Select Source"
                            />
                            <div className="lg:col-span-2">
                                <MultiSelect
                                    label="Engagement Status"
                                    options={[
                                        { value: 'notEngaged', label: 'Not Engaged' },
                                        { value: 'engagedWithPendingFollowUp', label: 'Engaged with pending follow up' },
                                        { value: 'engagedWithCompletedFollowUp', label: 'Engaged with completed follow up' },
                                    ]}
                                    value={filters.engagementStatus || []}
                                    onChange={(val) => setFilters({ ...filters, engagementStatus: val })}
                                    placeholder="Select Status"
                                />
                            </div>
                            
                            {/* Counselor Selection */}
                            <SelectSingle
                                label="Counselor"
                                options={counselors?.map((c: any) => ({ value: c._id, label: c.name })) || []}
                                value={filters.counselorId}
                                onChange={(val) => setFilters({ ...filters, counselorId: val as string })}
                                placeholder="Select Counselor"
                            />
                            
                            <div className="flex items-center h-full pt-6">
                                <Checkbox
                                    label="Show Member Details"
                                    checked={filters.memberDetails || false}
                                    onChange={(checked) => setFilters({ ...filters, memberDetails: checked })}
                                />
                            </div>
                            </div>
                    </section>

                    {/* Dates Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-semibold text-sm text-gray-700 tracking-wide">Dates</h3>
                                <div className="h-px bg-gray-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <DatePicker
                                label="Admission Start Date"
                                value={filters.startDate ? new Date(filters.startDate) : null}
                                onChange={(date) => {
                                    if (date) date.setHours(0, 0, 0, 0);
                                    setFilters({ 
                                        ...filters, 
                                        startDate: date ? date.getTime() : undefined 
                                    })
                                }}
                                placeholder="Select Date"
                            />
                            <DatePicker
                                label="Admission End Date"
                                value={filters.endDate ? new Date(filters.endDate) : null}
                                onChange={(date) => {
                                    if (date) date.setHours(23, 59, 59, 999);
                                    setFilters({ 
                                        ...filters, 
                                        endDate: date ? date.getTime() : undefined 
                                    })
                                }}
                                placeholder="Select Date"
                            />
                            <DatePicker
                                label="Follow Up End Date"
                                value={filters.followUpEndDate ? new Date(filters.followUpEndDate) : null}
                                onChange={(date) => {
                                    if (date) date.setHours(23, 59, 59, 999);
                                    setFilters({ 
                                        ...filters, 
                                        followUpEndDate: date ? date.getTime() : undefined 
                                    })
                                }}
                                placeholder="Select Date"
                            />
                        </div>
                    </section>
                </div>
            </div>
            <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>Reset All</Button>
                <Button variant="primary" size="sm" onClick={handleApply}>Apply Filters</Button>
            </div>
        </div>
    );
};

export default FilterCard;
