import { Component, OnInit, ViewChild, ViewContainerRef, Compiler, NgModule, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AdmissionApiService } from '../../../services/admission.service';
import { PdfTemplateService } from '../../../services/pdfTemplate.service';
import { TemplatesService } from '../../../services/templates.service';
import { environment } from '../../../../environments/environment';

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
    studentData: any = {};
    hasRendered: boolean = false;
    displayData: any;
    displayNames: any = {};
    templateList: any[] = [];
    templateData: any;
    studentId: any;
    admissionTransactionData: any = [];

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
        // Listen for postMessage from React app
        window.addEventListener('message', (event) => {
            // Security: Verify origin
            if (!environment.allowedOrigins.includes(event.origin)) {
                console.warn('Unauthorized origin:', event.origin);
                return;
            }

            // Check message type
            if (event.data && event.data.type === 'PRINT_ADMISSION_FORM') {
                console.log('Received print data via postMessage:', event.data.data);

                // Extract data
                this.studentId = event.data.data.studentId;
                this.entityId = event.data.data.entityId;
                this.session = event.data.data.session;
                this.entity = event.data.data.entity || {};
                this.entityPreferences = event.data.data.entityPreferences || {};
                this.entityType = event.data.data.entityType || 'school';

                // Extract student data if provided via postMessage
                if (event.data.data.studentData) {
                    this.studentData = event.data.data.studentData;
                    console.log('Student data received via postMessage:', this.studentData);
                }

                // Update display names
                if (this.entityPreferences && this.entityPreferences.displayNames) {
                    const regNoItem = this.entityPreferences.displayNames.find(item => item.value == 'regNo');
                    const courseItem = this.entityPreferences.displayNames.find(item => item.value == 'course');

                    this.displayNames = {
                        regNo: regNoItem ? regNoItem.name : 'Registration No',
                        course: courseItem ? courseItem.name : 'Class',
                        batch: this.entityPreferences.showBatch
                    };
                }

                // If student data was provided, skip API calls and go straight to template
                if (this.studentData && Object.keys(this.studentData).length > 0) {
                    // Prevent duplicate rendering
                    if (this.hasRendered) {
                        console.log('Template already rendered, ignoring duplicate postMessage');
                        return;
                    }
                    this.hasRendered = true;
                    console.log('Using student data from postMessage, skipping API calls');
                    this.prepareDisplayData();
                    this.loadTemplate();
                } else {
                    // Fallback: try to load data from APIs
                    console.log('No student data in postMessage, attempting to load from APIs');
                    this.loadData();
                }
            }
        });

        this._ref.detectChanges();
    }

    loadData() {
        // Load transactions first
        this._admissionApi.viewAdmissionTransactionList(this.entityId, this.session, this.studentId)
            .subscribe(
                res => {
                    this.admissionTransactionData = res;
                    this.loadStudentData();
                },
                err => {
                    console.error('Failed to load transactions:', err);
                    this.loadStudentData();
                }
            );
    }

    loadStudentData() {
        this._admissionApi.viewAdmissionStudentData(this.studentId)
            .subscribe(res => {
                this.studentData = res;
                this.prepareDisplayData();
                this.loadTemplate();
            }, err => {
                console.error('Failed to load student data:', err);
                // Still prepare display data with available info and load template
                this.prepareDisplayData();
                this.loadTemplate();
            });
    }

    prepareDisplayData() {
        // Merge student data with entity data for template
        this.displayData = {
            // Student data
            ...this.studentData,

            // Entity data
            logo: this.entity ? this.entity.logo : null,
            entityDisplayName: this.entity ? this.entity.displayName : '',
            entityAddress: (this.entity && this.entity.location) ? this.entity.location.address : null,
            entityCity: (this.entity && this.entity.location) ? this.entity.location.city : null,
            entityState: (this.entity && this.entity.location) ? this.entity.location.state : null,
            entityPin: (this.entity && this.entity.location) ? this.entity.location.pin : null,
            entityReceptionNumber: this.entity ? this.entity.receptionNumber : null,
            entityContactEmail: this.entity ? this.entity.contactEmail : null,
            entityWebsite: this.entity ? this.entity.website : null,

            // Transaction data
            admissionTransactionData: this.admissionTransactionData,
            transactionRequired: this.admissionTransactionData && this.admissionTransactionData.length > 0 ? 'Yes' : 'No',

            // Display names
            displayNames: this.displayNames
        };

        console.log('Display data prepared:', this.displayData);
    }

    loadTemplate() {
        const templateType = 'admissionFormTemplate';
        const course = (this.studentData && this.studentData.course) ? this.studentData.course : 'default';

        this._pdfTemplateService.viewDefaultTemplate(this.entityId, templateType, course)
            .subscribe(res => {
                this.templateList = res;
                if (this.templateList && this.templateList.length > 0) {
                    this.templateData = this.templateList[0];
                    this.renderTemplate();
                } else {
                    // Load system default template
                    this._pdfTemplateService.viewPDFDefaultTemplates(this.entityType, templateType)
                        .subscribe(defaultTemplate => {
                            this.templateData = defaultTemplate;
                            this.renderTemplate();
                        }, err => {
                            console.error('Failed to load default template:', err);
                        });
                }
            }, err => {
                console.error('Failed to load template:', err);
            });
    }

    renderTemplate() {
        let templateHtml: string;

        // Try to use template from API
        if (this.templateData && this.templateData.htmlData) {
            templateHtml = this.templateData.htmlData;
            console.log('Using template from API');
        } else {
            // Fallback to hardcoded template
            templateHtml = this._templatesService.receiptTemplates['studentAdmissionForm2'];
            console.log('Using fallback template from TemplatesService');
        }

        if (!templateHtml) {
            console.error('No template available to render');
            return;
        }

        this.createDynamicComponent(templateHtml);
    }

    createDynamicComponent(template: string) {
        const metadata = {
            selector: 'runtime-print-component',
            template: template
        };

        const displayData = this.displayData;

        // Create runtime component class
        const componentClass = class RuntimeComponent {
            displayData = displayData;
        };

        const decoratedCmp = Component(metadata)(componentClass);

        // Create runtime module
        @NgModule({
            imports: [
                CommonModule,
                FormsModule,
                ReactiveFormsModule
            ],
            declarations: [decoratedCmp],
            entryComponents: [decoratedCmp]
        })
        class RuntimeComponentModule { }

        // Compile and create component
        const module = this._compiler.compileModuleAndAllComponentsSync(RuntimeComponentModule);
        const factory = module.componentFactories.find(f => f.componentType === decoratedCmp);
        this.container.createComponent(factory);
        this._ref.detectChanges();

        // Auto-print disabled for debugging - uncomment to re-enable
        // setTimeout(() => {
        //     this.printReceipt();
        // }, 500);

        console.log('Template rendered. Auto-print is disabled for debugging.');
    }

    printReceipt() {
        const title = document.title;
        document.title = 'Admission Form';
        window.print();
        document.title = title;
        window.open('', '_self');
        window.close();
    }
}
