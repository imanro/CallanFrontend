import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {CallanAuthService} from './auth.service';
import {AppConfig} from '../../app.config';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class CallanAuthApiService extends CallanAuthService {

    constructor(
        protected appConfig: AppConfig,
        private http: HttpClient
    ) {
        super(appConfig);
    }

    fetchAuthToken(email: string, password: string): Observable<{id: number, token: string}> {

        const url = this.getApiUrl('/Customers/login');

        const ONE_DAY = 60 * 60 * 24;

        const data = {email: email, password: password, ttl: ONE_DAY}
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        };

        return this.http.post<{id: number, token: string}>(url, data, options)
            .pipe(
                map<any, {id: number, token: string}>(response => {
                    if (response && response.id && response.userId) {
                        return {id: Number(response.userId), token: response.id};
                    } else {
                        return null;
                    }
                }),
                catchError(this.handleHttpError<{id: number, token: string}>())
            );
    }

    removeAuthToken(token: string): Observable<boolean> {
        const url = this.getApiUrl('/Customers/logout');
        const data = {token: token};
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        };

        return this.http.post<boolean>(url, data, options)
            .pipe(
                map<any, boolean>(() => {
                    return true;
                }),
                catchError(this.handleHttpError<boolean>())
            );
    }
}
