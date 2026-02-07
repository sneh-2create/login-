import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import PrintLayout from '../../components/PrintLayout';

const PrintDailyCollectionReport = () => {
    const [printData, setPrintData] = useState<any>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('dailyCollectionPrintData');
        if (storedData) {
            setPrintData(JSON.parse(storedData));
        }
    }, []);

    if (!printData) return <div>Loading...</div>;

    const { reportData, headers, userSummary, totalCollection, startDate, endDate, entityName } = printData;

    const paymentModes = Array.from(new Set(Object.values(userSummary || {}).flatMap((u: any) => Object.keys(u).filter(k => k !== 'total'))));

    return (
        <PrintLayout 
            reportName={`Daily Collection Report (${format(new Date(startDate), 'dd-MMM-yyyy')} to ${format(new Date(endDate), 'dd-MMM-yyyy')})`}
            entityName={entityName}
        >
            <div className="w-full text-xs">
                {/* Main Table */}
                <table className="w-full border-collapse border border-gray-300 mb-8">
                    <thead>
                        <tr className="bg-gray-100">
                            {headers.map((col: any, idx: number) => (
                                col.header && typeof col.header === 'string' ? 
                                <th key={idx} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                                    {col.header}
                                </th> : null
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className={row.isTotalRow ? "font-bold bg-gray-50" : ""}>
                                {headers.map((col: any, cIdx: number) => {
                                    if (!col.header || typeof col.header !== 'string') return null;
                                    
                                    const accessorKey = col.accessorKey;
                                    let val = row[accessorKey];
                                    
                                    // Handle nested keys
                                    if (!val && accessorKey?.includes('.')) {
                                        val = accessorKey.split('.').reduce((o: any, i: any) => o?.[i], row);
                                    }

                                    // Special handling for Total Row
                                    if (row.isTotalRow) {
                                        if (col.header === 'S.No') return <td key={cIdx} className="border border-gray-300 px-2 py-1">Total</td>;
                                        
                                        // Display amount for 'Amount' column or if it matches 'totalPaidAmount'
                                        if (col.header === 'Amount' || accessorKey === 'totalPaidAmount') {
                                             return <td key={cIdx} className="border border-gray-300 px-2 py-1 font-bold">₹{typeof val === 'number' ? val.toFixed(2) : val}</td>;
                                        }
                                        
                                        // Display values for dynamic fee heads (assuming they are numbers if present in total row)
                                        if (typeof val === 'number') {
                                             return <td key={cIdx} className="border border-gray-300 px-2 py-1">{val}</td>;
                                        }

                                        return <td key={cIdx} className="border border-gray-300 px-2 py-1"></td>;
                                    }

                                    // Formatting
                                    if (accessorKey && (accessorKey.toLowerCase().includes('date') || col.header?.toLowerCase().includes('date'))) {
                                        val = val ? format(new Date(val), 'dd-MMM-yyyy') : '-';
                                    }
                                    if (accessorKey === 'totalPaidAmount' || accessorKey === 'totalPaybleAmount') {
                                        val = typeof val === 'number' ? `₹${val.toFixed(2)}` : val;
                                    }
                                    if (col.header === 'Amount') {
                                         val = typeof val === 'number' ? `₹${val.toFixed(2)}` : val;
                                    }
                                    if (accessorKey === 'status' || accessorKey?.toLowerCase().includes('mode')) {
                                        val = val ? val.toString().toUpperCase() : val;
                                    }

                                    return (
                                        <td key={cIdx} className="border border-gray-300 px-2 py-1">
                                            {val !== undefined && val !== null ? val : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* User Summary Table */}
                {userSummary && Object.keys(userSummary).length > 0 && (
                    <div className="mt-6 page-break-inside-avoid">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-2 py-1 text-left">User Name</th>
                                    {paymentModes.map((mode: any) => (
                                        <th key={mode} className="border border-gray-300 px-2 py-1 text-left">{mode}</th>
                                    ))}
                                    <th className="border border-gray-300 px-2 py-1 text-left">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(userSummary).map(([user, stats]: [string, any]) => (
                                    <tr key={user}>
                                        <td className="border border-gray-300 px-2 py-1">{user}</td>
                                        {paymentModes.map((mode: any) => (
                                            <td key={mode} className="border border-gray-300 px-2 py-1">
                                                {stats[mode] ? `₹${stats[mode].toFixed(2)}` : '-'}
                                            </td>
                                        ))}
                                        <td className="border border-gray-300 px-2 py-1 font-semibold">
                                            ₹{stats.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="font-bold bg-gray-50">
                                    <td className="border border-gray-300 px-2 py-1">Total</td>
                                    {paymentModes.map((mode: any) => {
                                        const sum = Object.values(userSummary).reduce((acc: number, curr: any) => acc + (curr[mode] || 0), 0);
                                        return <td key={mode} className="border border-gray-300 px-2 py-1">₹{sum.toFixed(2)}</td>;
                                    })}
                                    <td className="border border-gray-300 px-2 py-1">₹{totalCollection.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PrintLayout>
    );
};

export default PrintDailyCollectionReport;
