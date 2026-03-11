import { Component, OnInit, ViewChild, ViewContainerRef, Compiler, NgModule, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AdmissionApiService } from '../../../services/admission.service';
import { PdfTemplateService } from '../../../services/pdfTemplate.service';
import { TemplatesService } from '../../../services/templates.service';
import { environment } from '../../../../environments/environment';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-printAdmissionForm',
    templateUrl: './printAdmissionForm.component.html',
    styleUrls: ['./printAdmissionForm.component.scss']
})
export class PrintAdmissionFormComponent implements OnInit {
    entityPreferences: any;
    entity: any;
    session: string;
    entityId: string;
    entityType: string;
    hasRendered: boolean = false;
    displayNames: any = {};

    // Supports both single and multiple students
    studentsQueue: any[] = [];
    templateHtml: string = null;
    isLoading: boolean = false;

    @ViewChild('container', { read: ViewContainerRef, static: true })
    container: ViewContainerRef;

    constructor(
        private _route: ActivatedRoute,
        private _apiService: ApiService,
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

            // --- BULK: multiple students in one message ---
            if (event.data.type === 'PRINT_ADMISSION_FORM_BULK') {
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
                this.studentsQueue = payload.students || [];

                this.resolveDisplayNames();
                console.log(`Bulk print: ${this.studentsQueue.length} students`);
                this.loadTemplateAndRenderAll();
                return;
            }

            // --- SINGLE: one student ---
            if (event.data.type === 'PRINT_ADMISSION_FORM') {
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

                this.resolveDisplayNames();

                if (payload.studentData && Object.keys(payload.studentData).length > 0) {
                    this.studentsQueue = [payload.studentData];
                    console.log('Single student via postMessage, skipping API calls');
                    this.loadTemplateAndRenderAll();
                } else {
                    // Fallback: load from API
                    console.log('No studentData in postMessage, loading from API');
                    this.loadSingleFromApi(payload.studentId);
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

    loadSingleFromApi(studentId: string) {
        this._admissionApi.viewAdmissionTransactionList(this.entityId, this.session, studentId)
            .pipe(catchError(() => of([])))
            .subscribe(transactions => {
                this._admissionApi.viewAdmissionStudentData(studentId)
                    .pipe(catchError(() => of({})))
                    .subscribe(studentData => {
                        (studentData as any).admissionTransactionData = transactions;
                        this.studentsQueue = [studentData];
                        this.loadTemplateAndRenderAll();
                    });
            });
    }

    loadTemplateAndRenderAll() {
        if (this.studentsQueue.length === 0) {
            console.error('No students to render');
            return;
        }

        const templateType = 'admissionFormTemplate';
        const course = (this.studentsQueue[0] && this.studentsQueue[0].course) ? this.studentsQueue[0].course : 'default';

        this._pdfTemplateService.viewDefaultTemplate(this.entityId, templateType, course)
            .pipe(catchError(() => of([])))
            .subscribe((templateList: any[]) => {
                if (templateList && templateList.length > 0) {
                    this.templateHtml = templateList[0].htmlData;
                    console.log('Using template from API');
                    // Defer so loader paints before heavy compile work
                    setTimeout(() => this.renderAllStudents(), 50);
                } else {
                    // Try system default
                    this._pdfTemplateService.viewPDFDefaultTemplates(this.entityType, templateType)
                        .pipe(catchError(() => of(null)))
                        .subscribe(defaultTemplate => {
                            if (defaultTemplate && (defaultTemplate as any).htmlData) {
                                this.templateHtml = (defaultTemplate as any).htmlData;
                            } else {
                                this.templateHtml = this._templatesService.receiptTemplates['studentAdmissionForm2'];
                                console.log('Using fallback template from TemplatesService');
                            }
                            // Defer so loader paints before heavy compile work
                            setTimeout(() => this.renderAllStudents(), 50);
                        });
                    return;
                }
            });
    }

    renderAllStudents() {
        if (!this.templateHtml) {
            console.error('No template available');
            return;
        }

        this.container.clear();

        this.studentsQueue.forEach((studentData, index) => {
            const displayData = this.buildDisplayData(studentData);
            const isLast = index === this.studentsQueue.length - 1;

            // Wrap each student form in a page-break div
            const wrappedTemplate = `
                <div class="student-form-wrapper ${!isLast ? 'page-break' : ''}">
                    ${this.templateHtml}
                </div>
            `;

            this.createDynamicComponent(wrappedTemplate, displayData);
        });

        this.isLoading = false;
        this._ref.detectChanges();
        console.log(`Rendered ${this.studentsQueue.length} student form(s).`);
    }

    buildDisplayData(studentData: any) {
        return {
            ...studentData,
            logo: this.entity ? this.entity.logo : null,
            entityDisplayName: this.entity ? this.entity.displayName : '',
            entityAddress: (this.entity && this.entity.location) ? this.entity.location.address : null,
            entityCity: (this.entity && this.entity.location) ? this.entity.location.city : null,
            entityState: (this.entity && this.entity.location) ? this.entity.location.state : null,
            entityPin: (this.entity && this.entity.location) ? this.entity.location.pin : null,
            entityReceptionNumber: this.entity ? this.entity.receptionNumber : null,
            entityContactEmail: this.entity ? this.entity.contactEmail : null,
            entityWebsite: this.entity ? this.entity.website : null,
            admissionTransactionData: studentData.admissionTransactionData || [],
            transactionRequired: (studentData.admissionTransactionData && studentData.admissionTransactionData.length > 0) ? 'Yes' : 'No',
            displayNames: this.displayNames
        };
    }

    createDynamicComponent(template: string, displayData: any) {
        const metadata = {
            selector: `runtime-print-component-${Math.random().toString(36).substr(2, 9)}`,
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
        document.title = 'Admission Form';
        window.print();
        document.title = title;
    }
}
