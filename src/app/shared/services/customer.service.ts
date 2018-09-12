import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

// import {CallanCustomersModule} from '../callan.module';
import {CallanCustomer} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {environment} from '../../../environments/environment';
import {CallanEnvironmentNameEnum} from '../enums/environment.name.enum';

// @Injectable({
//  providedIn: CallanCustomersModule
// })

@Injectable()
export abstract class CallanCustomerService {

    private currentCustomer = new BehaviorSubject<CallanCustomer>(null);

    static createCustomer(): CallanCustomer {
        return new CallanCustomer();
    }

    constructor() {
    }

    abstract getCustomers(): Observable<CallanCustomer[]>;

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

    initCustomerDev(customer: CallanCustomer) {
        customer.email = 'simon@bbc.com';
        customer.firstName = 'Simon';
        customer.lastName = 'McCoy';
    }
}
