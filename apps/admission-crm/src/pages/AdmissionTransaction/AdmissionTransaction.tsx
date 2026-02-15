import { useState, useMemo, useEffect } from 'react';
import { DataTable, Button, Input, Dropdown, Breadcrumb, useToast, EmptyState } from '@od-erp/ui';
import { useAdmissionTransactions, useDeleteAdmissionTransaction, useExcelTemplates, useRetryAdmissionVoucher, useFeeMaster, useDefaultExcelTemplates, useSessions } from '@od-erp/query';
import { AdmissionTransactionPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Download, Printer, Trash2, Eye, SlidersHorizontal, Edit, XCircle, RotateCcw, RefreshCw, Search, Upload } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';
import { FilterCard } from './components/FilterCard';
import { EditTransactionDialog } from './components/EditTransactionDialog';
import { CancelTransactionDialog } from './components/CancelTransactionDialog';
import { ViewTransactionDialog } from './components/ViewTransactionDialog';
import { ActionMenu } from './components/ActionMenu';
import { useDebounce } from '@od-erp/utils';
import { processTransactionData, extractFeeHeadNames, ProcessedTransaction } from './utils/dataProcessor';
import * as XLSX from 'xlsx';
import { DEFAULT_ADMISSION_TRANSACTION_REPORT_HEADS } from '@od-erp/constants';

const AdmissionTransactionPage = () => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityType = useAppSelector((state) => state.session.entityType || '');
    const entityPreferences = useAppSelector((state) => state.config.entityPreferences) || null;
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const autoVoucher = (entityPreferences as any)?.autoVoucher || false;
    const { showToast } = useToast();

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [pageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    
    // Local filter state (changes immediately)
    const [statusFilter, setStatusFilter] = useState('');
    const [voucherStatusFilter, setVoucherStatusFilter] = useState('');
    const [startDate, setStartDate] = useState<number>(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0, 0, 0, 0));
    const [endDate, setEndDate] = useState<number>(new Date().setHours(23, 59, 59, 999));
    
    // Applied filter state (only changes on Apply button click)
    const [appliedFilters, setAppliedFilters] = useState({
        status: '',
        voucherStatus: '',
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0, 0, 0, 0),
        endDate: new Date().setHours(23, 59, 59, 999),
        session: session
    });
    
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [showFilter, setShowFilter] = useState(false);

    // Dialog States
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    // Mutations
    const deleteMutation = useDeleteAdmissionTransaction();
    const retryVoucherMutation = useRetryAdmissionVoucher();

    // Queries
    const { data: sessions } = useSessions(entityId);
    const { data: feeMaster } = useFeeMaster(entityId, appliedFilters.session || session);
    const { data: excelTemplates } = useExcelTemplates(entityId, 'admissionTransactionReport');
    const { data: defaultTemplate } = useDefaultExcelTemplates('admissionTransactionReport', entityType);

    // Payload uses APPLIED filters, not local state
    const payload: AdmissionTransactionPayload = useMemo(() => ({
        entity: entityId,
        session: appliedFilters.session || session,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        status: appliedFilters.status,
        voucherStatus: appliedFilters.voucherStatus,
        search: debouncedSearch,
        pageNumber,
        pageSize
    }), [entityId, appliedFilters, session, debouncedSearch, pageNumber, pageSize]);


    // Set selected template - use first template, default template, or hardcoded fallback
    useEffect(() => {
        if (excelTemplates && excelTemplates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(excelTemplates[0]);
        } else if (defaultTemplate && !selectedTemplate && (!excelTemplates || excelTemplates.length === 0)) {
            setSelectedTemplate(defaultTemplate);
        } else if (!selectedTemplate && (!excelTemplates || excelTemplates.length === 0) && !defaultTemplate) {
            setSelectedTemplate({ tableHeads: DEFAULT_ADMISSION_TRANSACTION_REPORT_HEADS });
        }
    }, [excelTemplates, defaultTemplate, selectedTemplate]);

    const { data: transactions, isLoading, refetch } = useAdmissionTransactions(payload);

    // Check if template has 'admissionHeads' column (Angular logic)
    // If it exists, remove it and enable individual fee head columns
    const includeFeeHeads = useMemo(() => {
        if (!selectedTemplate?.tableHeads) return false;
        return selectedTemplate.tableHeads.some((h: any) => h.value === 'admissionHeads');
    }, [selectedTemplate]);
    
    const feeHeadNames = useMemo(() => {
        if (!includeFeeHeads || !transactions) return [];
        return extractFeeHeadNames(transactions);
    }, [transactions, includeFeeHeads]);

    // Process data with totals
    const processedData = useMemo(() => {
        return processTransactionData(transactions, includeFeeHeads);
    }, [transactions, includeFeeHeads]);

    // Client-side search filtering
    const filteredData = useMemo(() => {
        if (!searchTerm) return processedData;
        const searchLower = searchTerm.toLowerCase();
        return processedData.filter(row => {
            if (row.receiptId === 'Total') return true; // Always show total row
            return (
                row.receiptId?.toLowerCase().includes(searchLower) ||
                row.studentName?.toLowerCase().includes(searchLower) ||
                row.applicationDetailsCourse?.toLowerCase().includes(searchLower) ||
                row.applicationDetailsStream?.toLowerCase().includes(searchLower)
            );
        });
    }, [processedData, searchTerm]);

    // Template-Based Columns (from Excel template, default template, or hardcoded fallback)
    const columns = useMemo<ColumnDef<ProcessedTransaction>[]>(() => {
        let baseCols: ColumnDef<ProcessedTransaction>[] = [
             {
                header: 'S.No',
                accessorKey: 'sno',
                cell: info => {
                    const isTotalRow = info.row.original.receiptId === 'Total';
                    if (isTotalRow) return <span className="font-bold">Total</span>;
                    return info.row.index + 1;
                },
            },
        ];

        let dynamicCols = [];
        // Default Columns or Template Columns
        const heads = selectedTemplate?.tableHeads || [
             { name: 'Receipt No.', value: 'receiptId' },
             { name: 'Date', value: 'date' },
             { name: 'Student Name', value: 'studentName' },
             { name: 'Father Name', value: 'fatherName' },
             { name: 'Phone', value: 'phone' },
             { name: 'Class', value: 'applicationDetailsCourse' },
             { name: 'Stream', value: 'applicationDetailsStream' },
             { name: 'Batch', value: 'batch' },
             { name: 'Session', value: 'session' },
             { name: 'Pay Mode', value: 'paymentDetailsPaymentMode' },
             { name: 'Ref No.', value: 'paymentDetailsRefId' },
             { name: 'Bank Name', value: 'paymentDetailsBankName' },
             { name: 'Cheque Date', value: 'paymentDetailsDate' },
             { name: 'Remarks', value: 'remarks' },
             { name: 'Amount', value: 'totalPaidAmount' },
             { name: 'Status', value: 'status' }
        ];

        dynamicCols = heads.map((h: any) => {
            let accessor = h.value;
            // Map to nested properties
            if (h.value === 'fatherName') accessor = 'studentData.fatherName';
            if (h.value === 'phone') accessor = 'studentData.phone';
            if (h.value === 'batch') accessor = 'studentData.batch';
            if (h.value === 'paymentDetailsRefId') accessor = 'paymentDetails.refId';
            if (h.value === 'paymentDetailsBankName') accessor = 'paymentDetails.bankAccount';
            if (h.value === 'paymentDetailsDate') accessor = 'paymentDetails.date';
            
            return {
                header: h.name,
                accessorKey: accessor,
                cell: (info: any) => {
                    let val = info.getValue();
                    const row = info.row.original;
                    
                    // For nested properties, try to access them
                    if (!val && accessor.includes('.')) {
                        val = accessor.split('.').reduce((o: any, i: any) => o?.[i], row);
                    }
                    
                    // Bold total row
                    const isTotalRow = row.receiptId === 'Total';
                    const className = isTotalRow ? 'font-bold' : '';
                    
                    if (isTotalRow && h.value !== 'totalPaidAmount') return '';
                    
                    if (h.value === 'date' || h.value === 'paymentDetailsDate') {
                        return <span className={className}>{val ? format(new Date(val), 'dd-MMM-yyyy') : '-'}</span>;
                    }
                    if (h.value === 'totalPaidAmount' || h.value.includes('amount')) {
                        return <span className={className}>{val !== undefined && val !== null ? `₹${val.toFixed(2)}` : '-'}</span>;
                    }
                    if (h.value === 'status') {
                    return (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {val ? val.toUpperCase() : 'CONFIRMED'}
                        </span>
                    );
                }
                    return <span className={className}>{val !== undefined && val !== null ? val : '-'}</span>;
                }
            };
        });

        // Filter out 'admissionHeads' column if it exists (Angular logic)
        // This column is replaced by individual fee head columns
        dynamicCols = dynamicCols.filter((col: any) => {
            const head = heads.find((h: any) => h.name === col.header);
            return !head || head.value !== 'admissionHeads';
        });

        // Add fee head columns if 'admissionHeads' column was present
        if (includeFeeHeads && feeHeadNames.length > 0) {
            const feeHeadCols = feeHeadNames.map(feeHeadName => ({
                header: feeHeadName,
                accessorKey: `feeHead_${feeHeadName}`,
                cell: (info: any) => {
                    const val = info.getValue();
                    const isTotalRow = info.row.original.receiptId === 'Total';
                    const className = isTotalRow ? 'font-bold' : '';
                    return <span className={className}>{val !== undefined && val !== null ? `₹${val.toFixed(2)}` : '-'}</span>;
                }
            }));
            dynamicCols = [...dynamicCols, ...feeHeadCols];
        }

        return [
            ...baseCols,
            ...dynamicCols,
            {
                header: 'Action',
                id: 'actions',
                cell: info => {
                     const row = info.row.original;
                     if(row.receiptId === 'Total') return null;

                     const menuItems = [
                         {
                             label: 'View Transaction',
                             icon: <Eye className="h-4 w-4" />,
                             onClick: () => handleView(row),
                             hidden: !permissions.includes('viewAdmissionTransaction')
                         },
                         {
                             label: 'Edit Transaction',
                             icon: <Edit className="h-4 w-4" />,
                             onClick: () => handleEdit(row),
                             hidden: !permissions.includes('editAdmissionTransaction')
                         },
                         {
                             label: 'Cancel Transaction',
                             icon: <XCircle className="h-4 w-4" />,
                             onClick: () => handleCancel(row),
                             hidden: !permissions.includes('cancelAdmissionReceipt')
                         },
                         {
                             label: 'Retry Accounting Voucher',
                             icon: <RotateCcw className="h-4 w-4" />,
                             onClick: () => handleRetryVoucher(row._id),
                             hidden: !autoVoucher || row.voucherStatus || !permissions.includes('reCreateAccountingVoucher')
                         },
                         {
                             label: 'Push to OD Pay',
                             icon: <Upload className="h-4 w-4" />,
                             onClick: () => handlePushToODPay(row),
                             hidden: !(entityPreferences as any)?.pushTransactionToODPay
                         },
                         {
                             label: 'Delete Receipt',
                             icon: <Trash2 className="h-4 w-4" />,
                             onClick: () => handleDelete(row._id),
                             disabled: row.voucherStatus,
                             hidden: !permissions.includes('deleteAdmissionTransaction'),
                             className: 'text-red-600 hover:bg-red-50'
                         }
                     ];

                     return <ActionMenu items={menuItems} />;
                }
            }
        ];
    }, [selectedTemplate, pageNumber, pageSize, autoVoucher, includeFeeHeads, feeHeadNames]);

    // Handlers
    const handleView = (row: any) => {
        // Open print receipt in new window
        window.open(
            `/admission/print/open/admissionTransactionReceipt/${row._id}`,
            '_blank'
        );
    };

    const handleEdit = async (row: any) => {
        if (row.status === 'cancelled') {
            showToast('error', 'Receipt already cancelled, receipt editing is not allowed');
            return;
        }
        if (row.voucherStatus) {
            showToast('error', 'Voucher is already created; receipt editing is not allowed');
            return;
        }
        
        try {
            // Fetch full transaction data from API (matches Angular flow)
            const { admissionTransactionService } = await import('@od-erp/api-client');
            const fullTransaction = await admissionTransactionService.getAdmissionTransactionById(row._id);
            setSelectedTransaction(fullTransaction);
            setEditDialogOpen(true);
        } catch (error) {
            showToast('error', 'Failed to load transaction details');
        }
    };

    const handleCancel = (row: any) => {
        if (row.status === 'cancelled') {
            showToast('error', 'Receipt already cancelled');
            return;
        }
        setSelectedTransaction(row);
        setCancelDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Receipt, once deleted, cant be recovered - Do you want to proceed')) {
            try {
                await deleteMutation.mutateAsync(id);
                showToast('success', 'Receipt deleted successfully');
                refetch();
            } catch (error) {
                showToast('error', 'Failed to delete receipt');
            }
        }
    };

    const handleRetryVoucher = async (id: string) => {
        try {
            await retryVoucherMutation.mutateAsync(id);
            showToast('success', 'Voucher retry initiated');
            refetch();
        } catch (e) {
            showToast('error', 'Failed to retry voucher');
        }
    };

    const handleExportExcel = () => {
        if (!processedData.length) {
            showToast('warning', 'No data to export');
            return;
        }
        
        try {
            // Filter out 'admissionHeads' column
            const heads = selectedTemplate?.tableHeads?.filter((h: any) => h.value !== 'admissionHeads') || [];
            
            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([]);

            // Title
            XLSX.utils.sheet_add_aoa(ws, [['Admission Transaction Report']], { origin: 'A1' });
            XLSX.utils.sheet_add_aoa(ws, [[`Generated At: ${new Date().toLocaleString()}`]], { origin: 'A2' });
            XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A3' });

            // Table Headers - S.No + Template columns + Fee head columns
            const tableHeaders = ['S.No', ...heads.map((h: any) => h.name), ...feeHeadNames];
            XLSX.utils.sheet_add_aoa(ws, [tableHeaders], { origin: 'A4' });

            // Data Rows
            const dataRows = processedData.map((row, index) => {
                const isTotalRow = row.receiptId === 'Total';
                const rowData: any[] = [];

                // S.No column (empty for total row)
                rowData.push(isTotalRow ? '' : index + 1);

                // Template columns
                heads.forEach((head: any) => {
                    let value = (row as any)[head.value];
                    
                    // Skip non-amount columns for total row
                    if (isTotalRow && head.value !== 'totalPaidAmount' && !head.value.includes('amount')) {
                        rowData.push('');
                        return;
                    }
                    
                    // Format dates
                    if ((head.value === 'date' || head.value === 'paymentDetailsDate') && value) {
                        value = format(new Date(value as number), 'dd-MMM-yyyy');
                    }
                    
                    // Format numbers
                    if (typeof value === 'number' && head.value.includes('amount')) {
                        value = value.toFixed(2);
                    }

                    rowData.push(value !== undefined && value !== null ? value : '-');
                });

                // Fee head columns
                feeHeadNames.forEach(feeHeadName => {
                    const feeHeadValue = (row as any)[`feeHead_${feeHeadName}`];
                    rowData.push(feeHeadValue !== undefined && feeHeadValue !== null ? feeHeadValue.toFixed(2) : '-');
                });

                return rowData;
            });

            XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: 'A5' });

            XLSX.utils.book_append_sheet(wb, ws, 'Admission Transaction');
            
            // Generate filename and download
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
            const filename = `Admission_Transactions_${appliedFilters.session || session}_${timestamp}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            showToast('success', 'Excel exported successfully');
        } catch (error) {
            console.error('Export failed', error);
            showToast('error', 'Failed to export Excel');
        }
    };

    const handlePrint = () => {
         if (!transactions) {
            showToast('warning', 'No data to print');
            return;
         }
        
        // Prepare print data with template columns and fee heads
        const printData = {
            transactions: processedData,
            tableHeads: selectedTemplate?.tableHeads?.filter((h: any) => h.value !== 'admissionHeads') || [],
            feeHeadNames: includeFeeHeads ? feeHeadNames : [],
            metadata: {
                session: appliedFilters.session || session,
                startDate: appliedFilters.startDate,
                endDate: appliedFilters.endDate,
                status: appliedFilters.status,
                voucherStatus: appliedFilters.voucherStatus,
                generatedOn: format(new Date(), 'dd-MMM-yyyy HH:mm:ss')
            }
        };
        localStorage.setItem('admissionTransactionPrintData', JSON.stringify(printData));
        window.open('/admission/print/admissionTransaction', '_blank');
    };

    const handlePushToODPay = async (row: any) => {
        try {
            const { admissionTransactionService } = await import('@od-erp/api-client');
            
            // Match Angular's payload structure exactly
            const formData = {
                ...row,
                erpTransactionType: "admission",
                studentName: row.studentData?.name,
                phone: row.studentData?.phone
            };
            
            const response = await admissionTransactionService.pushTxnToODPay(formData);
            showToast('success', response.message || 'Transaction pushed to OD Pay successfully');
        } catch (error: any) {
            showToast('error', error?.response?.data?.message || 'Failed to push transaction to OD Pay');
        }
    };

    const handleRefresh = () => {
        refetch();
        showToast('info', 'Data refreshed');
    };

    const breadcrumbItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admission Transaction', href: '#' }
    ];

    return (
        <div className="w-full max-w-full font-sans pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admission Transaction</h1>
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <div className="flex items-center space-x-2">
                    {/* Select Session Dropdown */}
                    {sessions && sessions.length > 0 && (
                        <Dropdown
                            value={appliedFilters.session || session}
                            onChange={(val) => {
                                setAppliedFilters(prev => ({ ...prev, session: val as string }));
                            }}
                            options={sessions.map((s: any) => ({ value: s.name, label: s.name }))}
                            className="w-48 h-9"
                        />
                    )}
                    
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
                    <Button 
                        variant="outline" 
                        className="!p-0 !w-9 !h-9 border-gray-300 text-gray-500 hover:text-gray-700"
                        onClick={handleRefresh}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>

                    {/* Excel Export */}
                    {processedData.length > 0 && (
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
                     {processedData.length > 0 && (
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
                <FilterCard
                    startDate={startDate}
                    endDate={endDate}
                    status={statusFilter}
                    voucherStatus={voucherStatusFilter}
                    autoVoucherEnabled={autoVoucher}
                    onApply={(filters) => {
                        // Update applied filters - this will trigger API refetch
                        setAppliedFilters({
                            startDate: filters.startDate,
                            endDate: filters.endDate,
                            status: filters.status,
                            voucherStatus: filters.voucherStatus,
                            session: appliedFilters.session
                        });
                        setShowFilter(false);
                    }}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setStatus={setStatusFilter}
                    setVoucherStatus={setVoucherStatusFilter}
                />
            )}

            {/* Table Container */}
            {processedData.length > 0 && (
                <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
                        <h3 className="font-semibold text-gray-700 whitespace-nowrap">Report Data</h3>
                        
                        <div className="flex items-center gap-2 w-full justify-end">
                            {/* Template Selector */}
                            {excelTemplates && excelTemplates.length > 0 && (
                                <Dropdown
                                    value={selectedTemplate?.viewName || ''}
                                    onChange={(val) => {
                                        const temp = excelTemplates.find(t => t.viewName === val);
                                        setSelectedTemplate(temp || null);
                                    }}
                                    options={[
                                        { label: 'DEFAULT VIEW', value: '' },
                                        ...excelTemplates.map(t => ({ label: t.viewName.toUpperCase(), value: t.viewName }))
                                    ]}
                                    className="w-48 h-8 text-xs"
                                    placeholder="Select Template"
                                />
                            )}
                            
                            {/* Search Input */}
                            <div className="relative w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-9 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-full overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            isLoading={isLoading}
                            showSearch={false}
                        />
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && processedData.length === 0 && (
                <EmptyState />
            )}

            {/* Dialogs */}
            <ViewTransactionDialog
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                transaction={selectedTransaction}
            />
            <EditTransactionDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                transaction={selectedTransaction}
                paymentModes={feeMaster?.paymentMode || []}
                bankAccounts={(feeMaster as any)?.bankAccount || []}
                onSuccess={() => {
                    showToast('success', 'Transaction updated successfully');
                    refetch();
                }}
            />
            <CancelTransactionDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                transaction={selectedTransaction}
                entityId={entityId}
                session={session}
                onSuccess={() => {
                    showToast('success', 'Transaction cancelled successfully');
                    refetch();
                }}
            />
        </div>
    );
};

export default AdmissionTransactionPage;
