import {Component, OnInit, EventEmitter, Input, Output, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {CallanCustomer} from '../shared/models/callan-customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'app-callan-customers',
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss']
})

export class CallanCustomersComponent implements OnInit, OnDestroy {

    customers$: Observable<CallanCustomer[]>;

    currentCustomer$: Subscription;
    currentCustomer: CallanCustomer;

    constructor(
        private customerService: CallanCustomerService
    ) {
    }

    ngOnInit() {
        this.customers$ = this.customerService.getCustomers();
        this.currentCustomer$ = this.customerService.getCurrentCustomer().subscribe(customer => {
            if (customer instanceof CallanCustomer) {
                // console.log('customer assigned');
                this.currentCustomer = customer;
            }
        });
    }

    onSetCurrentCustomer(customer: any) {
        if (customer instanceof CallanCustomer) {
            this.customerService.setCurrentCustomer(customer);
        } else {
            throw new Error('Unknown data given');
        }
    }

    ngOnDestroy() {
        this.currentCustomer$.unsubscribe();
    }
}
