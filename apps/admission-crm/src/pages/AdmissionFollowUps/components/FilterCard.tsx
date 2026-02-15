import { useState } from 'react';
import { Button, Dropdown, DatePicker } from '@od-erp/ui';

interface FilterCardProps {
    startDate: number;
    endDate: number;
    status: string;
    counselorId: string;
    counselors: any[];
    isAdmissionAdmin: boolean;
    onApply: (_filters: {
        startDate: number;
        endDate: number;
        status: string;
        counselorId: string;
    }) => void;
    setStartDate: (_date: number) => void;
    setEndDate: (_date: number) => void;
    setStatus: (_status: string) => void;
    setCounselorId: (_id: string) => void;
}

export const FilterCard = ({
    startDate,
    endDate,
    status,
    counselorId,
    counselors,
    isAdmissionAdmin,
    onApply,
    setStartDate,
    setEndDate,
    setStatus,
    setCounselorId,
}: FilterCardProps) => {
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        await onApply({ startDate, endDate, status, counselorId });
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {isAdmissionAdmin && (
                    <div className="w-full">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Counselor</label>
                        <Dropdown
                            value={counselorId}
                            onChange={(val) => setCounselorId(val as string)}
                            options={[
                                { value: '', label: 'Select Counselor' },
                                ...counselors.map((c) => ({ value: c._id, label: c.name })),
                            ]}
                            className="w-full"
                            placeholder="Select Counselor"
                        />
                    </div>
                )}

                <div className="w-full">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                    <DatePicker
                        value={startDate ? new Date(startDate) : null}
                        onChange={(date) => date && setStartDate(date.getTime())}
                        maxDate={endDate ? new Date(endDate) : undefined}
                        className="w-full"
                    />
                </div>
                <div className="w-full">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                    <DatePicker
                        value={endDate ? new Date(endDate) : null}
                        onChange={(date) => date && setEndDate(date.getTime())}
                        minDate={startDate ? new Date(startDate) : undefined}
                        className="w-full"
                    />
                </div>

                <div className="w-full">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                    <Dropdown
                        value={status}
                        onChange={(val) => setStatus(val as string)}
                        options={[
                            { value: '', label: 'All' },
                            { value: 'pending', label: 'PENDING' },
                            { value: 'completed', label: 'COMPLETED' },
                        ]}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="primary" onClick={handleApply} isLoading={loading}>
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};
