import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class PdfTemplateService {
    constructor(private _api: ApiService) { }

    viewDefaultTemplate(entityId: string, templateType: string, course: string): Observable<any> {
        let url = `/viewDefault/pdfTemplate?entity=${entityId}&report=${templateType}`;
        if (course) {
            url += `&course=${encodeURIComponent(course)}`;
        }
        return this._api.get(url);
    }

    viewPDFDefaultTemplates(entityType: string, templateType: string): Observable<any> {
        return this._api.get(`/viewDefault/defaultPDFTemplate?report=${templateType}&entityType=${entityType}`);
    }
}
