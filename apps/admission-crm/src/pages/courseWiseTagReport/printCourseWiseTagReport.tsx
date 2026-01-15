import { useEffect, useState } from 'react';
import { CourseWiseTagReportTableRow } from '@od-erp/types';

const printCourseWiseTagReport = () => {
    const [data, setData] = useState<CourseWiseTagReportTableRow[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);
    const [reportName, setReportName] = useState('Course Wise Tag Report');

    const entityName = localStorage.getItem('entityName') || 'OkieDokie';

    useEffect(() => {
        const storedData = localStorage.getItem('printData');
        const storedHeads = localStorage.getItem('printColumns');
        const storedName = localStorage.getItem('reportName');

        if (storedData) setData(JSON.parse(storedData));
        if (storedHeads) setTableHeads(JSON.parse(storedHeads));
        if (storedName) setReportName(storedName);

        // Auto print
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    return (
        <div className="p-8 text-black bg-white min-h-screen">
            <div className="flex justify-end mb-4 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Print
                </button>
            </div>

            <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">{entityName}</h3>
                <p className="text-lg">{reportName}</p>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Course</th>
                        <th className="border border-gray-300 p-2 text-left">Stream</th>
                        <th className="border border-gray-300 p-2 text-left">Total</th>
                        {tableHeads.map((head, index) => (
                            <th key={index} className="border border-gray-300 p-2 text-left">{head}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={row.course === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            <td className="border border-gray-300 p-2">{row.course === 'Total' ? '' : row.position}</td>
                            <td className="border border-gray-300 p-2">{row.course}</td>
                            <td className="border border-gray-300 p-2">{row.stream || '-'}</td>
                            <td className="border border-gray-300 p-2">{row.total}</td>
                            {tableHeads.map((head, i) => (
                                <td key={i} className="border border-gray-300 p-2">
                                    {row[head] || 0}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4 + tableHeads.length} className="border border-gray-300 p-4 text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="mt-16 flex justify-between px-16">
                <div>Principal's Signature</div>
                <div>Authorised Signature</div>
            </div>
        </div>
    );
};

export default printCourseWiseTagReport;
