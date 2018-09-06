import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';

// import {CallanCustomersModule} from '../callan.module';
import {CallanCustomer} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

// @Injectable({
//  providedIn: CallanCustomersModule
// })

@Injectable()
export abstract class CallanCustomerService {

  private currentCustomer = new BehaviorSubject<CallanCustomer>(null);

  constructor() { }

  abstract getCustomers(): Observable<CallanCustomer[]>;

  setCurrentCustomer(customer: CallanCustomer): BehaviorSubject<CallanCustomer> {
    this.currentCustomer.next(customer);
    return this.currentCustomer;
  }

  getCurrentCustomer(): BehaviorSubject<CallanCustomer> {
      return this.currentCustomer;
  }
}
