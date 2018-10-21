import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

// import {CallanCustomersModule} from '../callan.module';
import {CallanCustomer} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {environment} from '../../../environments/environment';
import {CallanEnvironmentNameEnum} from '../enums/environment.name.enum';
import {CallanBaseService} from './base.service';
import {CallanRole} from '../models/role.model';
import {CallanRoleNameEnum} from '../enums/role.name.enum';
import {CallanError} from '../models/error.model';

import {mockRoles} from '../data/mock-roles';

@Injectable()
export abstract class CallanCustomerService extends CallanBaseService {

    private currentCustomer = new BehaviorSubject<CallanCustomer>(null);

    static createCustomer(): CallanCustomer {
        return new CallanCustomer();
    }

    static createRole(): CallanRole {
        return new CallanRole();
    }

    abstract getCustomers(): Observable<CallanCustomer[]>;

    abstract getCustomer(id: number): Observable<CallanCustomer>;

    abstract isCustomerExists(email)

    abstract getRoles(): Observable<CallanRole[]>;

    abstract saveCustomer(customer: CallanCustomer): Observable<CallanCustomer>;

    setCurrentCustomer(customer: CallanCustomer): BehaviorSubject<CallanCustomer> {
        this.currentCustomer.next(customer);
        return this.currentCustomer;
    }

    getCurrentCustomer(): BehaviorSubject<CallanCustomer> {
        return this.currentCustomer;
    }

    initCustomer(customer: CallanCustomer) {
        if (environment.name === CallanEnvironmentNameEnum.DEV) {
            this.initCustomerDev(customer);
        }
    }

    abstract mapDataToCustomer(customer: CallanCustomer, row: any): void;

    abstract mapCustomerToData(customer: CallanCustomer): object;

    abstract mapDataToRole(role: CallanRole, row: any): void;

    abstract mapRoleToData(role: CallanRole): object;

    initCustomerDev(customer: CallanCustomer) {
        customer.email = 'simon@bbc.com';
        customer.firstName = 'Simon';
        customer.lastName = 'McCoy';

        const roleStudent = mockRoles[1];

        customer.roles = [roleStudent];
    }
}
