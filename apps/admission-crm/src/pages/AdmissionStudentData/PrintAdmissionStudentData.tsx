import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { TableHead } from '@od-erp/types';
import PrintLayout from '../../components/PrintLayout';

interface PrintData {
    data: any[];
    tableHeads: TableHead[];
    viewName: string;
    entityName: string;
    stage?: string;
}

const PrintAdmissionStudentData = () => {
    const [printData, setPrintData] = useState<PrintData | null>(null);

    useEffect(() => {
        const data = localStorage.getItem('admissionStudentDataPrint');
        if (data) {
            setPrintData(JSON.parse(data));
            localStorage.removeItem('admissionStudentDataPrint');
        }
    }, []);

    if (!printData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading print data...</div>
            </div>
        );
    }

    return (
        <PrintLayout
            reportName={`${printData.viewName} Book`}
            entityName={printData.entityName}
        >
            <div className="w-full text-xs">
                {/* Filters Section (if stage is provided) */}
                {printData.stage && (
                    <div className="mb-4">
                        <div className="p-2">
                            <div><span className="font-semibold">Stage:</span> {printData.stage}</div>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">S.No</th>
                            {printData.tableHeads.map((head) => (
                                <th key={head.value} className="border border-gray-300 px-4 py-2">
                                    {head.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {printData.data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    {index + 1}
                                </td>
                                {printData.tableHeads.map((head) => {
                                    let value = item[head.value];
                                    
                                    // Handle tags
                                    if (head.value === 'tag' || head.value === 'selectedTags') {
                                        return (
                                            <td key={head.value} className="border border-gray-300 px-4 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags?.map((tag: any, tagIndex: number) => (
                                                        <span
                                                            key={tagIndex}
                                                            className="inline-block px-2 py-1 text-xs rounded"
                                                            style={{
                                                                backgroundColor: typeof tag === 'string' ? '#e0e0e0' : tag.colour || '#e0e0e0',
                                                                color: '#000'
                                                            }}
                                                        >
                                                            {typeof tag === 'string' ? tag : tag.tag?.toUpperCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    }
                                    
                                    // Format dates
                                    if (value && (head.value.toLowerCase().includes('date') || head.name.toLowerCase().includes('date'))) {
                                        try {
                                            const date = new Date(value);
                                            if (!isNaN(date.getTime())) {
                                                value = format(date, 'dd-MMM-yyyy');
                                            }
                                        } catch (e) {
                                            // Keep original value if date parsing fails
                                        }
                                    }
                                    
                                    return (
                                        <td key={head.value} className="border border-gray-300 px-4 py-2">
                                            {value || '-'}
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

export default PrintAdmissionStudentData;
