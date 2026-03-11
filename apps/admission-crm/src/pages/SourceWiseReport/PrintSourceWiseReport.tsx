import { useEffect, useState } from 'react';
import PrintLayout from '../../components/PrintLayout';

const PrintSourceWiseReport = () => {
    const [data, setData] = useState<any[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('sourceWiseLeadData');
        const storedHeads = localStorage.getItem('tableHeads');

        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch (e) {
                console.error("Error parsing stored data", e);
            }
        }
        if (storedHeads) {
            try {
                setTableHeads(JSON.parse(storedHeads));
            } catch (e) {
                console.error("Error parsing stored heads", e);
            }
        }
    }, []);

    return (
        <PrintLayout reportName="Source Wise Report">
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-center w-12">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Source</th>
                        <th className="border border-gray-300 p-2 text-center">Total Lead Count</th>
                        <th className="border border-gray-300 p-2 text-center">Total Application Count</th>
                        {tableHeads.map((head, index) => (
                            <th key={index} className="border border-gray-300 p-2 text-center">{head}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const isTotal = row.source === 'Total';
                        return (
                            <tr key={index} className={isTotal ? 'font-bold bg-gray-50' : ''}>
                                <td className="border border-gray-300 p-2 text-center">
                                    {isTotal ? '' : index + 1}
                                </td>
                                <td className="border border-gray-300 p-2 text-left">{row.source}</td>
                                <td className="border border-gray-300 p-2 text-center">{row.totalLeadCount}</td>
                                <td className="border border-gray-300 p-2 text-center">{row.totalApplicationCount}</td>
                                {tableHeads.map((head, i) => (
                                    <td key={i} className="border border-gray-300 p-2 text-center">
                                        {row[head] || 0}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4 + tableHeads.length} className="border border-gray-300 p-4 text-center text-gray-500">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </PrintLayout>
    );
};

export default PrintSourceWiseReport;
