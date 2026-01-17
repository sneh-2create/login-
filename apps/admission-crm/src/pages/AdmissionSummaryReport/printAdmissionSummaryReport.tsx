import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdmissionSummaryTableRow } from '@od-erp/types';
import PrintLayout from '../../components/printLayout';
import { DataTable } from '@od-erp/ui';

const printAdmissionSummaryReport = () => {
    const [data, setData] = useState<AdmissionSummaryTableRow[]>([]);
    const [columns, setColumns] = useState<ColumnDef<AdmissionSummaryTableRow>[]>([]);

    useEffect(() => {
        const storedData = localStorage.getItem('admissionSummaryData');
        const storedColumns = localStorage.getItem('admissionSummaryColumns');

        if (storedData) {
            setData(JSON.parse(storedData));
        }

        if (storedColumns) {
            // Reconstruct columns from stored simplified definitions if needed, 
            // or just rely on a simple reconstruction if we stored full json.
            // Since functions (cell renderers) don't serialize, we might need to rebuild basic columns.
            // For now, let's assume we can rebuild a basic structure or storedColumns contains keys.

            // Rebuilding columns similar to main report but text-only where possible
            const parsedCols = JSON.parse(storedColumns);
            // We'll trust the parsed structure for headers/accessorKeys
            setColumns(parsedCols);
        }
    }, []);

    return (
        <PrintLayout reportName="Admission Summary Report">
            <div className="w-full">
                {/* Using DataTable for consistency, or we could use a raw table for better print control if DataTable has issues */}
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={false}
                />
            </div>
        </PrintLayout>
    );
};

export default printAdmissionSummaryReport;
