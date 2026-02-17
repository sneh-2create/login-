import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TemplatesService {
    constructor() { }

    receiptTemplates: any = {
        studentAdmissionForm2: `
    <div style="font-weight: 500; font-size: large;" class="container card">
      <div class="row mt10">
        <br>
        <br>
        <div class="col-3">
          <img style="height: 100%; width: 100%;" class="img-rounded" [src]="displayData.logo" alt="">
        </div>
        <div class="col-9 textCenter">
          <strong>
            <h1>{{displayData.entityDisplayName}}</h1>
          </strong>
          <h4>{{displayData.entityAddress}}, {{displayData.entityCity}}, {{displayData.entityState}}, {{displayData.entityPin}}</h4>
          <h4>{{displayData.entityReceptionNumber}}, {{displayData.entityContactEmail}}</h4>
        </div>
      </div>
      <article class="mt20p">
        <div class="row mt10">
          <div class="col-7">
            <div class="row mt10">
              <div class="col-5 offset-1">
                <strong>Course</strong>
              </div>
              <div class="col-1">:</div>
              <div class="col-5">{{displayData.course}}</div>
            </div>
            <div class="row mt10" *ngIf="displayData.applicationNumber">
              <div class="col-5 offset-1">
                <strong>Application No.</strong>
              </div>
              <div class="col-1">:</div>
              <div class="col-5">{{displayData.applicationNumber}}</div>
            </div>
            <div class="row mt10" *ngIf="displayData.date">
              <div class="col-5 offset-1">
                <strong>Date of Application</strong>
              </div>
              <div class="col-1">:</div>
              <div class="col-5">{{displayData.date | date : 'dd/MM/yyyy'}}</div>
            </div>
            <div class="row mt10" *ngIf="displayData.batch">
              <div class="col-5 offset-1">
                <strong>Batch</strong>
              </div>
              <div class="col-1">:</div>
              <div class="col-5">{{displayData.batch}}</div>
            </div>
            <div class="row mt10" *ngIf="displayData.section">
              <div class="col-5 offset-1">
                <strong>Section</strong>
              </div>
              <div class="col-1">:</div>
              <div class="col-5">{{displayData.section}}</div>
            </div>
          </div>
          <div class="col-5 textCenter">
            <img style="height: 150px;" class="img" [src]="displayData.photo" *ngIf="displayData.photo" />
          </div>
        </div>
      </article>
      <article class="mt20p">
        <div class="row mt10">
          <div class="col-10 offset-1">
            <h4>Applicant Details:</h4>
          </div>
        </div>
        <div class="row mt10" *ngIf="displayData.name">
          <div class="col-4 offset-2">
            <strong>Name of the Applicant</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.name}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.dob">
          <div class="col-4 offset-2">
            <strong>Date of Birth</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.dob | date : 'dd/MM/yyyy'}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.gender">
          <div class="col-4 offset-2">
            <strong>Gender</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.gender}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.doa">
          <div class="col-4 offset-2">
            <strong>Date of Admission</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.doa | date : 'dd/MM/yyyy'}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.phone">
          <div class="col-4 offset-2">
            <strong>Contact No.</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.phone}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.email">
          <div class="col-4 offset-2">
            <strong>Email</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.email}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.fatherName">
          <div class="col-4 offset-2">
            <strong>Father's Name</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.fatherName}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.motherName">
          <div class="col-4 offset-2">
            <strong>Mother's Name</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.motherName}}</div>
        </div>
        <div class="row mt10" *ngIf="displayData.address">
          <div class="col-4 offset-2">
            <strong>Address</strong>
          </div>
          <div class="col-1">:</div>
          <div class="col-4">{{displayData.address}}</div>
        </div>
      </article>
      <div class="row mt10">
        <div class="col-12 textCenter">
          <p style="margin-top: 50px;">
            <strong>Signature of Parent/Guardian</strong>
          </p>
        </div>
      </div>
    </div>
    `
    };
}
