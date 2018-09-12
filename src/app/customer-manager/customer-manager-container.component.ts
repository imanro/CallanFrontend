import {Component, OnInit, OnDestroy} from '@angular/core';

import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'app-callan-customer-manager-container',
    templateUrl: './customer-manager-container.component.html',
    styleUrls: ['./customer-manager-container.component.scss']
})

export class CallanCustomerManagerContainerComponent implements OnInit, OnDestroy {

    customers$ = new BehaviorSubject<CallanCustomer[]>([]);

    currentCustomer$: Subscription;
    currentCustomer: CallanCustomer;
    isDetailsShown = false;

    constructor(
        private customerService: CallanCustomerService
    ) {
    }

    ngOnInit() {
        // this.customers$ = this.customerService.getCustomers();
        this.fetchCustomers();

        this.currentCustomer$ = this.customerService.getCurrentCustomer().subscribe(customer => {
            if (customer) {
                // console.log('customer assigned');
                this.currentCustomer = customer;
            }
        });

        // for developing purposes
        this.handleCustomerCreate();
    }

    ngOnDestroy() {
        this.currentCustomer$.unsubscribe();
    }

    handleSetCurrentCustomer(customer: CallanCustomer) {
        this.customerService.setCurrentCustomer(customer);
    }

    handleCustomerCreate() {
        this.currentCustomer = CallanCustomerService.createCustomer();
        this.customerService.initCustomer(this.currentCustomer);
        this.isDetailsShown = true;
    }

    handleCustomerSave(customer: CallanCustomer) {
        console.log('Customer save clicked');
        this.customerService.saveCustomer(customer).subscribe(() => {
            this.fetchCustomers();
            this.handleDetailsReset();
        });
    }

    handleDetailsReset() {
        this.isDetailsShown = false;
    }

    private fetchCustomers() {
        this.customerService.getCustomers().subscribe(customers => {
            this.customers$.next(customers);
        });
    }
}
