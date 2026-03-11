import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AdmissionApiService {
    constructor(private _api: ApiService) { }

    viewAdmissionStudentData(studentId: string): Observable<any> {
        return this._api.get(`/admission/studentData/${studentId}`);
    }

    viewAdmissionTransactionList(entityId: string, session: string, studentId: string): Observable<any> {
        return this._api.get(`/admission/transactions?entity=${entityId}&session=${session}&student=${studentId}`);
    }

    viewAdmissionTransaction(transactionId: string): Observable<any> {
        return this._api.get(`/admission/transaction/${transactionId}`);
    }
}
