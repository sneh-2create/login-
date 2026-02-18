import { useState, useMemo, useEffect } from 'react';
import { DataTable, useToast, EmptyState, PageHeader, PageToolbar, SelectSingle, DropdownMenu } from '@od-erp/ui';
import type { ActionButton } from '@od-erp/ui';
import { useAdmissionTransactions, useDeleteAdmissionTransaction, useExcelTemplates, useRetryAdmissionVoucher, useFeeMaster, useDefaultExcelTemplates, useSessions } from '@od-erp/query';
import { AdmissionTransactionPayload } from '@od-erp/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Download, Printer, Trash2, Eye, SlidersHorizontal, Edit, XCircle, RotateCcw, RefreshCw, Upload, MoreVertical } from 'lucide-react';
import { useAppSelector } from '@od-erp/store';
import { FilterCard } from './components/FilterCard';
import { EditTransactionDialog } from './components/EditTransactionDialog';
import { CancelTransactionDialog } from './components/CancelTransactionDialog';
import { processTransactionData, extractFeeHeadNames, ProcessedTransaction } from './utils/dataProcessor';
import * as XLSX from 'xlsx';
import { DEFAULT_ADMISSION_TRANSACTION_REPORT_HEADS } from '@od-erp/constants';

const AdmissionTransactionPage = () => {
    const entityId = useAppSelector((state) => state.auth.entityDetails?.id) || '';
    const entityDetails = useAppSelector((state) => state.auth.entityDetails);
    const entityType = useAppSelector((state) => state.session.entityType || '');
    const entityPreferences = useAppSelector((state) => state.config.entityPreferences) || null;
    const permissions = useAppSelector((state) => state.auth.permissions) || [];
    const autoVoucher = (entityPreferences as any)?.autoVoucher || false;
    const { showToast } = useToast();

    // State
    const session = useAppSelector((state) => state.session.academicSession) || '';
    const [pageNumber] = useState(1);
    const [pageSize] = useState(10);
    
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
    
    const [selectedTemplate, setSelectedTemplate] = useState<any>({ tableHeads: DEFAULT_ADMISSION_TRANSACTION_REPORT_HEADS });
    const [showFilter, setShowFilter] = useState(false);

    // Dialog States
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
        pageNumber,
        pageSize
    }), [entityId, appliedFilters, session, pageNumber, pageSize]);

    useEffect(() => {
        if (excelTemplates && excelTemplates.length > 0) {
            setSelectedTemplate(excelTemplates[0]);
        } else if (excelTemplates && excelTemplates.length === 0 && defaultTemplate) {
            setSelectedTemplate(defaultTemplate);
        }
    }, [excelTemplates, defaultTemplate]);

    const { data: transactions, isLoading, refetch } = useAdmissionTransactions(payload);

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
        const heads = selectedTemplate?.tableHeads || DEFAULT_ADMISSION_TRANSACTION_REPORT_HEADS;

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

                     const items = [
                         ...(permissions.includes('viewAdmissionTransaction') ? [{
                             key: 'view',
                             label: (
                                 <span className="flex items-center gap-2">
                                     <Eye size={14} className="text-primary" /> View Transaction
                                 </span>
                             ),
                             onClick: () => handleView(row)
                         }] : []),
                         ...(permissions.includes('editAdmissionTransaction') ? [{
                             key: 'edit',
                             label: (
                                 <span className="flex items-center gap-2">
                                     <Edit size={14} className="text-primary" /> Edit Transaction
                                 </span>
                             ),
                             onClick: () => handleEdit(row)
                         }] : []),
                         ...(permissions.includes('cancelAdmissionReceipt') ? [{
                             key: 'cancel',
                             label: (
                                 <span className="flex items-center gap-2">
                                     <XCircle size={14} className="text-orange-500" /> Cancel Transaction
                                 </span>
                             ),
                             onClick: () => handleCancel(row)
                         }] : []),
                         ...(autoVoucher && !row.voucherStatus && permissions.includes('reCreateAccountingVoucher') ? [{
                             key: 'retry',
                             label: (
                                 <span className="flex items-center gap-2">
                                     <RotateCcw size={14} className="text-primary" /> Retry Accounting Voucher
                                 </span>
                             ),
                             onClick: () => handleRetryVoucher(row._id)
                         }] : []),
                         ...((entityPreferences as any)?.pushTransactionToODPay ? [{
                             key: 'odpay',
                             label: (
                                 <span className="flex items-center gap-2">
                                     <Upload size={14} className="text-primary" /> Push to OD Pay
                                 </span>
                             ),
                             onClick: () => handlePushToODPay(row)
                         }] : []),
                         ...(permissions.includes('deleteAdmissionTransaction') ? [{
                             key: 'delete',
                             label: (
                                 <span className="flex items-center gap-2 text-red-500">
                                     <Trash2 size={14} /> Delete Receipt
                                 </span>
                             ),
                             onClick: () => handleDelete(row._id)
                         }] : [])
                     ];

                     if (items.length === 0) return null;

                     return (
                         <DropdownMenu
                             trigger={
                                 <button className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                                     <MoreVertical size={16} />
                                 </button>
                             }
                             items={items}
                             placement="bottom-end"
                             usePortal
                         />
                     );
                }
            }
        ];
    }, [selectedTemplate, pageNumber, pageSize, autoVoucher, includeFeeHeads, feeHeadNames]);

    // Handlers
    const handleView = (row: any) => {
        const angularAppUrl = import.meta.env.VITE_ANGULAR_TEMPLATES_URL || 'http://localhost:4200';

        // Open Angular document-template app at the printAdmissionTransaction route
        const printWindow = window.open(
            `${angularAppUrl}/print/open/printAdmissionTransaction`,
            '_blank'
        );

        if (printWindow) {
            const sendData = () => {
                printWindow.postMessage(
                    {
                        type: 'PRINT_ADMISSION_TRANSACTION',
                        data: {
                            transactionId: row._id,
                            entityId,
                            session,
                            entity: {
                                _id: entityId,
                                displayName: (entityDetails as any)?.displayName,
                                logo: (entityDetails as any)?.logo,
                                location: (entityDetails as any)?.location,
                                receptionNumber: (entityDetails as any)?.receptionNumber,
                                contactEmail: (entityDetails as any)?.contactEmail,
                            },
                            entityPreferences,
                            entityType,
                            course: row.applicationDetailsCourse || '',
                            // Pass full row so Angular can skip the API call
                            transactionData: row
                        }
                    },
                    angularAppUrl
                );
            };

            // Wait for Angular app to boot before sending data
            setTimeout(sendData, 1000);
        } else {
            alert('Popup was blocked. Please allow popups for this site and try again.');
        }
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

    // Action Buttons (same pattern as DailyCollectionReport)
    const actionButtons: ActionButton[] = [
        {
            icon: SlidersHorizontal,
            onClick: () => setShowFilter(!showFilter),
            title: 'Filter',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            variant: 'outline'
        },
        {
            icon: RefreshCw,
            onClick: handleRefresh,
            title: 'Refresh',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: true,
            iconClass: isLoading ? 'animate-spin' : '',
            variant: 'outline'
        },
        {
            icon: Download,
            onClick: handleExportExcel,
            title: 'Export to Excel',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: processedData.length > 0,
            variant: 'outline'
        },
        {
            icon: Printer,
            onClick: handlePrint,
            title: 'Print',
            className: 'text-primary hover:bg-primary/10 hover:text-primary',
            isVisible: processedData.length > 0,
            variant: 'outline'
        }
    ];

    // Toolbar extra content: session selector
    const toolbarExtra = sessions && sessions.length > 0 ? (
        <SelectSingle
            value={appliedFilters.session || session}
            onChange={(val) => setAppliedFilters(prev => ({ ...prev, session: val as string }))}
            options={sessions.map((s: any) => ({ value: s.name, label: s.name }))}
            containerClassName="w-48"
            placeholder="Select Session"
        />
    ) : undefined;

    return (
        <div className="w-full max-w-full font-sans pb-8">
            <PageHeader
                title="Admission Transaction"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Admission', href: '/admission' },
                    { label: 'Transaction' }
                ]}
                actionButtons={actionButtons}
            />

            <PageToolbar
                tabs={excelTemplates && excelTemplates.length > 0 ? excelTemplates.map(t => ({ label: t.viewName.toUpperCase(), value: t.viewName })) : []}
                activeTab={selectedTemplate?.viewName || ''}
                onTabChange={(val) => {
                    const temp = excelTemplates?.find(t => t.viewName === val);
                    setSelectedTemplate(temp || null);
                }}
                actions={actionButtons}
                extraContent={toolbarExtra}
            />

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

            {/* Table */}
            {processedData.length > 0 && (
                <div className="w-full max-w-full overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={processedData}
                        isLoading={isLoading}
                        showSearch={true}
                    />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && processedData.length === 0 && (
                <EmptyState message="No Records Found" />
            )}

            {/* Dialogs */}
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
