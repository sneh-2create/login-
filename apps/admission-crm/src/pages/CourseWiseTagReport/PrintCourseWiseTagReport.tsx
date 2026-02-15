import { useEffect, useState, useMemo } from 'react';
import { CourseWiseTagReportTableRow } from '@od-erp/types';
import { useAppSelector } from '@od-erp/store';
import PrintLayout from '../../components/PrintLayout';

const PrintCourseWiseTagReport = () => {
    const [data, setData] = useState<CourseWiseTagReportTableRow[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);
    const [reportName, setReportName] = useState('Course Wise Tag Report');

    // Get entity preferences from Redux
    const entityPreferences = useAppSelector((state) => state.auth.entityDetails?.entityPreferences) || {};

    // Extract display names
    const displayNames = useMemo(() => ({
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
    }), [entityPreferences]);

    const showBatch = entityPreferences.showBatch !== undefined ? entityPreferences.showBatch : true;

    useEffect(() => {
        const storedData = localStorage.getItem('courseWiseLeadData');
        const storedHeads = localStorage.getItem('tableHeads');

        if (storedData) setData(JSON.parse(storedData));
        if (storedHeads) setTableHeads(JSON.parse(storedHeads));

        // Update report name with display name
        setReportName(`${displayNames.course} Wise Tag Report`);
    }, [displayNames.course]);

    return (
        <PrintLayout reportName={reportName}>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">{displayNames.course}</th>
                        <th className="border border-gray-300 p-2 text-left">{displayNames.stream}</th>
                        {showBatch && (
                            <th className="border border-gray-300 p-2 text-left">{displayNames.batch}</th>
                        )}
                        <th className="border border-gray-300 p-2 text-left">Total Count</th>
                        {tableHeads.map((head, index) => (
                            <th key={index} className="border border-gray-300 p-2 text-left">{head}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                         const isTotal = row.course === 'Total';
                         return (
                            <tr key={index} className={isTotal ? 'font-bold bg-gray-50' : ''}>
                                <td className="border border-gray-300 p-2 text-center">{isTotal ? '' : row.position}</td>
                                <td className="border border-gray-300 p-2">{row.course}</td>
                                <td className="border border-gray-300 p-2">{row.stream || ''}</td>
                                {showBatch && (
                                    <td className="border border-gray-300 p-2">{row.batch || ''}</td>
                                )}
                                <td className="border border-gray-300 p-2">{row.totalCount}</td>
                                {tableHeads.map((head, i) => (
                                    <td key={i} className="border border-gray-300 p-2">
                                        {row[head] || 0}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4 + tableHeads.length + (showBatch ? 1 : 0)} className="border border-gray-300 p-4 text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </PrintLayout>
    );
};

export default PrintCourseWiseTagReport;
