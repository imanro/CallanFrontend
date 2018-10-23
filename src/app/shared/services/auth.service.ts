import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CallanBaseService} from './base.service';
import {CallanError} from '../models/error.model';

@Injectable()
export abstract class CallanAuthService extends CallanBaseService {

    isAuthenticated() {
        const authData = this.getAuthDataFromStorage();
        if (authData && authData.id && authData.authToken) {
            return true;
        } else {
            return false;
        }
    }

    public getAuthToken(): string {

        const authData = this.getAuthDataFromStorage();

        if (authData === null) {
            return null;
        } else {
            return authData.authToken;
        }
    }

    login(email: string, password: string): Observable<void> {

        return new Observable<void>(observer => {
            this.fetchAuthToken(email, password).subscribe(authData => {

                if (authData && authData.id && authData.token) {
                    this.setAuthDataToStorage(authData.id, authData.token);
                    observer.next();
                    observer.complete();

                } else {
                    const err = new CallanError();
                    err.message = 'Unable to login';
                    observer.error(err);
                }


            }, err => {
                observer.error(err);
            });

        });
    }

    logout(): Observable<boolean> {
        return new Observable<boolean>(observer => {

            const authData = this.getAuthDataFromStorage();

            if (authData && authData.authToken) {
                this.removeAuthToken(authData.authToken).subscribe(() => {
                    this.removeAuthDataFromStorage();
                }, err => {
                    observer.error(err)
                });
            }

            observer.next(true);
            observer.complete();
        });
    }

    abstract fetchAuthToken(email: string, password: string): Observable<{id: number, token: string}>;

    abstract removeAuthToken(token: string): Observable<boolean>;

    getAuthDataFromStorage(): { id: number, authToken: string } {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    setAuthDataToStorage(customerId: number, authToken: string) {
        localStorage.setItem('currentUser', JSON.stringify({authToken: authToken, id: customerId}));
    }

    removeAuthDataFromStorage() {
        localStorage.removeItem('currentUser');
    }
}
