import React, { useMemo } from 'react';
import { Card } from '@od-erp/ui';
import { InactiveReason } from '@od-erp/types';

interface InactiveRemarksCardProps {
    remarks: InactiveReason[];
}

export const InactiveRemarksCard: React.FC<InactiveRemarksCardProps> = ({ remarks }) => {
    const totalCount = useMemo(() => remarks.reduce((acc, curr) => acc + curr.count, 0), [remarks]);

    return (
        <Card className="p-0 h-full flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-700">Inactive Students Remarks</h3>
                <span className="font-bold text-lg text-gray-900">Total : {totalCount}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ maxHeight: '300px' }}>
                {remarks.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No remarks found</div>
                ) : (
                    remarks.map((item, index) => (
                        <div key={index} className="flex justify-between items-center group hover:bg-gray-50 p-2 rounded-md transition-colors">
                            <div className="flex items-center gap-3">
                                {/* Using a generic icon or dot since we don't have the exact asset */}
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <span className="text-sm text-gray-700 font-medium">
                                    <span className="text-gray-500 font-normal mr-1">Remark :</span>
                                    {item.remark}
                                </span>
                            </div>
                            <div className="bg-pink-100 text-pink-700 font-bold px-3 py-1 rounded-md text-sm min-w-[30px] text-center">
                                {item.count}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
