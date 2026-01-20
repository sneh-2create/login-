import { useEffect, useState } from 'react';
import PrintLayout from '../../components/printLayout';
import { counselorTagReportTableRow } from '@od-erp/types';

const printCounselorTagReport = () => {
    const [data, setData] = useState<counselorTagReportTableRow[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('counselorWiseLeadData');
        const storedHeads = localStorage.getItem('tableHeads');

        if (storedData) {
            setData(JSON.parse(storedData));
        }
        if (storedHeads) {
            setTableHeads(JSON.parse(storedHeads));
        }
    }, []);

    return (
        <PrintLayout reportName="Counselor Tag Report">
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Counselor Name</th>
                        <th className="border border-gray-300 p-2 text-left">Total Count</th>
                        {tableHeads.map((head, index) => (
                            <th key={index} className="border border-gray-300 p-2 text-left">{head}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={row.counselorName === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            <td className="border border-gray-300 p-2 text-center">{row.counselorName === 'Total' ? '' : row.position}</td>
                            <td className="border border-gray-300 p-2">{row.counselorName}</td>
                            <td className="border border-gray-300 p-2">{row.totalCount}</td>
                            {tableHeads.map((head, i) => (
                                <td key={i} className="border border-gray-300 p-2">
                                    {row[head] || 0}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={3 + tableHeads.length} className="border border-gray-300 p-4 text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </PrintLayout>
    );
};

export default printCounselorTagReport;
