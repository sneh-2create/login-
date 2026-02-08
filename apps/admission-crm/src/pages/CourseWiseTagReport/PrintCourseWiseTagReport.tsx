import { useEffect, useState } from 'react';
import { CourseWiseTagReportTableRow } from '@od-erp/types';
import PrintLayout from '../../components/PrintLayout';

const PrintCourseWiseTagReport = () => {
    const [data, setData] = useState<CourseWiseTagReportTableRow[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);
    const [reportName, setReportName] = useState('Course Wise Tag Report');

    useEffect(() => {
        const storedData = localStorage.getItem('courseWiseLeadData');
        const storedHeads = localStorage.getItem('tableHeads');
        const storedName = localStorage.getItem('reportName');

        if (storedData) setData(JSON.parse(storedData));
        if (storedHeads) setTableHeads(JSON.parse(storedHeads));
        if (storedName) setReportName(storedName);
    }, []);

    return (
        <PrintLayout reportName={reportName}>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Course</th>
                        <th className="border border-gray-300 p-2 text-left">Stream</th>
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
                            <td colSpan={4 + tableHeads.length} className="border border-gray-300 p-4 text-center">
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
