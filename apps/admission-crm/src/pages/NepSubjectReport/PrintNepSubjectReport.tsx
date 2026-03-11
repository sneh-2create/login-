import { useEffect, useState } from 'react';
import { NepSubjectReportTableRow } from '@od-erp/types';
import PrintLayout from '../../components/PrintLayout';

const PrintNepSubjectReport = () => {
    const [data, setData] = useState<NepSubjectReportTableRow[]>([]);
    const [config, setConfig] = useState<any>({
        showBatch: false,
        displayNames: {
            course: 'Course',
            stream: 'Stream',
            batch: 'Batch'
        }
    });

    useEffect(() => {
        const storedData = localStorage.getItem('nepSubjectPrintData');
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.data) {
                // New format: { data, showBatch, displayNames, entityName }
                setData(parsed.data);
                setConfig({
                    showBatch: parsed.showBatch,
                    displayNames: parsed.displayNames
                });
            } else if (Array.isArray(parsed)) {
                 // Fallback for old format
                setData(parsed);
            }
        }
    }, []);

    const { showBatch, displayNames } = config;

    return (
        <PrintLayout reportName={`NEP Subject Report`}>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                         {showBatch && <th className="border border-gray-300 p-2 text-left">{displayNames.batch}</th>}
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Code</th>
                        <th className="border border-gray-300 p-2 text-left">Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Available Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Filled Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Pending Applications</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={row.name === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            <td className="border border-gray-300 p-2 text-center">{row.name === 'Total' ? '' : row.position}</td>
                            {showBatch && (
                                <td className="border border-gray-300 p-2">
                                    {row.name === 'Total' ? '' : ((row as any).batch || '')}
                                </td>
                            )}
                            <td className="border border-gray-300 p-2">{row.name}</td>
                            <td className="border border-gray-300 p-2">{row.code || ''}</td>
                            <td className="border border-gray-300 p-2">{row.seats}</td>
                            <td className="border border-gray-300 p-2">{row.availableSeats}</td>
                            <td className="border border-gray-300 p-2">{row.filledSeats}</td>
                            <td className="border border-gray-300 p-2">{row.pendingApplications}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={showBatch ? 8 : 7} className="border border-gray-300 p-4 text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </PrintLayout>
    );
};

export default PrintNepSubjectReport;
