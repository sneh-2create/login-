import { useEffect, useState } from 'react';
import { SourceWiseReportTableRow } from '@od-erp/types';

const PrintSourceWiseReport = () => {
    const [data, setData] = useState<SourceWiseReportTableRow[]>([]);
    const [tableHeads, setTableHeads] = useState<string[]>([]);

    const entityName = localStorage.getItem('entityName') || 'OkieDokie';

    useEffect(() => {
        const storedData = localStorage.getItem('sourceWiseLeadData');
        const storedHeads = localStorage.getItem('tableHeads');

        if (storedData) {
            setData(JSON.parse(storedData));
        }
        if (storedHeads) {
            setTableHeads(JSON.parse(storedHeads));
        }

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
                <p className="text-lg">Source Wise Report</p>
            </div>

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
                            <td className="border border-gray-300 p-2">{row.source === 'Total' ? '' : row.position}</td>
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

            <div className="mt-16 flex justify-between px-16">
                <div>Principal's Signature</div>
                <div>Authorised Signature</div>
            </div>
        </div>
    );
};

export default PrintSourceWiseReport;
