import { useState, useEffect, useRef } from 'react';
import { Button } from '@od-erp/ui';
import { useSessions, useCourses } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { Check, ArrowRight, ChevronDown } from 'lucide-react';
import { CustomDateInput, CustomSelect } from './CustomInputs';

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

const MultiSelectDropdown = ({ 
    options, 
    value, 
    onChange, 
    placeholder 
}: { 
    options: { label: string; value: string }[], 
    value: string[], 
    onChange: (_val: string[]) => void, 
    placeholder: string 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div 
                className="border border-gray-300 rounded bg-white h-10 px-3 flex items-center justify-between cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm truncate ${value.length === 0 ? 'text-gray-500' : 'text-gray-700'}`}>
                    {value.length > 0 
                        ? `${value.length} selected` 
                        : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                    {options.length > 0 ? options.map(option => (
                        <div 
                            key={option.value} 
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                            onClick={() => toggleOption(option.value)}
                        >
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${value.includes(option.value) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                {value.includes(option.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span>{option.label}</span>
                        </div>
                    )) : (
                        <div className="px-3 py-2 text-sm text-gray-400 italic">No options</div>
                    )}
                </div>
            )}
        </div>
    );
};

const TemplateFilter = (props: TemplateFilterProps) => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    // Remove redundant selector that might be empty
    // const currentSession = useAppSelector((state) => state.session.academicSession) || '';
    
    // Local state to hold changes before "Go"
    const [localStartDate, setLocalStartDate] = useState(props.startDate);
    const [localEndDate, setLocalEndDate] = useState(props.endDate);
    const [localStatus, setLocalStatus] = useState(props.status);
    const [localPaymentMode, setLocalPaymentMode] = useState(props.paymentMode);
    const [localCourses, setLocalCourses] = useState<string[]>(props.selectedCourses);
    const [localSessions, setLocalSessions] = useState<string[]>(props.selectedSession);

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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-2">
            
            {/* Section 1: Date and Status */}
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Date and Status Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Start Date</label>
                    <CustomDateInput 
                        value={localStartDate}
                        onChange={setLocalStartDate}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">End Date</label>
                    <CustomDateInput 
                        value={localEndDate}
                        onChange={setLocalEndDate}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Payment Mode</label>
                    <CustomSelect
                        value={localPaymentMode}
                        onChange={setLocalPaymentMode}
                        options={[
                            { label: 'All Payment Modes', value: '' },
                            ...props.paymentModeList.map(mode => ({ label: mode, value: mode }))
                        ]}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Status</label>
                    <CustomSelect
                        value={localStatus}
                        onChange={setLocalStatus}
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Confirmed', value: 'confirmed' },
                            { label: 'Cancelled', value: 'cancelled' }
                        ]}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Section 2: Class Information */}
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Class Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Course</label>
                    <MultiSelectDropdown
                        value={localCourses}
                        onChange={setLocalCourses}
                        options={courses?.map(c => ({ label: c.name, value: c.name })) || []}
                        placeholder="All Courses"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Session</label>
                    <MultiSelectDropdown
                        value={localSessions}
                        onChange={setLocalSessions}
                        options={sessions?.map(s => ({ label: s.name, value: s.name })) || []}
                        placeholder="Select Sessions"
                    />
                </div>
            </div>

            {/* Action Button */}
            <div>
                <Button 
                    onClick={handleApply}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-10 font-medium"
                >
                    Go <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default TemplateFilter;
