import { useEffect, useState } from 'react';
import { NepSubjectReportTableRow } from '@od-erp/types';

const PrintNepSubjectReport = () => {
    const [data, setData] = useState<NepSubjectReportTableRow[]>([]);

    const entityName = localStorage.getItem('entityName') || 'OkieDokie';

    useEffect(() => {
        const storedData = localStorage.getItem('nepSubjectData');

        if (storedData) setData(JSON.parse(storedData));

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
                <p className="text-lg">Nep Subject Report</p>
            </div>

            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">S.No</th>
                        <th className="border border-gray-300 p-2 text-left">Subject Name</th>
                        <th className="border border-gray-300 p-2 text-left">Subject Code</th>
                        <th className="border border-gray-300 p-2 text-left">Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Available Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Filled Seats</th>
                        <th className="border border-gray-300 p-2 text-left">Pending Applications</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={row.name === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            <td className="border border-gray-300 p-2">{row.name === 'Total' ? '' : row.position}</td>
                            <td className="border border-gray-300 p-2">{row.name}</td>
                            <td className="border border-gray-300 p-2">{row.code || '-'}</td>
                            <td className="border border-gray-300 p-2">{row.seats}</td>
                            <td className="border border-gray-300 p-2">{row.availableSeats}</td>
                            <td className="border border-gray-300 p-2">{row.filledSeats}</td>
                            <td className="border border-gray-300 p-2">{row.pendingApplications}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={7} className="border border-gray-300 p-4 text-center">
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

export default PrintNepSubjectReport;
