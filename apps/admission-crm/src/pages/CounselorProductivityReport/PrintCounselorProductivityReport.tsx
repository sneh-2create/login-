import { useEffect, useState } from 'react';
import { Title, DataTable } from '@od-erp/ui';
import { ColumnDef } from '@tanstack/react-table';
import { CounselorProductivityReportTableRow } from '@od-erp/types';

const PrintCounselorProductivityReport = () => {
    const [data, setData] = useState<CounselorProductivityReportTableRow[]>([]);
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

    const columns: ColumnDef<CounselorProductivityReportTableRow>[] = [
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
                const tagObj = row.tags?.find(t => t.tag === tag);
                return tagObj ? tagObj.count : 0;
            }
        });
    });

    useEffect(() => {
        if (data.length > 0) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [data]);

    return (
        <div className="flex flex-col h-full bg-white p-6 gap-6">
            <div className="text-center mb-6">
                <Title variant="pageTitle">Counselor Wise Productivity {stageType === 'lead' ? 'Lead' : 'Application'} Report</Title>
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={false}
            />
        </div>
    );
};

export default PrintCounselorProductivityReport;
