import { Button, Dropdown, DatePicker } from '@od-erp/ui';
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
        <div className="bg-white rounded-lg shadow mb-6 border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="w-full">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                    <DatePicker
                        value={new Date(startDate)}
                        onChange={(date) => date && setStartDate(date.getTime())}
                        maxDate={new Date(endDate)}
                        className="w-full"
                    />
                </div>
                <div className="w-full">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                    <DatePicker
                        value={new Date(endDate)}
                        onChange={(date) => date && setEndDate(date.getTime())}
                        minDate={new Date(startDate)}
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
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ]}
                        className="w-full"
                    />
                </div>
                {autoVoucherEnabled && (
                    <div className="w-full">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Voucher Status</label>
                        <Dropdown
                            value={voucherStatus}
                            onChange={(val) => setVoucherStatus(val as string)}
                            options={[
                                { value: '', label: 'All' },
                                { value: 'true', label: 'Created' },
                                { value: 'false', label: 'Not Created' },
                            ]}
                            className="w-full"
                        />
                    </div>
                )}
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="primary" onClick={handleApply} isLoading={loading}>
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};
