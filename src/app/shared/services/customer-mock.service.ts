import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {delay} from 'rxjs/operators';


import {CallanCustomerService} from './customer.service';
import {CallanCustomer} from '../models/customer.model';
import {AppConfig} from '../../app.config';
import {mockCustomers} from '../data/mock-customers';
import {mockRoles} from '../data/mock-roles';
import {CallanRole} from '../models/role.model';
import {CallanAuthService} from './auth.service';

@Injectable()
export class CallanCustomerMockService extends CallanCustomerService {

    constructor(
        protected appConfig: AppConfig,
        protected authService: CallanAuthService
    ) {
        super(appConfig, authService);
    }

    getCustomers(): Observable<CallanCustomer[]> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCustomer[]>(observer => {
            observer.next(mockCustomers);
            observer.complete();

        }).pipe(
            delay(d)
        );
    }

    findCustomers(term: string): Observable<CallanCustomer[]> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCustomer[]>(observer => {
            observer.next(mockCustomers.filter(customer => customer.email.indexOf(term) !== -1));
            observer.complete();

        }).pipe(
            delay(d)
        );
    }


    getCustomer(id: number): Observable<CallanCustomer> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCustomer>(observer => {
            observer.next(mockCustomers[0]);
            observer.complete();

        }).pipe(
            delay(d)
        );
    }

    findCustomerByEmail(email: string): Observable<CallanCustomer> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCustomer>(observer => {
            observer.next(null);
            observer.complete();

        }).pipe(
            delay(d)
        );
    }

    getRoles(): Observable<CallanRole[]> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanRole[]>(observer => {
            observer.next(mockRoles);
            observer.complete();

        }).pipe(
            delay(d)
        );
    }

    autoUpdateTimezone(customer: CallanCustomer): Observable<void> {
        return new Observable<void>(observer => {
            observer.next();
            observer.complete();
        });
    }

    checkGoogleAuth(customer: CallanCustomer): Observable<boolean> {
        return new Observable(observer => {
            observer.next(false);
            observer.complete();
        })
    }

    getGoogleAuthLink(customer: CallanCustomer): Observable<string|boolean> {
        return new Observable(observer => {
            observer.next('http://google.com');
            observer.complete();
        })
    }

    mapDataToCustomer(customer: CallanCustomer, row: any): void {
    }

    mapDataToRole(role: CallanRole, row: any): void {
    }

    mapCustomerToData(customer: CallanCustomer): object {
        return {};
    }

    mapRoleToData(role: CallanRole): object {
        return {};
    }

    saveCustomer(customer: CallanCustomer): Observable<CallanCustomer> {
        const d = this.appConfig.mockDelayMs;
        customer.id = Math.floor(Math.random() * 100) + 1000;

        return new Observable<CallanCustomer>(observer => {
            mockCustomers.push(customer);
            observer.next(customer);
            observer.complete();
        }).pipe(
            delay(d)
        );
    }
}
