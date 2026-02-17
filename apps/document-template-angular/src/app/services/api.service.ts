import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    apiUrl = environment.apiUrl;
    browserDomain = environment.browserDomain;

    constructor(private _http: HttpClient) { }

    get(endpoint: string) {
        return this._http.get(`${this.apiUrl}${endpoint}`);
    }

    post(endpoint: string, data: any) {
        return this._http.post(`${this.apiUrl}${endpoint}`, data);
    }
}
