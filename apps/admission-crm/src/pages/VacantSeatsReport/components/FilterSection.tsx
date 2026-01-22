import React from 'react';
import { Select, Button } from '@od-erp/ui';
import { ArrowRight } from 'lucide-react';

interface FilterSectionProps {
    courses: any[];
    selectedCourse: any;
    onCourseChange: (course: any) => void;
    streams: string[];
    selectedStream: string;
    onStreamChange: (stream: string) => void;
    batches: string[];
    selectedBatch: string;
    onBatchChange: (batch: string) => void;
    onSearch: () => void;
    loading: boolean;
    showBatch: boolean;
    displayNames: {
        course: string;
        stream: string;
        batch: string;
    };
}

export const FilterSection: React.FC<FilterSectionProps> = ({
    courses,
    selectedCourse,
    onCourseChange,
    streams,
    selectedStream,
    onStreamChange,
    batches,
    selectedBatch,
    onBatchChange,
    onSearch,
    loading,
    showBatch,
    displayNames
}) => {
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                        Select {displayNames.course}
                    </label>
                    <Select
                        value={selectedCourse?.name || ''}
                        onChange={(e) => {
                            const course = courses.find(c => c.name === e.target.value);
                            onCourseChange(course);
                        }}
                        options={[
                            { value: '', label: `Select ${displayNames.course}` },
                            ...courses.map(c => ({ value: c.name, label: c.name }))
                        ]}
                        className="h-[42px] rounded-lg border-gray-300"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                        Select {displayNames.stream}
                    </label>
                    <Select
                        value={selectedStream}
                        onChange={(e) => onStreamChange(e.target.value)}
                        options={[
                            { value: '', label: `Select ${displayNames.stream}` },
                            ...streams.map(s => ({ value: s, label: s }))
                        ]}
                        className="h-[42px] rounded-lg border-gray-300"
                    />
                </div>

                {showBatch && (
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
                            Select {displayNames.batch}
                        </label>
                        <Select
                            value={selectedBatch}
                            onChange={(e) => onBatchChange(e.target.value)}
                            options={[
                                { value: '', label: `Select ${displayNames.batch}` },
                                ...batches.map(b => ({ value: b, label: b }))
                            ]}
                            className="h-[42px] rounded-lg border-gray-300"
                        />
                    </div>
                )}

                <div className={showBatch ? '' : 'md:col-start-4'}>
                    <Button
                        onClick={onSearch}
                        isLoading={loading}
                        className="h-[40px] bg-[#e95028] hover:bg-[#d64820] text-white rounded-md shadow-sm w-full md:w-auto px-6"
                        rightIcon={<ArrowRight size={14} />}
                    >
                        Go
                    </Button>
                </div>
            </div>
        </div>
    );
};
