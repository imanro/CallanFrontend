import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';

@Component({
  selector: 'app-customer-profile-container',
  templateUrl: './customer-profile-container.component.html',
  styleUrls: ['./customer-profile-container.component.scss']
})
export class CustomerProfileContainerComponent implements OnInit, OnDestroy {

    currentCustomer: CallanCustomer;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private customerService: CallanCustomerService
    ) {
    }

    ngOnInit() {
        this.assignCurrentCustomer();
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    private assignCurrentCustomer() {
        this.customerService.getCurrentCustomer().subscribe(customer => {
            this.currentCustomer = customer;
        });
    }

}
