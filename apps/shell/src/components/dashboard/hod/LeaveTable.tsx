import React from 'react';
import { Card, Badge } from '@od-erp/ui';
import { LeaveRequest } from '@od-erp/types';

interface LeaveTableProps {
    leaves: LeaveRequest[];
}

export const LeaveTable: React.FC<LeaveTableProps> = ({ leaves }) => {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'destructive'; // Verify if 'destructive' exists, otherwise default fallback
            case 'Pending': return 'warning'; // Verify if 'warning' exists
            default: return 'default';
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Leave Request</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Reason</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-4 text-center">No Data Found</td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {leave.employee.name}
                                        </td>
                                        <td className="px-4 py-3">{leave.leaveType.name}</td>
                                        <td className="px-4 py-3">
                                            {new Date(leave.startDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-4 py-3 truncate max-w-[200px]" title={leave.reason}>
                                            {leave.reason}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};
