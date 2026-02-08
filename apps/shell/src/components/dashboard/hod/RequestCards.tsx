import React from 'react';
import { Card } from '@od-erp/ui';
import { RequestCount } from '@od-erp/types';
import { Clock, Calendar, AlertCircle, FileText } from 'lucide-react';

interface RequestCardsProps {
    arCount: RequestCount;
    leaveCount: RequestCount;
    laCount: RequestCount;
    odCount: RequestCount;
}

interface StatCardProps {
    title: string;
    count: RequestCount;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color }) => (
    <Card className="h-full">
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold">{count.total}</h3>
                </div>
                <div className={`p-2 rounded-lg ${color} text-white`}>
                    {icon}
                </div>
            </div>
            <div className="flex space-x-2 text-xs text-gray-500 mt-2">
                <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">P: {count.pending}</span>
                <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">A: {count.approved}</span>
                <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded">R: {count.rejected}</span>
            </div>
        </div>
    </Card>
);

export const RequestCards: React.FC<RequestCardsProps> = ({ arCount, leaveCount, laCount, odCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Att. Regularization"
                count={arCount}
                icon={<Clock size={20} />}
                color="bg-blue-500"
            />
            <StatCard
                title="Leaves"
                count={leaveCount}
                icon={<Calendar size={20} />}
                color="bg-pink-500"
            />
            <StatCard
                title="Late Arrival"
                count={laCount}
                icon={<AlertCircle size={20} />}
                color="bg-yellow-500"
            />
            <StatCard
                title="On Duty"
                count={odCount}
                icon={<FileText size={20} />}
                color="bg-purple-500"
            />
        </div>
    );
};
