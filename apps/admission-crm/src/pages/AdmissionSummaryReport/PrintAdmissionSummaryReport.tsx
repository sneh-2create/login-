import { useEffect, useState } from 'react';
import PrintLayout from '../../components/PrintLayout';

const PrintAdmissionSummaryReport = () => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('admissionSummaryData');
        const storedColumns = localStorage.getItem('admissionSummaryColumns');

        if (storedData) setData(JSON.parse(storedData));
        if (storedColumns) setColumns(JSON.parse(storedColumns));
    }, []);

    return (
        <PrintLayout reportName="Admission Summary Report">
            <div className="w-full">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            {columns.map((col: any, idx) => (
                                <th key={idx} className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                                    {col.header as string}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row: any, rowIdx) => (
                            <tr key={rowIdx} className={row.course === 'Total' ? 'font-bold bg-gray-50' : ''}>
                            {columns.map((col: any, colIdx) => {
                                const val = row[col.accessorKey];
                                let displayVal = val !== undefined ? val : '';

                                if (col.header === 'S.No' || col.accessorKey === 'position') {
                                    if (row.course === 'Total') {
                                        displayVal = '';
                                    } else {
                                        displayVal = val || (rowIdx + 1);
                                    }
                                }

                                return (
                                    <td key={colIdx} className="border border-gray-300 px-3 py-2">
                                        {displayVal}
                                    </td>
                                );
                            })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PrintLayout>
    );
};

export default PrintAdmissionSummaryReport;
