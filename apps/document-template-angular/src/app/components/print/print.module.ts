import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PrintAdmissionFormComponent } from './printAdmissionForm/printAdmissionForm.component';

const routes: Routes = [
    { path: 'printAdmissionForm', component: PrintAdmissionFormComponent },
    { path: '', redirectTo: 'printAdmissionForm', pathMatch: 'full' }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    declarations: [PrintAdmissionFormComponent]
})
export class PrintModule { }
