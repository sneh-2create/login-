import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { counselorProductivityReportTableRow } from '@od-erp/types';
import PrintLayout from '../../components/printLayout';
import { DataTable } from '@od-erp/ui';

const PrintCounselorProductivityReport = () => {
    const [data, setData] = useState<counselorProductivityReportTableRow[]>([]);
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

    const columns: ColumnDef<counselorProductivityReportTableRow>[] = [
        { accessorKey: 'position', header: 'S.No', cell: info => info.getValue() === 0 ? '' : info.getValue() },
        { accessorKey: 'counselorName', header: 'Counselor Name' },
        { accessorKey: 'totalCount', header: stageType === 'lead' ? 'Total Leads' : 'Application Count' },
        { accessorKey: 'engagedCount', header: 'Engaged Leads' },
        { accessorKey: 'untouchedCount', header: 'Untouched Leads' },
        { accessorKey: 'completeFollowUp', header: "Today's Follow Up Done" },
        { accessorKey: 'overDueFollowUp', header: 'Pending Follow Ups' },
    ];

    dynamicColumns.forEach(tag => {
        columns.push({
            accessorKey: `tag_${tag}`,
            header: tag,
            cell: info => {
                const row = info.row.original;
                const tagObj = row.tags?.find((t: any) => t.tag === tag);
                return tagObj ? tagObj.count : 0;
            }
        });
    });

    return (
        <PrintLayout reportName={`Counselor Wise Productivity ${stageType === 'lead' ? 'Lead' : 'Application'} Report`}>
            <div className="w-full">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={false}
                />
            </div>
        </PrintLayout>
    );
};

export default PrintCounselorProductivityReport;
