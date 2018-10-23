import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {delay} from 'rxjs/operators';

// import { CallanCustomersModule } from '../callan.module';
import {CallanCustomerService} from './customer.service';
import {CallanCustomer} from '../models/customer.model';
import {AppConfig, IAppConfig} from '../../app.config';
import {mockCustomers} from '../data/mock-customers';
import {mockRoles} from '../data/mock-roles';
import {CallanRole} from '../models/role.model';
import {CallanAuthService} from './auth.service';

// @Injectable({
//  providedIn: CallanCustomersModule
// })

@Injectable()
export class CallanCustomerMockService extends CallanCustomerService {

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig,
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

    getCustomer(id: number): Observable<CallanCustomer> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCustomer>(observer => {
            observer.next(mockCustomers[0]);
            observer.complete();

        }).pipe(
            delay(d)
        );
    }

    isCustomerExists(email: string): Observable<boolean> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<boolean>(observer => {
            observer.next(false);
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
