import React from 'react';
import { Title } from '@od-erp/ui';
import { RefreshCw, Download, Printer } from 'lucide-react';

interface ReportHeaderProps {
    displayName: string;
    onRefresh?: () => void;
    onExport: () => void;
    onPrint: () => void;
    exportLoading: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
    displayName,
    onRefresh,
    onExport,
    onPrint,
    exportLoading
}) => {
    return (
        <div className="flex justify-between items-start">
            <div>
                <Title variant="pageTitle" className="text-2xl font-bold text-gray-900 mb-1">
                    {displayName} Report
                </Title>
                <nav className="text-sm text-gray-600">
                    <span className="hover:text-gray-900 cursor-pointer">Dashboard</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-gray-900 cursor-pointer">Admissions</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-gray-900 cursor-pointer">Reports</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{displayName}</span>
                </nav>
            </div>

            <div className="flex gap-2">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className="text-gray-600" />
                    </button>
                )}
                <button
                    onClick={onExport}
                    disabled={exportLoading}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Download Excel"
                >
                    <Download size={16} className="text-gray-600" />
                </button>
                <button
                    onClick={onPrint}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    title="Print"
                >
                    <Printer size={16} className="text-gray-600" />
                </button>
            </div>
        </div>
    );
};
