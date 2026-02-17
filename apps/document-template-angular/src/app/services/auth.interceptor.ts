import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get token from cookie only
        const token = this.getCookie('token');

        let authReq = req;

        if (token) {
            // Clone request and add Authorization header if token exists
            authReq = req.clone({
                setHeaders: {
                    Authorization: token
                }
            });
        }
        // If no token, proceed without auth header (React app handles authentication)

        // Handle response errors
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Unauthorized - redirect to login
                    console.warn('Unauthorized. Redirecting to login...');
                    window.location.href = environment.loginUrl;
                }
                return throwError(error);
            })
        );
    }

    // Helper to parse cookies
    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const lastPart = parts.pop();
            if (lastPart) {
                const result = lastPart.split(';').shift();
                return result || null;
            }
        }
        return null;
    }
}
