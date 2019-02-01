import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanCustomer} from '../../shared/models/customer.model';

@Component({
    selector: 'app-callan-customer-view',
    templateUrl: './customer-view.component.html',
    styleUrls: ['./customer-view.component.scss']
})
export class CustomerViewComponent implements OnInit {

    @Input() customer: CallanCustomer;

    @Output() navigateBack = new EventEmitter<void>();

    @Output() setCurrentCustomer = new EventEmitter<CallanCustomer>();

    @Output() activateCustomer = new EventEmitter<CallanCustomer>();

    @Output() deactivateCustomer = new EventEmitter<CallanCustomer>();

    @Output() editCustomer = new EventEmitter<CallanCustomer>();

    constructor() {
    }

    ngOnInit() {
    }

    formatCustomerRoles(customer: CallanCustomer): string {
        const list = [];
        if (customer) {
            for (const item of customer.roles) {
                list.push(item.name);
            }
        }

        return list.join(', ');
    }

    handleNavigateBack() {
        this.navigateBack.next();
    }

    handleSetCurrentCustomer(customer: CallanCustomer) {
        console.log(customer, '!!');
        this.setCurrentCustomer.next(customer);
    }

    handleActivateCustomer(customer: CallanCustomer) {
        customer.isActive = true;
        this.activateCustomer.next(customer);
    }

    handleDeactivateCustomer(customer: CallanCustomer) {
        customer.isActive = false;
        this.deactivateCustomer.next(customer);
    }

    handleEditCustomer(customer: CallanCustomer) {
        this.editCustomer.next(customer);
    }
}
