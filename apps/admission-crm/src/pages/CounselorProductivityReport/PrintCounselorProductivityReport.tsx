import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CounselorProductivityReportData } from '@od-erp/types';
import PrintLayout from '../../components/PrintLayout';


const PrintCounselorProductivityReport = () => {
    const [data, setData] = useState<CounselorProductivityReportData[]>([]);
    const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
    const [stageType, setStageType] = useState<string>('lead');

    useEffect(() => {
        const storedData = localStorage.getItem('counselorProductivityData');
        const storedColumns = localStorage.getItem('counselorProductivityDynamicColumns');
        const storedStage = localStorage.getItem('counselorProductivityStageType');

        if (storedData) {
            setData(JSON.parse(storedData));
        }
        if (storedColumns) {
            setDynamicColumns(JSON.parse(storedColumns));
        }
        if (storedStage) {
            setStageType(storedStage);
        }
    }, []);

    const columns: ColumnDef<CounselorProductivityReportData>[] = [
        { 
            accessorKey: 'position', 
            header: 'S.No', 
            cell: info => {
                const val = info.getValue() as number;
                return val === 0 ? '' : <span className="text-gray-500">{val}</span>;
            }
        },
        { 
            accessorKey: 'counselorName', 
            header: 'Counselor Name',
            cell: info => {
                const val = info.getValue() as string;
                return val === 'Total' ? <span className="font-bold">{val}</span> : <span className="text-gray-700">{val}</span>;
            }
        },
        { 
            accessorKey: 'totalCount', 
            header: stageType === 'lead' ? 'Total Leads' : 'Application Count',
            cell: info => <span className="text-gray-900 font-medium">{info.getValue() as number}</span>
        },
        { 
            accessorKey: 'engagedCount', 
            header: 'Engaged Leads',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                if (row.position === 0) return <span className="font-bold text-gray-900">{val}</span>;
                return <span className="text-gray-900">{val}</span>;
            }
        },
        { 
            accessorKey: 'untouchedCount', 
            header: 'Untouched Leads',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                if (row.position === 0) return <span className="font-bold text-gray-900">{val}</span>;
                return <span className="text-gray-900">{val}</span>;
            }
        },
        { 
            accessorKey: 'completeFollowUp', 
            header: "Today's Follow Up Done",
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                if (row.position === 0) return <span className="font-bold text-gray-900">{val}</span>;
                return <span className="text-gray-900">{val}</span>;
            }
        },
        { 
            accessorKey: 'overDueFollowUp', 
            header: 'Pending Follow Ups',
            cell: info => {
                const val = info.getValue() as number;
                const row = info.row.original;
                if (row.position === 0) return <span className="font-bold text-gray-900">{val}</span>;
                return <span className="text-gray-900">{val}</span>;
            }
        },
    ];

    dynamicColumns.forEach(tag => {
        columns.push({
            accessorKey: `tag_${tag}`,
            header: tag,
            cell: info => {
                const row = info.row.original;
                const val = (row[`tag_${tag}`] || 0) as number;
                
                if (row.position === 0) return <span className="font-bold text-gray-900">{val}</span>;
                return <span className="text-gray-700">{val}</span>;
            }
        });
    });

    return (
        <PrintLayout reportName={`Counselor Productivity ${stageType === 'lead' ? 'Lead' : 'Application'} Report`}>
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
                        {data.map((row, rowIdx) => {
                            const isTotalRow = row.position === 0 || row.counselorName === 'Total';
                            return (
                                <tr key={rowIdx} className={isTotalRow ? 'font-bold bg-gray-50' : ''}>
                                    {columns.map((col: any, colIdx) => {
                                        const key = col.accessorKey;
                                        const header = col.header;
                                        let val = row[key as keyof CounselorProductivityReportData];
                                        
                                        // Handle dynamic columns
                                        if (key.startsWith('tag_')) {
                                            val = (row as any)[key] || 0;
                                        }

                                        let displayVal: any = val !== undefined ? val : '';

                                        if (header === 'S.No' || key === 'position') {
                                            if (isTotalRow) {
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
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </PrintLayout>
    );
};

export default PrintCounselorProductivityReport;
