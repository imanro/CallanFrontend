import {Component, OnInit, OnDestroy} from '@angular/core';

import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanRole} from '../shared/models/role.model';
import {CallanFormErrors} from '../shared/models/form-errors.model';
import {CallanFormHelper} from '../shared/helpers/form-helper';
import {ToastrService} from 'ngx-toastr';
import {CallanError} from '../shared/models/error.model';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-callan-customer-manager-container',
    templateUrl: './customer-manager-container.component.html',
    styleUrls: ['./customer-manager-container.component.scss']
})

export class CallanCustomerManagerContainerComponent implements OnInit, OnDestroy {

    customers$ = new BehaviorSubject<CallanCustomer[]>([]);
    rolesList$ = new BehaviorSubject<CallanRole[]>([]);

    currentCustomer$: Subscription;
    currentCustomer: CallanCustomer;
    isDetailsShown = false;
    isSaving = false;

    formErrors$ = new BehaviorSubject<CallanFormErrors>(null);

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private customerService: CallanCustomerService,
        private toastrService: ToastrService
    ) {
    }

    ngOnInit() {
        // this.customers$ = this.customerService.getCustomers();
        this.fetchCustomers();
        this.fetchRolesList();

        /*
        this.currentCustomer$ = this.customerService.getCurrentCustomer()
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(customer => {
                if (customer) {
                    // console.log('customer assigned');
                    this.currentCustomer = customer;
                }
            });
            */

        this.setCurrentCustomer();

        // for developing purposes
        // this.handleCustomerCreate();
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleSetCurrentCustomer(customer: CallanCustomer) {
        this.customerService.setCurrentCustomer(customer);
        this.setCurrentCustomer();
    }

    handleCustomerCreate() {
        this.currentCustomer = CallanCustomerService.createCustomer();
        this.customerService.initCustomer(this.currentCustomer);
        this.isDetailsShown = true;
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

                    if (err instanceof CallanError) {
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
        this.isDetailsShown = false;
        this.formErrors$.next(null);
    }

    private setCurrentCustomer() {
        this.customerService.getCurrentCustomer().subscribe(customer => {
            console.log('here!!');
            console.log('is details shown', this.isDetailsShown);
            this.currentCustomer = customer;
        });
    }

    private createFormErrors() {
        return new CallanFormErrors();
    }

    private fetchCustomers() {
        this.customerService.getCustomers().subscribe(customers => {
            this.customers$.next(customers);
        });
    }

    private fetchRolesList() {
        this.customerService.getRoles().subscribe(roles => {
            console.log('roles received');
            this.rolesList$.next(roles);
        });
    }

}
