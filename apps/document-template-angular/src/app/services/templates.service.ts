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
    `,
    admissionTransactionTemp2 : `
    <div class="card container-fluid p4Rem">
    <div *ngIf="!hasError" class="borderSolid">
        <div  style="font-size: large; font-weight: 400;" class="row">  
          <div class="col-3">
            <img class="hW100px" [src]="displayData.logo" alt="">
          </div>
          <div class="col-6 textCenter ">
            <h3><strong> {{displayData.entityDisplayName}}</strong></h3>
            <p><strong>{{displayData.entityAddress}}, {{displayData.entityCity}}, {{displayData.entityState}}, {{displayData.entityPin}}</strong> </p>
            <p><strong>{{displayData.entityReceptionNumber}}, {{displayData.entityContactEmail}} </strong></p>
          </div>
          <div class="col-3 textEnd">
            <!-- <h4 class="">Parent Copy</h4>
            <h3 class="pt30">Fee Receipt</h3> -->
          </div>
        </div>
        <div  style="font-size: large; font-weight: 400;" class="row">
            <div class="col-4 ">
                Receipt No: {{displayData.receiptId}}
            </div>
            <div class="col-4 textCenter">
                <strong>Registration Slip</strong>
            </div>
            <div class="col-4 textEnd">
                Date: {{displayData.date | date : 'dd/MM/yyyy'}}
            </div>
        </div>
        <div class="row"></div>
        <div  style="font-size: large; font-weight: 400;" class="row m0 ">
            <div class="col-12 textCenter borderBottom" >
            </div>
            <div class="col-7 ">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6 p0">
                          <strong>  Name  </strong>
                        </div>
                        <div class="col-6 p0">
                          <span> : {{displayData.studentName}} </span>
                        </div> 
                      </div>
                      <div class="row">
                        <div class="col-6 p0">
                          <strong> Father's Name  </strong>
                        </div>
                        <div class="col-6 p0">
                          <span> : {{displayData.studentFatherName}} </span>
                        </div> 
                      </div>
                    <div class="row">
                      <div class="col-6 p0">
                        <strong>D.O.B  </strong>
                      </div>
                      <div class="col-6 p0">
                        <span> : {{displayData.dob | date: 'dd/MM/yyyy'}} </span>
                      </div> 
                    </div>
                    <div class="row">
                        <div class="col-6 p0">
                          <strong>Phone </strong>
                        </div>
                        <div class="col-6 p0">
                          <span> : {{displayData.phone}} </span>
                        </div> 
                      </div>
                    
                </div>
          </div>
          <div class="col-5 ">
              <div class="card-body ">
                  <div class="row">
                    <div class="col-5 p0">
                      <strong>{{displayData.displayNamesCourse}}</strong>
                    </div> 
                    <div class="col-7 p0">
                      :  {{displayData.studentCourse}} / {{displayData.studentStream}}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-5 p0">
                      <strong>   Mother's Name  </strong>
                    </div> 
                    <div class="col-7 p0">
                      :  {{displayData.motherName}}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-5 p0">
                      <strong>  Form No  </strong>
                    </div> 
                    <div class="col-7 p0">
                      :  {{displayData.applicationNumber}}
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-5 p0">
                      <strong> Address  </strong>
                    </div> 
                    <div class="col-7 p0">
                      :  {{displayData.address}}
                    </div>
                  </div>
              </div>
          </div>
        </div>
       

        <div class="row m0" style="font-size: large; font-weight: 400;">
          <!-- <div *ngIf="!hasError" class=""> -->
            <table class="table fontFamily mt3p">
            <thead class="borderS1P mt3p">
                <th  class=" fwBoldvw" >
                   S.No
                </th>
                <th  class=" fwBoldvw">
                  Admission Heads
                 </th>
                
                <th  class=" fwBoldvw">
                  Paid Amount
                 </th>
            </thead>
            <tbody>
                <tr *ngFor="let row of displayData.dataSource.data; let i = index" >
                  <td>
                    {{i+1}}
                  </td>
                  <td>
                      {{row.admissionHead}}
                  </td>
                  
                  <td>
                      {{row.paidAmount | number : '1.2-2'}}
                  </td>
                </tr>
            </tbody>
          </table>
        </div> 
          <div class="row">
            <div class="col-12">
              <hr>
            </div>
          <!-- </div> -->
          <div class="col-12">
            <div class="row">
              <div class="col-7 ">
                Payment Mode
              </div>
              <div class="col-1 ">
                :
              </div>
              <div class="col-4 textEnd ">
                {{displayData.paymentDetailsPaymentMode}}
              </div>
            </div>
            <div class="row">
              <div class="col-7 ">
                Instrument Date
              </div>
              <div class="col-1 ">
                :
              </div>
              <div class="col-4 textEnd ">
                {{displayData.paymentDetailsDate | date: 'dd/MM/yyyy'}}
              </div>
            </div>
            <div class="row">
              <div class="col-7 ">
                Instrument Number
              </div>
              <div class="col-1 ">
                :
              </div>
              <div class="col-4 textEnd ">
                {{displayData.paymentDetailsRefId}}
              </div>
            </div>
            <div class="row">
              <div class="col-7 ">
                Total Invoice
              </div>
              <div class="col-1 ">
                :
              </div>
              <div class="col-4 textEnd ">
                {{displayData.totalPaybleAmount | number : '1.2-2' }}
              </div>
            </div>
            <div class="row">
              <div class="col-7 ">
                Net Paid Amount
              </div>
              <div class="col-1 ">
                :
              </div>
              <div class="col-4 textEnd">
                {{displayData.totalPaidAmount | number : '1.2-2' }}
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <hr>
          </div>
        </div>
          <div class="kt-space-20"></div>
        <div style="font-size: large; font-weight: 400;" class="row justifyFlexEnd m0">
          <div class="col-12">
            <strong>Remarks :</strong>
            {{displayData.remark}}
          </div>
          <div class="col-8">
            <strong> Amount in Words: </strong>
              Rs {{displayData.totalPaidAmountWords.toUpperCase()}} ONLY
          </div>
          <div class="col-4 p0"> 
            <label>Fees Clerk/Accountant</label>
          </div>
        </div>
  
        <div class="kt-space-20"></div>
        <div class="row">
            <div class="col-12 textEnd">
                Office Incharge
            </div>
        </div>
    </div>
  </div>
    `
    };
}
