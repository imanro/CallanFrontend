import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CallanCustomer} from '../../shared/models/customer.model';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// import {cloneDeep} from 'lodash/cloneDeep';
import * as _ from 'lodash';

@Component({
    selector: 'app-callan-customer-details',
    templateUrl: './customer-details.component.html',
    styleUrls: ['./customer-details.component.scss']
})
export class CallanCustomerDetailsComponent implements OnInit {

    @Input() customer: CallanCustomer;

    @Output() customerSaveEvent = new EventEmitter<CallanCustomer>();
    @Output() cancelEvent = new EventEmitter<void>();

    formTitle: string;
    customerForm: FormGroup;

    commonFormErrors = [];

    constructor(
        private fb: FormBuilder,
    ) {
        this.createForm();
    }

    ngOnInit() {
        this.formTitle = this.customer.isNew() ? 'Create customer' : 'Customer details';

        if (this.customer) {
            this.setFormValues();
        }
    }

    handleCustomerSave() {
        const saveCustomer = this.prepareSaveCustomer();
        console.log('We\'ve prepared following data:', saveCustomer);
        this.customerSaveEvent.next(saveCustomer);
    }

    handleCancel() {
        this.cancelEvent.next();
    }

    private createForm() {
        this.customerForm = this.fb.group({
            firstName: ['', Validators.required ],
            lastName: ['', Validators.required ],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    private setFormValues() {
        if (this.customer) {
            this.customerForm.patchValue({
                'firstName': this.customer.firstName,
                'lastName': this.customer.lastName,
                'email': this.customer.email
            });
        }
    }

    private prepareSaveCustomer() {
        const saveCustomer = _.cloneDeep(this.customer);
        const formModel = this.customerForm.value;

        saveCustomer.firstName = formModel.firstName;
        saveCustomer.lastName = formModel.lastName;
        saveCustomer.email = formModel.email;

        return saveCustomer;
    }


}
