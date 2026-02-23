import { useState, useEffect, useMemo } from 'react';
import { Button, SelectSingle, MultiSelect, DatePicker } from '@od-erp/ui';
import { useSessions, useCourses } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';

interface TemplateFilterProps {
    startDate: number;
    endDate: number;
    setStartDate: (_date: number) => void;
    setEndDate: (_date: number) => void;
    status: string;
    setStatus: (_status: string) => void;
    paymentMode: string;
    setPaymentMode: (_mode: string) => void;
    selectedCourses: string[];
    setSelectedCourses: (_courses: string[]) => void;
    selectedSession: string[];
    setSelectedSession: (_session: string[]) => void;
    paymentModeList: string[];
    onApply: () => void;
    // New prop to pass down the correct session context
    session: string;
}

const TemplateFilter = (props: TemplateFilterProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    
    // Local state to hold changes before "Go"
    const [localStartDate, setLocalStartDate] = useState(props.startDate);
    const [localEndDate, setLocalEndDate] = useState(props.endDate);
    const [localStatus, setLocalStatus] = useState(props.status);
    const [localPaymentMode, setLocalPaymentMode] = useState(props.paymentMode);
    const [localCourses, setLocalCourses] = useState<string[]>(props.selectedCourses);
    const [localSessions, setLocalSessions] = useState<string[]>(props.selectedSession);
    const entityPreferences = useAppSelector((state: any) => state.auth.entityDetails?.entityPreferences);
    const displayNames = useMemo(() => {
        const names = entityPreferences?.displayNames || [];
        return {
            course: names.find((d: any) => d.value === 'course')?.name || 'Class'
        };
    }, [entityPreferences]);

    const { data: sessions } = useSessions(entityId);
    const { data: courses } = useCourses(entityId, props.session);

    // Sync local state when props change
    useEffect(() => {
        setLocalStartDate(props.startDate);
        setLocalEndDate(props.endDate);
        setLocalStatus(props.status);
        setLocalPaymentMode(props.paymentMode);
        setLocalCourses(props.selectedCourses);
        setLocalSessions(props.selectedSession);
    }, [props.startDate, props.endDate, props.status, props.paymentMode, props.selectedCourses, props.selectedSession]);

    const handleApply = () => {
        props.setStartDate(localStartDate);
        props.setEndDate(localEndDate);
        props.setStatus(localStatus);
        props.setPaymentMode(localPaymentMode);
        props.setSelectedCourses(localCourses);
        props.setSelectedSession(localSessions);
        props.onApply();
    };

    return (
        <div className="bg-[var(--color-card)] p-3 rounded-lg shadow-sm border border-[var(--color-border)] mb-6 animate-in slide-in-from-top-2 relative z-10">
            
            {/* Section 1: Date and Status */}
            <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-2 tracking-wider border-b border-[var(--color-border)] pb-1">Date and Status Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6 mb-2 md:mb-6">
                <div>
                    <DatePicker 
                        label='Start Date'
                        value={new Date(localStartDate)}
                        onChange={(date) => date && setLocalStartDate(date.getTime())}
                        maxDate={new Date(localEndDate)}
                        className="w-full"
                    />
                </div>
                <div>
                    <DatePicker 
                        label='End Date'
                        value={new Date(localEndDate)}
                        onChange={(date) => date && setLocalEndDate(date.getTime())}
                        minDate={new Date(localStartDate)}
                        className="w-full"
                    />
                </div>
                <div>
                    <SelectSingle
                        label="Select Payment Mode"
                        value={localPaymentMode}
                        onChange={(val) => setLocalPaymentMode(val as string)}
                        options={[
                            { label: 'All Payment Modes', value: '' },
                            ...props.paymentModeList.map(mode => ({ label: mode, value: mode }))
                        ]}
                        containerClassName="w-full"
                        placeholder="Select Payment Mode"
                    />
                </div>
                <div>
                    <SelectSingle
                        label="Select Status"
                        value={localStatus}
                        onChange={(val) => setLocalStatus(val as string)}
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Confirmed', value: 'confirmed' },
                            { label: 'Cancelled', value: 'cancelled' }
                        ]}
                        containerClassName="w-full"
                        placeholder="Select Status"
                    />
                </div>
            </div>

            {/* Section 2: Class Information */}
            <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-2 tracking-wider border-b border-[var(--color-border)] pb-1">{displayNames.course} Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-2 md:mb-6">
                <div>
                    <MultiSelect
                        label={`Select ${displayNames.course}`}
                        value={localCourses}
                        onChange={(val) => setLocalCourses(val as string[])}
                        options={courses?.map(c => ({ label: c.name, value: c.name })) || []}
                        placeholder={`All ${displayNames.course}`}
                        containerClassName="w-full"
                    />
                </div>
                <div>
                    <MultiSelect
                        label="Select Session"
                        value={localSessions}
                        onChange={(val) => setLocalSessions(val as string[])}
                        options={sessions?.map(s => ({ label: s.name, value: s.name })) || []}
                        placeholder="Select Sessions"
                        containerClassName="w-full"
                    />
                </div>
            </div>

            {/* Action Button */}
            <div>
                <Button 
                    variant="primary"
                    onClick={handleApply}
                    className="px-8 h-10 font-medium"
                >
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};

export default TemplateFilter;
