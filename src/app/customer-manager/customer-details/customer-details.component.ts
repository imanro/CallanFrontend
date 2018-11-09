import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {CallanCustomer} from '../../shared/models/customer.model';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';
// import {cloneDeep} from 'lodash/cloneDeep';
import * as _ from 'lodash';
import {CallanRole} from '../../shared/models/role.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanFormHelper} from '../../shared/helpers/form-helper';

@Component({
    selector: 'app-callan-customer-details',
    templateUrl: './customer-details.component.html',
    styleUrls: ['./customer-details.component.scss']
})
export class CallanCustomerDetailsComponent implements OnInit, OnDestroy {

    @Input() customer: CallanCustomer;
    @Input() rolesList: CallanRole[];
    @Input() formErrors$ =  new BehaviorSubject<AppFormErrors>(null);
    @Input() isSaving = false;

    @Output() customerSaveEvent = new EventEmitter<CallanCustomer>();
    @Output() cancelEvent = new EventEmitter<void>();

    @ViewChild('assignedRolesInput') assignedRolesInput: ElementRef;
    @ViewChild('existingRolesInput') existingRolesInput: ElementRef;

    formTitle: string;
    customerForm: FormGroup;

    assignedRoles: CallanRole[];
    existingRoles: CallanRole[];

    commonFormErrors = [];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder,
    ) {
        this.buildForm();
    }

    ngOnInit() {
        this.formTitle = this.customer.isNew() ? 'Create customer' : 'Customer details';

        if (this.customer) {
            this.setFormValues();
        }

        this.commonFormErrors = [];


        this.setAssignedRoles();
        this.setExistingRoles();

        this.formErrors$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formErrors => {

                if (formErrors) {
                    console.log('Errors received');

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.customerForm);
                    console.log('unmapped:', unmapped);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                        console.log('common Form errors now', this.commonFormErrors);
                    }
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleSaveCustomer() {
        if (this.validateForm()) {
            const saveCustomer = this.prepareSaveCustomer();
            console.log('We\'ve prepared following data:', saveCustomer);
            this.customerSaveEvent.next(saveCustomer);
        }
    }

    handleCancel() {
        this.cancelEvent.next();
    }

    handleAssignRole(role?: CallanRole) {

        const input = this.customerForm.get('assignedRoles');
        input.reset();
        input.markAsTouched();

        if (!role) {
            const firstOption = this.existingRolesInput.nativeElement.options[0];

            if (firstOption) {
                for (const check of this.existingRoles) {
                    if (check.id.toString() === firstOption.value) {
                        role = check;
                    }
                }
            }
        }

        if (role) {
            this.existingRoles = this.existingRoles.filter(check => {
                return check.id !== role.id;
            });

            this.assignedRoles.push(role);
            this.sortAssignedRoles();
        }
    }

    handleRefuseRole(role?: CallanRole) {

        const input = this.customerForm.get('assignedRoles');
        input.reset();
        input.markAsTouched();

        if (!role) {
            const firstOption = this.assignedRolesInput.nativeElement.options[0];

            if (firstOption) {
                for (const check of this.assignedRoles) {
                    if (check.id.toString() === firstOption.value) {
                        role = check;
                    }
                }
            }
        }

        if (role) {
            this.assignedRoles = this.assignedRoles.filter(check => {
                return check.id !== role.id;
            });

            this.existingRoles.push(role);
            this.sortExistingRoles();
        }
    }

    private buildForm() {

        const password = new FormControl('', [Validators.required, Validators.minLength(6)]);
        const passwordConfirm = new FormControl('', [Validators.required, Validators.minLength(6), CustomValidators.equalTo(password)]);

        this.customerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: password,
            passwordConfirm: passwordConfirm,
            assignedRoles: '',
            existingRoles: ''
        });

        this.customerForm.valueChanges.subscribe(() => {
            this.commonFormErrors = [];
        });
    }

    private setFormValues() {

        this.customerForm.patchValue({
            'firstName': this.customer.firstName,
            'lastName': this.customer.lastName,
            'email': this.customer.email
        });
    }

    private validateForm() {

        if (!this.assignedRoles.length) {
            const input = this.customerForm.get('assignedRoles');
            input.setErrors({'empty': 'You should choose at least 1 role for the customer'});
            return false;
        }

        return true;
    }

    private prepareSaveCustomer() {
        const saveCustomer = _.cloneDeep(this.customer);
        const formModel = this.customerForm.value;

        saveCustomer.firstName = formModel.firstName;
        saveCustomer.lastName = formModel.lastName;
        saveCustomer.email = formModel.email;
        saveCustomer.password = formModel.password;

        saveCustomer.roles = this.assignedRoles;

        return saveCustomer;
    }

    private setAssignedRoles() {
        this.assignedRoles = this.rolesList.filter(role => {
            for (const check of this.customer.roles) {
                if (check.id === role.id) {
                    return true;
                }
            }

            return false;
        });

        this.sortAssignedRoles();
    }

    private setExistingRoles() {
        this.existingRoles = this.rolesList.filter(role => {
            for (const check of this.assignedRoles) {
                if (check.id === role.id) {
                    return false;
                }
            }

            return true;
        });

        this.sortExistingRoles();
    }

    private sortExistingRoles() {
        this.existingRoles.sort((role1, role2) => {
            return role1.name.localeCompare(role2.name)
        });
    }

    private sortAssignedRoles() {
        this.assignedRoles.sort((role1, role2) => {
            return role1.name.localeCompare(role2.name)
        });
    }

}
