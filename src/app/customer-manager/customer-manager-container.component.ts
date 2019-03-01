import {Component, OnDestroy, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanRole} from '../shared/models/role.model';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {CallanFormHelper} from '../shared/helpers/form-helper';
import {AppError} from '../shared/models/error.model';
import {CallanCustomerManagerViewEnum} from '../shared/enums/customer-manager.view.enum';
import {CallanLessonService} from '../shared/services/lesson.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil, finalize} from 'rxjs/operators';
import {CallanCustomerManagerOperationEnum} from '../shared/enums/customer-manager.operation.enum';
import {AppConfig} from '../app.config';

@Component({
    selector: 'app-callan-customer-manager-container',
    templateUrl: './customer-manager-container.component.html',
    styleUrls: ['./customer-manager-container.component.scss']
})

export class CallanCustomerManagerContainerComponent implements OnInit, OnDestroy {

    view = CallanCustomerManagerViewEnum.LIST;

    viewNameEnum: any;

    operationNameEnum: any;

    customers: CallanCustomer[];

    rolesList: CallanRole[];

    operateCustomer: CallanCustomer;

    currentCustomer: CallanCustomer;

    isProgress = false;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);

    listRowsLimit: number;

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private appConfig: AppConfig,
        private location: Location,
        private route: ActivatedRoute,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private toastrService: ToastrService
    ) {
        this.viewNameEnum = CallanCustomerManagerViewEnum;
        this.operationNameEnum = CallanCustomerManagerOperationEnum;
        this.listRowsLimit = this.appConfig.listRowsLimit;
    }

    ngOnInit() {
        this.processRouteParams();
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
        console.log(customer, '??');
        this.setCurrentCustomer(customer);
    }

    handleViewCustomer(customer?: CallanCustomer) {

        if (customer) {
            this.location.replaceState('/customers/' + customer.id);
            this.operateCustomer = customer;
        }

        if (this.operateCustomer && this.operateCustomer.id) {
            this.view = CallanCustomerManagerViewEnum.CUSTOMER_VIEW;
        } else {
            this.view = CallanCustomerManagerViewEnum.LIST;
        }
    }

    handleEditCustomer(customer: CallanCustomer) {
        this.operateCustomer = customer;
        this.view = CallanCustomerManagerViewEnum.CUSTOMER_DETAILS;
    }

    handleCustomerCreate() {
        this.operateCustomer = CallanCustomerService.createCustomer();
        this.customerService.initNewCustomer(this.operateCustomer).subscribe(() => {
            this.view = CallanCustomerManagerViewEnum.CUSTOMER_DETAILS;
        });
    }

    handleCustomerSave(customer: CallanCustomer, operation?: string) {

        this.isProgress = true;

        // checking if this user exists
        if (customer.id) {
            console.log('This case', customer);
            this.customerService.findCustomerByEmail(customer.email).subscribe(existingCustomer => {
                if (existingCustomer && existingCustomer.id !== customer.id) {
                    // create form errors object
                    this.isProgress = false;
                    const formErrors = this.createFormErrors();
                    this.toastrService.warning('Please check the form', 'Warning');
                    CallanFormHelper.addFormError(formErrors, 'email', 'Another user with the same email is already exists');
                    this.formErrors$.next(formErrors);
                } else {
                    this.customerService.saveCustomer(customer)
                        .pipe(
                            finalize(() => {
                                console.log('Here!!');
                                this.isProgress = false;
                            })
                        )
                        .subscribe(() => {
                            this.fetchCustomers();

                            switch (operation) {
                                case (CallanCustomerManagerOperationEnum.SAVE):
                                default:
                                    this.toastrService.success('The Customer has been successfully saved', 'Success');
                                    break;
                                case (CallanCustomerManagerOperationEnum.ACTIVATE):
                                    this.toastrService.success('The Customer has been successfully activate', 'Success');
                                    break;
                                case (CallanCustomerManagerOperationEnum.DEACTIVATE):
                                    this.toastrService.warning('The Customer has been successfully blocked', 'Warning');
                                    break;
                            }

                            this.handleViewCustomer(customer);
                        }, err => {

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

        } else {
            this.customerService.findCustomerByEmail(customer.email).subscribe(existingCustomer => {
                if (existingCustomer) {
                    // create form errors object
                    const formErrors = this.createFormErrors();
                    this.toastrService.warning('Please check the form', 'Warning');
                    CallanFormHelper.addFormError(formErrors, 'email', 'Such user already exists');
                    this.formErrors$.next(formErrors);
                } else {

                    this.customerService.saveCustomer(customer).subscribe(() => {

                        this.isProgress = false;

                        this.fetchCustomers();

                        switch (operation) {
                            case (CallanCustomerManagerOperationEnum.SAVE):
                            default:
                                this.toastrService.success('The Customer has been successfully saved', 'Success');
                                break;
                            case (CallanCustomerManagerOperationEnum.ACTIVATE):
                                this.toastrService.success('The Customer has been successfully activate', 'Success');
                                break;
                            case (CallanCustomerManagerOperationEnum.DEACTIVATE):
                                this.toastrService.warning('The Customer has been successfully blocked', 'Warning');
                                break;
                        }


                        this.handleViewCustomer(customer);

                    }, err => {

                        this.isProgress = false;

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
    }

    handleDetailsReset() {
        this.view = CallanCustomerManagerViewEnum.LIST;
        this.formErrors$.next(null);
    }

    handleNavigateBack() {
        this.view = CallanCustomerManagerViewEnum.LIST;
        this.location.replaceState('/customers');
    }

    private processRouteParams() {
        this.route.params
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(params => {
                if (params['customerId'] !== undefined) {
                    console.log('customer id set');
                    this.customerService.getCustomer(params['customerId']).subscribe(customer => {
                        this.setOperateCustomer(customer);
                        this.view = CallanCustomerManagerViewEnum.CUSTOMER_VIEW;
                    })
                }
            });
    }

    private subscribeOnCurrentCustomer() {
        this.customerService.getCurrentCustomer$().subscribe(customer => {
            // CHECKME
            // this.currentCustomer = customer;
        });
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private fetchCustomers() {
        this.customerService.getCustomers().subscribe(customers => {
            this.customers = customers;
        });
    }

    private fetchRolesList() {
        this.customerService.getRoles().subscribe(roles => {
            console.log('roles received');
            this.rolesList = roles;
        });
    }

    private setOperateCustomer(customer: CallanCustomer) {
        // resetting current data in lessonService
        this.operateCustomer = customer;
    }

    private setCurrentCustomer(customer: CallanCustomer) {
        this.customerService.setCurrentCustomer(customer);
        // resetting current data in lessonService
        this.lessonService.reset();
        this.toastrService.clear();
        this.toastrService.success('Current customer now is ' + customer.firstName);
    }

}
