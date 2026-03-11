import { Component, OnInit, ViewChild, ViewContainerRef, Compiler, NgModule, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionApiService } from '../../../services/admission.service';
import { PdfTemplateService } from '../../../services/pdfTemplate.service';
import { TemplatesService } from '../../../services/templates.service';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-printAdmissionTransaction',
    templateUrl: './printAdmissionTransaction.component.html',
    styleUrls: ['./printAdmissionTransaction.component.scss']
})
export class PrintAdmissionTransactionComponent implements OnInit {
    entityPreferences: any;
    entity: any;
    session: string;
    entityId: string;
    entityType: string;
    course: string;
    hasRendered: boolean = false;
    displayNames: any = {};
    isLoading: boolean = false;

    templateHtml: string = null;
    templatePrintReceiptCount: number = 1;

    @ViewChild('container', { read: ViewContainerRef, static: true })
    container: ViewContainerRef;

    constructor(
        private _route: ActivatedRoute,
        private _admissionApi: AdmissionApiService,
        private _pdfTemplateService: PdfTemplateService,
        private _compiler: Compiler,
        private _ref: ChangeDetectorRef,
        private _templatesService: TemplatesService
    ) { }

    ngOnInit() {
        window.addEventListener('message', (event) => {
            // Security: Verify origin
            if (!environment.allowedOrigins.includes(event.origin)) {
                console.warn('Unauthorized origin:', event.origin);
                return;
            }

            if (!event.data) return;

            if (event.data.type === 'PRINT_ADMISSION_TRANSACTION') {
                if (this.hasRendered) {
                    console.log('Already rendered, ignoring duplicate postMessage');
                    return;
                }
                this.hasRendered = true;
                this.isLoading = true;
                this._ref.detectChanges();

                const payload = event.data.data;
                this.entityId = payload.entityId;
                this.session = payload.session;
                this.entity = payload.entity || {};
                this.entityPreferences = payload.entityPreferences || {};
                this.entityType = payload.entityType || 'school';
                this.course = payload.course || '';

                this.resolveDisplayNames();

                if (payload.transactionData && payload.transactionData._id) {
                    // Full transaction row passed — use it directly
                    console.log('Transaction data provided via postMessage, loading template only');
                    this.loadTemplateAndRender(payload.transactionData);
                } else if (payload.transactionId) {
                    // Only ID passed — fetch from API
                    console.log('No transactionData, loading from API by ID:', payload.transactionId);
                    this.loadFromApi(payload.transactionId);
                }
            }
        });

        this._ref.detectChanges();
    }

    resolveDisplayNames() {
        if (this.entityPreferences && this.entityPreferences.displayNames) {
            const regNoItem = this.entityPreferences.displayNames.find(item => item.value === 'regNo');
            const courseItem = this.entityPreferences.displayNames.find(item => item.value === 'course');
            this.displayNames = {
                regNo: regNoItem ? regNoItem.name : 'Registration No',
                course: courseItem ? courseItem.name : 'Class',
                batch: this.entityPreferences.showBatch
            };
        }
    }

    loadFromApi(transactionId: string) {
        this._admissionApi.viewAdmissionTransaction(transactionId)
            .pipe(catchError(() => of(null)))
            .subscribe(transactionData => {
                if (!transactionData) {
                    console.error('Failed to load transaction from API');
                    this.isLoading = false;
                    this._ref.detectChanges();
                    return;
                }
                this.loadTemplateAndRender(transactionData);
            });
    }

    loadTemplateAndRender(transactionData: any) {
        const templateType = 'admissionTransactionReceipt';
        const course = transactionData.applicationDetailsCourse || (transactionData.applicationDetails && transactionData.applicationDetails.course) || this.course || 'default';

        this._pdfTemplateService.viewDefaultTemplate(this.entityId, templateType, course)
            .pipe(catchError(() => of([])))
            .subscribe((templateList: any[]) => {
                if (templateList && templateList.length > 0) {
                    this.templateHtml = templateList[0].htmlData;
                    this.templatePrintReceiptCount = templateList[0].printReceiptCount || 1;
                    console.log('Using entity template from API');
                    setTimeout(() => this.renderReceipt(transactionData), 50);
                } else {
                    // Fallback: system default template
                    this._pdfTemplateService.viewPDFDefaultTemplates(this.entityType, templateType)
                        .pipe(catchError(() => of(null)))
                        .subscribe(defaultTemplate => {
                            if (defaultTemplate && (defaultTemplate as any).htmlData) {
                                this.templateHtml = (defaultTemplate as any).htmlData;
                                this.templatePrintReceiptCount = (defaultTemplate as any).printReceiptCount || 1;
                                console.log('Using system default template');
                            } else {
                                // Final fallback: hardcoded template from TemplatesService
                                this.templateHtml = this._templatesService.receiptTemplates['admissionTransactionTemp2'];
                                this.templatePrintReceiptCount = 1;
                                console.log('Using hardcoded fallback template');
                            }
                            setTimeout(() => this.renderReceipt(transactionData), 50);
                        });
                }
            });
    }

    renderReceipt(transactionData: any) {
        if (!this.templateHtml) {
            console.error('No template available');
            this.isLoading = false;
            this._ref.detectChanges();
            return;
        }

        const displayData = this.buildDisplayData(transactionData);
        let template = this.templateHtml;

        // Handle printReceiptCount (1, 2, or 4 copies)
        if (this.templatePrintReceiptCount === 2) {
            template = `
                <div class="row">
                    <div class="col-12">${template}</div>
                    <div class="col-12">${template}</div>
                </div>`;
        } else if (this.templatePrintReceiptCount === 4) {
            template = `
                <div class="row">
                    <div class="col-6">${template}</div>
                    <div class="col-6">${template}</div>
                    <div class="col-6">${template}</div>
                    <div class="col-6">${template}</div>
                </div>`;
        }

        this.container.clear();
        this.createDynamicComponent(template, displayData);

        this.isLoading = false;
        this._ref.detectChanges();

        // Auto-print after render
        setTimeout(() => this.printReceipt(), 1000);
    }

    buildDisplayData(row: any) {
        // Support both flat (processed row from React table) and nested (raw API response) formats
        const student = row.studentData || {};
        const appDetails = row.applicationDetails || {};
        const paymentDetails = row.paymentDetails || {};

        // Resolve nested fields — React table flattens them
        const studentName = student.name || row.studentName || '';
        const studentCourse = appDetails.course || row.applicationDetailsCourse || '';
        const studentStream = appDetails.stream || row.applicationDetailsStream || '';
        const studentBatch = appDetails.batch || row.applicationDetailsBatch || '';
        const studentSection = appDetails.section || row.applicationDetailsSection || '';
        const studentPhone = student.phone || row.studentPhone || '';
        const studentFatherName = student.fatherName || '';
        const studentDob = student.dob || '';
        const studentAddress = student.address || '';
        const studentMotherName = student.motherName || '';
        const studentSourceId = student.sourceId || '';

        const paymentMode = paymentDetails.paymentMode || row.paymentDetailsPaymentMode || '';
        const cheque = paymentMode === 'Cheque';
        const demandDraft = paymentMode === 'Demand Draft';
        const cash = ['Cash', 'Bank Transfer', 'Card/POS', 'Online'].includes(paymentMode);

        // Build receipt items for the table (group by admissionHead)
        const admissionHeads: string[] = [];
        const receiptData: any[] = [];
        const receiptItems = row.receipt || [];
        for (const item of receiptItems) {
            if (!admissionHeads.includes(item.admissionHead)) {
                admissionHeads.push(item.admissionHead);
                receiptData.push({
                    admissionHead: item.admissionHead,
                    paidAmount: item.paidAmount || 0,
                    payableAmount: item.paidAmount || 0
                });
            } else {
                const existing = receiptData.find(r => r.admissionHead === item.admissionHead);
                if (existing) {
                    existing.paidAmount += item.paidAmount || 0;
                    existing.payableAmount += item.paidAmount || 0;
                }
            }
        }

        const totalPaidAmount = row.totalPaidAmount || 0;
        const totalPaybleAmount = row.totalPaybleAmount || 0;
        const balance = totalPaybleAmount - totalPaidAmount;

        return {
            // Entity
            entityDisplayName: this.entity.displayName || '',
            entityAddress: (this.entity.location && this.entity.location.address) || '',
            entityCity: (this.entity.location && this.entity.location.city) || '',
            entityState: (this.entity.location && this.entity.location.state) || '',
            entityPin: (this.entity.location && this.entity.location.pin) || '',
            entityReceptionNumber: this.entity.receptionNumber || '',
            entityContactEmail: this.entity.contactEmail || '',
            logo: this.entity.logo || '',

            // Display names
            displayNamesRegNo: this.displayNames.regNo || 'Registration No',
            displayNamesCourse: this.displayNames.course || 'Class',

            // Student
            studentName,
            studentCourse,
            studentStream,
            studentBatch,
            studentSection,
            studentPhone,
            studentFatherName,
            dob: studentDob,
            phone: studentPhone,
            address: studentAddress,
            motherName: studentMotherName,
            sourceId: studentSourceId,

            // Entity preferences
            entityPreferencesShowBatch: this.entityPreferences.showBatch || false,

            // Transaction
            applicationNumber: row.applicationNumber || '',
            receiptId: row.receiptId || '',
            userMobile: row.userMobile || '',
            userName: row.userName || '',
            date: row.date || '',
            session: this.session,
            receiptSession: row.session || this.session,
            status: row.status || 'confirmed',
            remark: row.remark || '',

            // Payment
            paymentDetailsPaymentMode: paymentMode,
            cheque,
            cash,
            demandDraft,
            paymentDetailsRefId: paymentDetails.refId || row.paymentDetailsRefId || '',
            paymentDetailsBankName: paymentDetails.bankName || row.paymentDetailsBankName || '',
            paymentDetailsDate: paymentDetails.date || row.paymentDetailsDate || '',

            // Amounts
            totalPaidAmount,
            totalPaybleAmount,
            balance,
            totalPaidAmountWords: '',

            // Table data for template (Angular-style MatTableDataSource-like object)
            dataSource: { data: receiptData },
            displayedColumns: ['position', 'admissionHead', 'paidAmount'],
            hasError: false,

            // Layout variables (used by some templates)
            myFontSize: 12,
            myVariable: 60,
        };
    }

    createDynamicComponent(template: string, displayData: any) {
        const metadata = {
            selector: `runtime-transaction-component-${Math.random().toString(36).substr(2, 9)}`,
            template: template
        };

        const componentClass = class RuntimeComponent {
            displayData = displayData;
        };

        const decoratedCmp = Component(metadata)(componentClass);

        @NgModule({
            imports: [CommonModule, FormsModule, ReactiveFormsModule],
            declarations: [decoratedCmp],
            entryComponents: [decoratedCmp]
        })
        class RuntimeComponentModule { }

        const module = this._compiler.compileModuleAndAllComponentsSync(RuntimeComponentModule);
        const factory = module.componentFactories.find(f => f.componentType === decoratedCmp);
        this.container.createComponent(factory);
    }

    printReceipt() {
        const title = document.title;
        document.title = 'Admission Transaction Receipt';
        window.print();
        document.title = title;
    }
}
