import { useState } from 'react';
import { Button, Select } from '@od-erp/ui';
import { X } from 'lucide-react';
import { AdmissionStudentDataPayload } from '@od-erp/types';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: Partial<AdmissionStudentDataPayload>) => void;
    currentFilters: Partial<AdmissionStudentDataPayload>;
}

const FilterModal = ({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) => {
    const [filters, setFilters] = useState<Partial<AdmissionStudentDataPayload>>(currentFilters);

    const handleChange = (field: keyof AdmissionStudentDataPayload, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setFilters({});
        onApply({});
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Filter Applications</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <Select
                        label="Course"
                        options={[
                            { label: 'All', value: '' },
                            { label: 'B.Tech', value: 'B.Tech' },
                            { label: 'MBA', value: 'MBA' },
                            { label: 'BBA', value: 'BBA' }
                        ]}
                        value={filters.course ? (filters.course as any) : ''}
                        onChange={(e) => handleChange('course', e.target.value)}
                    />

                    {/* Start Date & End Date */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full border rounded px-2 py-2 text-sm"
                                value={filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChange('startDate', new Date(e.target.value).getTime())}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full border rounded px-2 py-2 text-sm"
                                value={filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChange('endDate', new Date(e.target.value).getTime())}
                            />
                        </div>
                    </div>

                    <Select
                        label="Source"
                        options={[
                            { label: 'All', value: '' },
                            { label: 'Walk-in', value: 'Walk-in' },
                            { label: 'Reference', value: 'Reference' },
                            { label: 'Online', value: 'Online' }
                        ]}
                        value={filters.source ? (filters.source as any) : ''}
                        onChange={(e) => handleChange('source', e.target.value)}
                    />
                </div>

                <div className="flex justify-between p-4 border-t">
                    <Button variant="outline" onClick={handleClear} className="text-red-500 border-red-200 hover:bg-red-50">Clear Filters</Button>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleApply}>Apply</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
