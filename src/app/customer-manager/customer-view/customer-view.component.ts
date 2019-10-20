import {Component, EventEmitter, Input, OnInit, Output, Sanitizer, SecurityContext} from '@angular/core';
import {CallanCustomer} from '../../shared/models/customer.model';
import * as _ from 'lodash';
import {CallanCustomerService} from '../../shared/services/customer.service';
import {CallanUiService} from '../../shared/services/ui.service';

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

    constructor(
        private sanitizer: Sanitizer
    ) {
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
        this.setCurrentCustomer.next(customer);
    }

    handleActivateCustomer(customer: CallanCustomer) {
        const saveCustomer = _.cloneDeep(customer);
        saveCustomer.isActive = true;
        this.activateCustomer.next(saveCustomer);
    }

    handleDeactivateCustomer(customer: CallanCustomer) {
        const saveCustomer = _.cloneDeep(customer);
        saveCustomer.isActive = false;
        this.deactivateCustomer.next(saveCustomer);
    }

    handleEditCustomer(customer: CallanCustomer) {
        this.editCustomer.next(customer);
    }

    customerAvatarInitials(customer: CallanCustomer) {
        return CallanCustomerService.getCustomerAvatarInitials(customer);
    }

     customerAvatarColorSet(customer: CallanCustomer) {
        return CallanUiService.getCustomerAvatarsColors(customer);
    }
}
