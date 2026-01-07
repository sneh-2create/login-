import { useEffect, useState } from 'react';

const PrintVacantSeatsReport = () => {
    const [data, setData] = useState<any[]>([]);

    const entityName = localStorage.getItem('entityName') || 'Entity Name';
    const entityPreferences = JSON.parse(localStorage.getItem('entityPreferences') || '{}');

    const displayNames = {
        course: entityPreferences.displayNames?.find((item: any) => item.value === 'course')?.name || 'Class',
        stream: entityPreferences.displayNames?.find((item: any) => item.value === 'stream')?.name || 'Stream',
        batch: entityPreferences.displayNames?.find((item: any) => item.value === 'batch')?.name || 'Batch',
        subjectCombination: entityPreferences.displayNames?.find((item: any) => item.value === 'subjectCombination')?.name || 'Subject Combination',
    };

    const showBatch = entityPreferences.showBatch;

    useEffect(() => {
        const storedData = localStorage.getItem('vacantSeatsReportData');
        if (storedData) {
            setData(JSON.parse(storedData));
            // Optional: clean up after reading? Angular didn't seem to force it immediately, 
            // but usually good practice. Keeping it for now.
            // localStorage.removeItem('vacantSeatsReportData');
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
                <p className="text-lg">{displayNames.subjectCombination} Report</p>
            </div>

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
                            <td className="border border-gray-300 p-2">{row.course === 'Total' ? '' : row.position}</td>
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

            <div className="mt-16 flex justify-between px-16">
                <div>Principal's Signature</div>
                <div>Authorised Signature</div>
            </div>
        </div>
    );
};

export default PrintVacantSeatsReport;
