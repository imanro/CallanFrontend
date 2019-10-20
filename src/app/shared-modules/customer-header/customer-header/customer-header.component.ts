import {Component, Input, OnInit} from '@angular/core';
import {CallanCustomer} from '../../../shared/models/customer.model';
import {CallanCustomerService} from '../../../shared/services/customer.service';
import {CallanUiService} from '../../../shared/services/ui.service';

@Component({
    selector: 'app-callan-customer-header',
    templateUrl: './customer-header.component.html',
    styleUrls: ['./customer-header.component.scss']
})
export class CallanCustomerHeaderComponent implements OnInit {

    @Input() customer: CallanCustomer;

    @Input() forceRole: string;

    @Input() isInline = false;

    constructor() {

    }

    ngOnInit() {
    }

    customerAvatarInitials(customer: CallanCustomer) {
        return CallanCustomerService.getCustomerAvatarInitials(customer);
    }

    customerAvatarColorSet(customer: CallanCustomer) {
        return CallanUiService.getCustomerAvatarsColors(customer, this.forceRole);
    }

}
