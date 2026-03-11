import { useEffect, useState } from 'react';
import PrintLayout from '../../components/PrintLayout';
import { VacantSeatsReportTableRow } from '@od-erp/types';

const printVacantSeatsReport = () => {
    const [data, setData] = useState<VacantSeatsReportTableRow[]>([]);

    const entityPreferences = JSON.parse(localStorage.getItem('entityPreferences') || '{}');

    const displayNames = {
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
        subjectCombination: entityPreferences.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
    };

    const showBatch = entityPreferences.showBatch;

    useEffect(() => {
        const storedData = localStorage.getItem('subjectCombinationData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
    }, []);

    return (
        <PrintLayout reportName={`${displayNames.subjectCombination} Report`}>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">{displayNames.course}</th>
                        <th className="border border-gray-300 p-2 text-left">{displayNames.stream}</th>
                        {showBatch && <th className="border border-gray-300 p-2 text-left">{displayNames.batch}</th>}
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Available Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Filled Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Pending Applications</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={row.course === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            <td className="border border-gray-300 p-2 text-center">{row.course === 'Total' ? '' : row.position}</td>
                            <td className="border border-gray-300 p-2">{row.course}</td>
                            <td className="border border-gray-300 p-2">{row.stream}</td>
                            {showBatch && <td className="border border-gray-300 p-2">{row.batch}</td>}
                            <td className="border border-gray-300 p-2">{row.name}</td>
                            <td className="border border-gray-300 p-2">{row.seats}</td>
                            <td className="border border-gray-300 p-2">{row.availableSeats}</td>
                            <td className="border border-gray-300 p-2">{row.filledSeats}</td>
                            <td className="border border-gray-300 p-2">{row.pendingApplications}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={showBatch ? 9 : 8} className="border border-gray-300 p-4 text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </PrintLayout>
    );
};

export default printVacantSeatsReport;
