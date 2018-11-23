import {Component, OnDestroy, OnInit} from '@angular/core';

import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanRole} from '../shared/models/role.model';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {CallanFormHelper} from '../shared/helpers/form-helper';
import {ToastrService} from 'ngx-toastr';
import {AppError} from '../shared/models/error.model';
import {CallanCustomerManagerViewEnum} from '../shared/enums/customer-manager.view.enum';

@Component({
    selector: 'app-callan-customer-manager-container',
    templateUrl: './customer-manager-container.component.html',
    styleUrls: ['./customer-manager-container.component.scss']
})

export class CallanCustomerManagerContainerComponent implements OnInit, OnDestroy {

    view = CallanCustomerManagerViewEnum.DEFAULT;
    viewNameEnum: any;

    customers$ = new BehaviorSubject<CallanCustomer[]>([]);
    rolesList: CallanRole[];
    currentCustomer: CallanCustomer;
    isSaving = false;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private customerService: CallanCustomerService,
        private toastrService: ToastrService
    ) {
        this.viewNameEnum = CallanCustomerManagerViewEnum;
    }

    ngOnInit() {
        this.fetchCustomers();
        this.fetchRolesList();
        this.subscribeOnCurrentCustomer();

        // for developing purposes
        // this.handleCustomerCreate();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleSetCurrentCustomer(customer: CallanCustomer) {
        this.customerService.setCurrentCustomer(customer);
        this.toastrService.clear();
        this.toastrService.success('Current customer now is ' + customer.firstName);
    }

    handleCustomerCreate() {
        this.currentCustomer = CallanCustomerService.createCustomer();
        this.customerService.initNewCustomer(this.currentCustomer).subscribe(() => {
            this.view = CallanCustomerManagerViewEnum.CUSTOMER_DETAILS;
        });
    }

    handleCustomerSave(customer: CallanCustomer) {

        this.isSaving = true;

        // checking if this user exists
        this.customerService.isCustomerExists(customer.email).subscribe(result => {
            if (result) {
                // create form errors object
                const formErrors = this.createFormErrors();
                this.toastrService.warning('Please check the form', 'Warning');
                CallanFormHelper.addFormError(formErrors, 'email', 'Such user already exists');
                this.formErrors$.next(formErrors);
            } else {

                this.customerService.saveCustomer(customer).subscribe(() => {

                    this.isSaving = false;

                    this.fetchCustomers();
                    this.toastrService.success('User has been successfully saved', 'Success');
                    this.handleDetailsReset();
                }, err => {

                    this.isSaving = false;

                    if (err instanceof AppError) {
                        if (err.httpStatus === 401 || err.httpStatus === 403) {
                            throw err.error;
                        } else {
                            this.toastrService.warning('Please check the form', 'Warning');
                            const formErrors = this.createFormErrors();
                            const message = err.message;
                            formErrors.common.push(message);
                            formErrors.assignServerFieldErrors(err.formErrors);
                            this.formErrors$.next(formErrors);
                        }

                    } else {
                        throw err;
                    }
                });
            }
        });
    }

    handleDetailsReset() {
        this.view = CallanCustomerManagerViewEnum.DEFAULT;
        this.formErrors$.next(null);
    }

    private subscribeOnCurrentCustomer() {
        this.customerService.getCurrentCustomer$().subscribe(customer => {
            this.currentCustomer = customer;
        });
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private fetchCustomers() {
        this.customerService.getCustomers().subscribe(customers => {
            this.customers$.next(customers);
        });
    }

    private fetchRolesList() {
        this.customerService.getRoles().subscribe(roles => {
            console.log('roles received');
            this.rolesList = roles;
        });
    }

}
