import { useState, useMemo, useEffect } from 'react';
import { DataTable, Button, Select, Breadcrumb } from '@od-erp/ui';
import { useDailyCollectionReport, useExcelTemplates, useDefaultExcelTemplates, useFeeMaster } from '@od-erp/query';
import { AdmissionDailyCollectionReportParams, AdmissionTransaction, TableHead } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Download, Printer, RefreshCw, SlidersHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppSelector } from '@od-erp/store';
import TemplateFilter from './components/TemplateFilter';

const DailyCollectionReportPage = () => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityName = (useAppSelector((state) => state.auth.entityDetails) as any)?.name || 'Okie Dokie';

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '2022-23';
    const [startDate, setStartDate] = useState<number>(new Date().setHours(0, 0, 0, 0));
    const [endDate, setEndDate] = useState<number>(new Date().setHours(23, 59, 59, 999));
    const [statusFilter, setStatusFilter] = useState('confirmed');
    const [paymentModeFilter, setPaymentModeFilter] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedSessions, setSelectedSessions] = useState<string[]>(session ? [session] : []);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

    // Queries
    const { data: feeMaster } = useFeeMaster(entityId, session);
    const { data: templates } = useExcelTemplates(entityId, 'dailyAdmissionCollectionReport');
    const { data: defaultTemplate } = useDefaultExcelTemplates('dailyAdmissionCollectionReport', 'school'); // Assuming entityType is school for now

    const payload: AdmissionDailyCollectionReportParams = useMemo(() => ({
        entity: entityId,
        session: selectedSessions.length > 0 ? selectedSessions : [],
        startDate,
        endDate,
        status: statusFilter,
        paymentMode: paymentModeFilter,
        courses: selectedCourses,
    }), [entityId, selectedSessions, startDate, endDate, statusFilter, paymentModeFilter, selectedCourses]);

    const { data: reportData, isLoading, refetch } = useDailyCollectionReport(payload);

    const [showFilter, setShowFilter] = useState(false);

    // Initial Filter Setup from Template
    useEffect(() => {
        if (templates && templates.length > 0) {
            const firstTemplate = templates[0];
            setSelectedTemplate(firstTemplate.viewName);
            // Apply template default filters if any
             if (firstTemplate.filterValues) {
                firstTemplate.filterValues.forEach((f: any) => {
                    if (f.filter === 'startDate') {
                        const d = new Date();
                        if (f.value === 'lastWeek') d.setDate(d.getDate() - 7);
                        if (f.value === 'lastMonth') d.setDate(d.getDate() - 30);
                        d.setHours(0, 0, 0, 0);
                        setStartDate(d.getTime());
                    }
                    if (f.filter === 'endDate') {
                        const d = new Date();
                        if (f.value === 'lastWeek') d.setDate(d.getDate() + 7);
                         d.setHours(23, 59, 59, 999);
                        setEndDate(d.getTime());
                    }
                     if (f.filter === 'status') setStatusFilter(f.value);
                     if (f.filter === 'paymentMode') setPaymentModeFilter(f.value);
                });
            }
        }
    }, [templates]);

    // Data Processing: Flatten Fee Heads & Calculate Totals & User Summary
    const { processedData, dynamicFeeHeads, userSummary, grandTotal } = useMemo(() => {
        if (!reportData || reportData.length === 0) {
            return { processedData: [], dynamicFeeHeads: [], userSummary: {}, grandTotal: 0 };
        }

        const heads = new Set<string>();
        const summary: Record<string, Record<string, number>> = {};
        let totalCollection = 0;
        const columnTotals: Record<string, number> = {};
        
        const processed = reportData.map((row, index) => {
            const newRow: any = { 
                ...row,
                sno: index + 1 // Add S.No here for export/print consistency
            };
            
            // Flatten Fee Heads from receipt
            if (row.receipt && Array.isArray(row.receipt)) {
                row.receipt.forEach((r) => {
                    if (r.admissionHead) {
                        heads.add(r.admissionHead);
                        newRow[r.admissionHead] = (newRow[r.admissionHead] || 0) + r.paidAmount;
                        columnTotals[r.admissionHead] = (columnTotals[r.admissionHead] || 0) + r.paidAmount;
                    }
                });
            }

             // User Summary Logic (User Name -> Payment Mode -> Amount)
             const user = (row as any).userName || 'Unknown';
             const mode = row.paymentDetails?.paymentMode || 'Unknown';
             const amount = row.totalPaidAmount || 0;

             if (!summary[user]) summary[user] = { total: 0 };
             summary[user][mode] = (summary[user][mode] || 0) + amount;
             summary[user].total += amount;

             totalCollection += amount;
             return newRow;
        });

        // Create Total Row (only if there is data)
        if (processed.length > 0) {
            const totalRow: any = {
                _id: 'TOTAL_ROW',
                sno: 'Total',
                receiptId: '', 
                studentData: { name: 'Total', phone: '' },
                totalPaidAmount: totalCollection,
                isTotalRow: true
            };
            // Add Fee Head Totals to Total Row
            heads.forEach(h => totalRow[h] = columnTotals[h] || 0);
            processed.push(totalRow);
        }

        return { 
            processedData: processed, 
            dynamicFeeHeads: Array.from(heads), 
            userSummary: summary, 
            grandTotal: totalCollection 
        };
    }, [reportData]);


    // Table Columns Construction
    const columns = useMemo<ColumnDef<AdmissionTransaction>[]>(() => {
        let tableHeads: TableHead[] = [];
        
        const currentTemplate = templates?.find(t => t.viewName === selectedTemplate);
        
        if (currentTemplate) {
            tableHeads = currentTemplate.tableHeads;
        } else if (defaultTemplate) {
            tableHeads = defaultTemplate.tableHeads;
        } else {
             // Fallback columns
            return [
                 { header: 'S.No', accessorKey: 'sno', cell: info => info.getValue() },
                 { header: 'Date', accessorKey: 'date', cell: info => info.getValue() ? format(new Date(info.getValue() as number), 'dd-MMM-yyyy') : '-' },
                 { header: 'Receipt Id', accessorKey: 'receiptId' },
                 { header: 'Name', accessorKey: 'studentData.name' },
                 { header: 'Amount', accessorKey: 'totalPaidAmount' }
            ];
        }

        const generatedColumns: ColumnDef<AdmissionTransaction>[] = [
             {
                header: 'S.No',
                accessorKey: 'sno',
                cell: info => {
                    // Check if it's the Total row
                    if ((info.row.original as any).isTotalRow) return <span className="font-bold">Total</span>;
                    return info.getValue();
                },
            }
        ];

        // Process configured columns
        const regularHeads = tableHeads.filter(h => h.value !== 'totalPaidAmount' && h.value !== 'admissionHeads').sort((a,b) => a.seqNo - b.seqNo);
        const hasAdmissionHeadsPlaceholder = tableHeads.some(h => h.value === 'admissionHeads');

        const createColumn = (head: TableHead) => {
             let accessor = head.value;
             let headerName = head.name;

             // Map known fields to deep accessors
             if (head.value === 'studentName' || head.value === 'name') accessor = 'studentData.name';
             if (head.value === 'applicationDetailsCourse' || head.value === 'class') accessor = 'applicationDetails.course';
             if (head.value === 'applicationDetailsStream' || head.value === 'stream') accessor = 'applicationDetails.stream';
             if (head.value === 'batch') accessor = 'studentData.batch'; // Updated from sample
             if (head.value === 'session') accessor = 'session';
             if (head.value === 'fatherName') accessor = 'studentData.fatherName';
             if (head.value === 'phone' || head.value === 'studentMobile') accessor = 'studentData.phone';
             if (head.value === 'paymentDetailsPaymentMode' || head.value === 'payMode') accessor = 'paymentDetails.paymentMode';
             if (head.value === 'paymentDetailsRefId' || head.value === 'refNo') accessor = 'paymentDetails.transactionId'; // fallback to bankAccount or other if needed? keeping transactionId for now
             if (head.value === 'paymentDetailsDate' || head.value === 'chequeDate') accessor = 'paymentDetails.date'; // Updated from sample
             if (head.value === 'paymentDetailsBankName' || head.value === 'bankName') accessor = 'paymentDetails.bankAccount'; // Updated from sample
             if (head.value === 'remarks' || head.value === 'remark') accessor = 'remarks';
             if (head.value === 'studentRegNo') accessor = 'studentRegNo';
             if (head.value === 'applicationNumber') accessor = 'applicationNumber'; // Updated from sample
             if (head.value === 'totalPaybleAmount') accessor = 'totalPaybleAmount'; 
             if (head.value === 'fineRemark') accessor = 'fineRemark';
             if (head.value === 'userName') accessor = 'userName';
             if (head.value === 'cancellationRemark') accessor = 'cancellationRemark';
             if (head.value === 'cancelledByUserName') accessor = 'cancelledByUserName';
             if (head.value === 'cancelledByUserMobile') accessor = 'cancelledByUserMobile';
             if (head.value === 'familyId') accessor = 'studentData.familyId'; 

             return {
                 header: headerName,
                 accessorKey: accessor,
                 cell: (info: any) => {
                     const val = info.getValue();
                     const isTotal = (info.row.original as any).isTotalRow;

                     if (isTotal) return ''; // Empty for other columns in Total row

                     // Handle date formatting for known date columns
                     if (
                        head.value.toLowerCase().includes('date') || 
                        accessor.toLowerCase().includes('date')
                    ) {
                         return val ? format(new Date(val), 'dd-MMM-yyyy') : '-';
                     }
                     
                     if (head.value === 'status') {
                         return (
                             <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                 {val ? val.toUpperCase() : 'CONFIRMED'}
                             </span>
                         )
                     }
                     return val || '-';
                 }
             };
        };

        regularHeads.forEach(head => generatedColumns.push(createColumn(head)));

        // Add Dynamic Fee Heads (if placeholder exists or if dynamic heads are present and no placeholder)
        if (hasAdmissionHeadsPlaceholder || dynamicFeeHeads.length > 0) {
             dynamicFeeHeads.forEach(headName => {
                 generatedColumns.push({
                      header: headName.toUpperCase(),
                      accessorKey: headName,
                      cell: info => {
                          const val = info.getValue() as number;
                          const isTotal = (info.row.original as any).isTotalRow;
                          return <span className={isTotal ? "font-bold" : ""}>{val !== undefined ? val : 0}</span>;
                      }
                 });
             });
        }

        // Force Total Paid Amount Last
        generatedColumns.push({
            header: 'Total Paid Amount',
            accessorKey: 'totalPaidAmount',
            cell: info => {
                const val = info.getValue() as number;
                const isTotal = (info.row.original as any).isTotalRow;
                return <span className={isTotal ? "font-bold" : ""}>{val ? `₹${val.toFixed(2)}` : '0'}</span>;
            }
        });

        return generatedColumns;

    }, [templates, selectedTemplate, defaultTemplate, reportData, dynamicFeeHeads]);


    const handleExportExcel = () => {
        if (!processedData || processedData.length === 0) return;

        const wb = XLSX.utils.book_new();
        const ws: XLSX.WorkSheet = {};

        // Header Metadata
        XLSX.utils.sheet_add_aoa(ws, [['This is a system-generated report by Okie Dokie']], { origin: "A1" });
        XLSX.utils.sheet_add_aoa(ws, [[`Generated At: ${format(new Date(), 'dd-MMM-yyyy HH:mm a')}`]], { origin: "A2" });
        XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A3" });
        XLSX.utils.sheet_add_aoa(ws, [[entityName]], { origin: "A4" });
        XLSX.utils.sheet_add_aoa(ws, [['Daily Collection Report']], { origin: "A5" });
        XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A6" });

        // Table Header
        const tableHeader = columns.filter(c => c.header && typeof c.header === 'string').map(c => c.header as string);
        XLSX.utils.sheet_add_aoa(ws, [tableHeader], { origin: "A7" });

        // Data Rows
        const dataRows = processedData.map((row: any) => {
             return columns
                .filter(c => c.header && typeof c.header === 'string')
                .map(col => {
                     const accessorKey = (col as any).accessorKey;
                     let val = row[accessorKey];
                     // Attempt to fetch if nested (accessorKey has dots)
                     if (!val && accessorKey?.includes('.')) {
                         val = accessorKey.split('.').reduce((o: any, i: any) => o?.[i], row);
                     }
                     
                     if (row.isTotalRow) {
                         if (col.header === 'S.No') return 'Total';
                         if (col.header === 'Total Paid Amount' || accessorKey === 'totalPaidAmount') return val;
                         if (dynamicFeeHeads.includes(accessorKey)) return val;
                         return ''; // Clear non-numeric/totals for Total row
                     }

                     // specific formatting for Excel if needed
                     if ((col as any).header?.toString().toLowerCase().includes('date') && val) {
                         return format(new Date(val), 'dd-MMM-yyyy');
                     }
                     if (col.header === 'Status' && val) {
                         return val.toUpperCase();
                     }

                     return val || '';
                });
        });

        XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A8" });

        // Summary
        const summaryStartRow = 8 + dataRows.length;
        
        const summaryData: any[] = [];
        const paymentModes = Array.from(new Set(Object.values(userSummary).flatMap(u => Object.keys(u).filter(k => k !== 'total'))));
        
        // Header
        const summaryHeader = ['User Name', ...paymentModes, 'Total'];
        summaryData.push(summaryHeader);

        // Rows
        Object.entries(userSummary).forEach(([user, stats]) => {
            const row: any[] = [user];
            paymentModes.forEach(mode => row.push(stats[mode] || 0));
            row.push(stats.total);
            summaryData.push(row);
        });

        XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: { r: summaryStartRow + 1, c: 0 } });

        // Signatures
        const signatureRow = summaryStartRow + summaryData.length + 4;
        XLSX.utils.sheet_add_aoa(ws, [['Principal\'s Signature', '', '', 'Authorised Signature']], { origin: { r: signatureRow, c: 0 } });

        XLSX.utils.book_append_sheet(wb, ws, 'DailyCollection');
        XLSX.writeFile(wb, `DailyCollection_${session}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    };

    const handlePrint = () => {
        if (!processedData || processedData.length === 0) return;
        
        // Prepare data for print window
        const printData = {
            entityName,
            startDate,
            endDate,
            reportData: processedData,
            headers: columns.map(c => ({ header: c.header, accessorKey: (c as any).accessorKey })),
            userSummary,
            totalCollection: grandTotal
        };

        localStorage.setItem('dailyCollectionPrintData', JSON.stringify(printData));
        
        // Open Print Window
        window.open('/admission/print/dailyCollectionReport', '_blank');
    };

    return (
        <div className="w-full max-w-full font-sans pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Collection Report</h1>
                    <Breadcrumb 
                        items={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Admissions', href: '/admissions' },
                            { label: 'Reports', href: '/admissions/reports' },
                            { label: 'Daily Collection Report' }
                        ]}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    {/* Filter Toggle */}
                    <Button 
                        variant="outline" 
                        className={`!p-0 !w-9 !h-9 border-gray-300 ${showFilter ? 'bg-orange-50 border-orange-200 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setShowFilter(!showFilter)}
                        title="Filter"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Refresh */}
                    {reportData && reportData.length > 0 && (
                        <Button 
                            variant="outline" 
                            className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                            onClick={() => refetch()}
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    )}

                    {/* Excel Export */}
                    {reportData && reportData.length > 0 && (
                        <Button 
                            variant="outline" 
                            className="!p-0 !w-9 !h-9 border-gray-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                            onClick={handleExportExcel}
                            title="Export to Excel"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}

                     {/* Print */}
                     {reportData && reportData.length > 0 && (
                        <Button 
                            variant="outline" 
                            className="!p-0 !w-9 !h-9 border-gray-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                            onClick={handlePrint}
                            title="Print"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Collapsible Filter Card */}
            {showFilter && (
                <TemplateFilter 
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    status={statusFilter}
                    setStatus={setStatusFilter}
                    paymentMode={paymentModeFilter}
                    setPaymentMode={setPaymentModeFilter}
                    selectedCourses={selectedCourses}
                    setSelectedCourses={setSelectedCourses}
                    selectedSession={selectedSessions}
                    setSelectedSession={setSelectedSessions}
                    paymentModeList={feeMaster?.paymentMode || []}
                    onApply={() => {
                        refetch();
                        setShowFilter(false);
                    }}
                    session={session}
                />
            )}

            {/* Table and Summary - Conditional Rendering */}
            {reportData && reportData.length > 0 && (
                <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
                        <h3 className="font-semibold text-gray-700 whitespace-nowrap">Report Data</h3>
                        
                        <div className="flex items-center gap-2 w-full justify-end">
                            {templates && templates.length > 0 && (
                                <Select 
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    options={templates.map(t => ({ label: t.viewName.toUpperCase(), value: t.viewName }))}
                                    className="w-48 h-8 text-xs"
                                />
                            )}
                        </div>
                    </div>

                    <div className="w-full max-w-full overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={processedData || []}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyCollectionReportPage;
