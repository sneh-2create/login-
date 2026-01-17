import { useEffect, useState } from 'react';
import { sourceWiseReportTableRow } from '@od-erp/types';
import PrintLayout from '../../components/printLayout';

const printSourceWiseReport = () => {
    const [data, setData] = useState<sourceWiseReportTableRow[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('sourceWiseLeadData');
        const storedHeads = localStorage.getItem('tableHeads');

        if (storedData) {
            setData(JSON.parse(storedData));
        }
        if (storedHeads) {
            setTableHeads(JSON.parse(storedHeads));
        }
    }, []);

    return (
        <PrintLayout reportName="Source Wise Report">
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Source</th>
                        <th className="border border-gray-300 p-2 text-left">Total Lead Count</th>
                        <th className="border border-gray-300 p-2 text-left">Total Application Count</th>
                        {tableHeads.map((head, index) => (
                            <th key={index} className="border border-gray-300 p-2 text-left">{head}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={row.source === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            <td className="border border-gray-300 p-2 text-center">{row.source === 'Total' ? '' : row.position}</td>
                            <td className="border border-gray-300 p-2">{row.source}</td>
                            <td className="border border-gray-300 p-2">{row.totalLeadCount}</td>
                            <td className="border border-gray-300 p-2">{row.totalApplicationCount}</td>
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
        </PrintLayout>
    );
};

export default printSourceWiseReport;
