import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAdmissionTransaction } from '@od-erp/query';
import { useAppSelector } from '@od-erp/store';
import { pdfTemplateService } from '@od-erp/api-client';
import PrintLayout from '../../components/PrintLayout';
import { format } from 'date-fns';

/**
 * Replaces template variables in format {{path.to.value}} with actual data
 */
function replaceTemplateVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_match, path) => {
        const trimmedPath = path.trim();
        const value = trimmedPath.split('.').reduce((obj: any, key: string) => {
            return obj?.[key];
        }, data);
        return value !== undefined && value !== null ? String(value) : '';
    });
}

const PrintAdmissionTransactionReceipt = () => {
    const { id } = useParams<{ id: string }>();
    const entityDetails = useAppSelector((state) => state.auth.entityDetails);
    const entityType = useAppSelector((state) => state.session.entityType || '');
    const { data: transaction, isLoading: isLoadingTransaction, isError } = useAdmissionTransaction(id || '');
    
    const [template, setTemplate] = useState<any>(null);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

    // Fetch PDF template
    useEffect(() => {
        const fetchTemplate = async () => {
            if (!transaction || !entityDetails) return;
            
            try {
                setIsLoadingTemplate(true);
                const course = transaction.applicationDetails?.course;
                
                // Try course-specific template first
                const templatesResponse = await pdfTemplateService.viewDefaultTemplate(
                    (entityDetails as any).id,
                    'admissionTransactionReceipt',
                    course
                );
                const templates = (templatesResponse as any).data || templatesResponse;
                
                if (templates && templates.length > 0) {
                    setTemplate(templates[0]);
                } else {
                    // Fallback to entity type template
                    const defaultTemplateResponse = await pdfTemplateService.viewPDFDefaultTemplates(
                        entityType,
                        'admissionTransactionReceipt'
                    );
                    const defaultTemplate = (defaultTemplateResponse as any).data || defaultTemplateResponse;
                    setTemplate(defaultTemplate);
                }
            } catch (error) {
                console.error('Error fetching template:', error);
            } finally {
                setIsLoadingTemplate(false);
            }
        };
        
        if (transaction && entityDetails) {
            fetchTemplate();
        }
    }, [transaction, entityDetails, entityType]);

    // Prepare display data matching Angular structure
    const displayData = useMemo(() => {
        if (!transaction || !entityDetails) return null;

        const studentData = transaction.studentData || {};
        const applicationDetails = transaction.applicationDetails || {};
        const paymentDetails = transaction.paymentDetails || {};

        // Group receipt items by admission head for table display
        const receiptData: any[] = [];
        const admissionHeads: string[] = [];
        
        transaction.receipt?.forEach((item: any) => {
            if (!admissionHeads.includes(item.admissionHead)) {
                admissionHeads.push(item.admissionHead);
                receiptData.push({
                    admissionHead: item.admissionHead,
                    paidAmount: item.paidAmount,
                    payableAmount: item.paidAmount
                });
            } else {
                const existing = receiptData.find(r => r.admissionHead === item.admissionHead);
                if (existing) {
                    existing.paidAmount += item.paidAmount;
                    existing.payableAmount += item.paidAmount;
                }
            }
        });

        // Payment mode flags
        const paymentMode = paymentDetails.paymentMode || '';
        const cheque = paymentMode === 'Cheque';
        const demandDraft = paymentMode === 'Demand Draft';
        const cash = ['Cash', 'Bank Transfer', 'Card/POS', 'Online'].includes(paymentMode);

        return {
            // Entity details
            entityDisplayName: entityDetails.displayName,
            entityAddress: (entityDetails as any).location?.address || '',
            entityCity: (entityDetails as any).location?.city || '',
            entityState: (entityDetails as any).location?.state || '',
            entityPin: (entityDetails as any).location?.pin || '',
            entityReceptionNumber: (entityDetails as any).receptionNumber || '',
            entityContactEmail: (entityDetails as any).contactEmail || '',
            
            // Display names
            displayNamesRegNo: 'Registration No',
            displayNamesCourse: 'Class',
            
            // Student data
            studentCourse: applicationDetails.course || '',
            studentName: studentData.name || '',
            studentFatherName: studentData.fatherName || '',
            studentSection: applicationDetails.section || '',
            studentBatch: applicationDetails.batch || '',
            studentStream: applicationDetails.stream || '',
            studentPhone: studentData.phone || '',
            
            // Entity preferences
            entityPreferencesShowBatch: true,
            
            // Transaction details
            applicationNumber: transaction.applicationNumber || '',
            receiptId: transaction.receiptId || '',
            userMobile: transaction.userMobile || '',
            userName: transaction.userName || '',
            
            // Logo
            logo: entityDetails.logo || '',
            
            // Payment details
            paymentDetailsPaymentMode: paymentMode,
            cheque,
            cash,
            demandDraft,
            paymentDetailsRefId: paymentDetails.refId || '',
            paymentDetailsBankName: paymentDetails.bankName || '',
            paymentDetailsDate: paymentDetails.date ? format(new Date(paymentDetails.date), 'dd-MMM-yyyy') : '',
            
            // Dates
            date: transaction.date ? format(new Date(transaction.date), 'dd-MMM-yyyy') : '',
            dob: (studentData as any).dob ? format(new Date((studentData as any).dob), 'dd-MMM-yyyy') : '',
            
            // Other student info
            phone: studentData.phone || '',
            address: (studentData as any).address || '',
            motherName: (studentData as any).motherName || '',
            
            // Session
            session: transaction.session || '',
            receiptSession: transaction.session || '',
            
            // Font/styling (Angular uses these for dynamic sizing)
            myFontSize: 12,
            myVariable: 60,
            
            // Table data
            dataSource: { data: receiptData },
            displayedColumns: ['position', 'admissionHead', 'paidAmount'],
            hasError: false,
            
            // Amounts
            totalPaidAmount: transaction.totalPaidAmount || 0,
            totalPaybleAmount: transaction.totalPaybleAmount || 0,
            totalPaidAmountWords: '', // TODO: Implement number to words conversion
            
            // Remarks
            remark: transaction.remark || '',
            balance: (transaction.totalPaybleAmount || 0) - (transaction.totalPaidAmount || 0),
            
            // Other
            sourceId: (studentData as any).sourceId || '',
            status: transaction.status || 'confirmed'
        };
    }, [transaction, entityDetails]);

    // Process template HTML with data
    const processedHtml = useMemo(() => {
        if (!template || !displayData) return '';
        
        const htmlData = template.htmlData || '';
        const processedTemplate = replaceTemplateVariables(htmlData, displayData);
        
        // Handle printReceiptCount
        const printReceiptCount = template.printReceiptCount || 1;
        
        if (printReceiptCount === 2) {
            return `
                <div class="row">
                    <div class="col-12">${processedTemplate}</div>
                    <div class="col-12">${processedTemplate}</div>
                </div>
            `;
        } else if (printReceiptCount === 4) {
            return `
                <div class="row">
                    <div class="col-6">${processedTemplate}</div>
                    <div class="col-6">${processedTemplate}</div>
                    <div class="col-6">${processedTemplate}</div>
                    <div class="col-6">${processedTemplate}</div>
                </div>
            `;
        }
        
        return processedTemplate;
    }, [template, displayData]);

    // Auto-trigger print after template and data are ready
    useEffect(() => {
        if (template && displayData && !isLoadingTemplate && !isLoadingTransaction) {
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [template, displayData, isLoadingTemplate, isLoadingTransaction]);

    if (isLoadingTransaction || isLoadingTemplate) {
        return <div className="p-8 text-center text-sm">Loading receipt...</div>;
    }

    if (isError || !transaction) {
        return <div className="p-8 text-center text-sm text-red-600">Error loading receipt</div>;
    }

    if (!template || !displayData) {
        return <div className="p-8 text-center text-sm">Loading template...</div>;
    }

    return (
        <PrintLayout reportName="" noHeader={true}>
            <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
            
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { 
                        margin: 10mm;
                        size: A4;
                    }
                    body { 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </PrintLayout>
    );
};

export default PrintAdmissionTransactionReceipt;
