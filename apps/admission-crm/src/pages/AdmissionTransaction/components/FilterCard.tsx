import { Button, SelectSingle, DatePicker } from '@od-erp/ui';
import { useState } from 'react';

interface FilterCardProps {
    startDate: number;
    endDate: number;
    status: string;
    voucherStatus: string;
    autoVoucherEnabled: boolean;
    onApply: (_filters: {
        startDate: number;
        endDate: number;
        status: string;
        voucherStatus: string;
    }) => void;
    setStartDate: (_date: number) => void;
    setEndDate: (_date: number) => void;
    setStatus: (_status: string) => void;
    setVoucherStatus: (_status: string) => void;
}

export const FilterCard = ({
    startDate,
    endDate,
    status,
    voucherStatus,
    autoVoucherEnabled,
    onApply,
    setStartDate,
    setEndDate,
    setStatus,
    setVoucherStatus,
}: FilterCardProps) => {
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        await onApply({ startDate, endDate, status, voucherStatus });
        setLoading(false);
    };

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-2 relative z-10">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 tracking-wider border-b pb-1">Date and Status Details</h3>
            <div className={`grid grid-cols-1 gap-6 mb-6 ${autoVoucherEnabled ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                <div>
                    <DatePicker
                        label="Start Date"
                        value={new Date(startDate)}
                        onChange={(date) => date && setStartDate(date.getTime())}
                        maxDate={new Date(endDate)}
                        className="w-full"
                    />
                </div>
                <div>
                    <DatePicker
                        label="End Date"
                        value={new Date(endDate)}
                        onChange={(date) => date && setEndDate(date.getTime())}
                        minDate={new Date(startDate)}
                        className="w-full"
                    />
                </div>

                <div>
                    <SelectSingle
                        label="Select Status"
                        value={status}
                        onChange={(val) => setStatus(val as string)}
                        options={[
                            { value: '', label: 'All Status' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ]}
                        containerClassName="w-full"
                        placeholder="Select Status"
                    />
                </div>
                {autoVoucherEnabled && (
                    <div>
                        <SelectSingle
                            label="Select Voucher Status"
                            value={voucherStatus}
                            onChange={(val) => setVoucherStatus(val as string)}
                            options={[
                                { value: '', label: 'All' },
                                { value: 'true', label: 'Created' },
                                { value: 'false', label: 'Not Created' },
                            ]}
                            containerClassName="w-full"
                            placeholder="Select Voucher Status"
                        />
                    </div>
                )}
            </div>
            <div>
                <Button variant="primary" onClick={handleApply} isLoading={loading} className="px-8 h-10 font-medium">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};
