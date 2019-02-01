import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, interval as observableInterval} from 'rxjs';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanCustomerProfileViewEnum} from '../shared/enums/customer-profile.view.enum';
import {CallanTimezone} from '../shared/models/timezone.model';
import {CallanDateService} from '../shared/services/date.service';
import {AppError} from '../shared/models/error.model';
import {ToastrService} from 'ngx-toastr';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-customer-profile-container',
  templateUrl: './customer-profile-container.component.html',
  styleUrls: ['./customer-profile-container.component.scss']
})
export class CustomerProfileContainerComponent implements OnInit, OnDestroy {

    currentCustomer: CallanCustomer;

    timezonesList: CallanTimezone[];

    view = CallanCustomerProfileViewEnum.DASHBOARD;

    formErrors$ = new Subject<AppFormErrors>();

    viewNameEnum: any;

    isSaving = false;

    isGoogleAuthorized = false;

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private customerService: CallanCustomerService,
        private dateService: CallanDateService,
        private toastrService: ToastrService
    ) {
        this.viewNameEnum = CallanCustomerProfileViewEnum;
    }

    ngOnInit() {
        this.assignCurrentCustomer().subscribe(() => {
            this.checkGoogleAuth();
        });
        this.assignTimezoneList();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleCustomerSelfDetailsShow() {
        this.view = CallanCustomerProfileViewEnum.CUSTOMER_SELF_DETAILS;
    }

    handleCustomerSelfDetailsCancel() {
        this.view = CallanCustomerProfileViewEnum.DASHBOARD;
    }

    handleCustomerSave(customer: CallanCustomer) {
        this.isSaving = true;
        this.customerService.saveCustomer(customer).subscribe(() => {
            this.isSaving = false;
            this.updateCurrentCustomer();
            this.toastrService.success('User has been successfully saved', 'Success');
            this.view = CallanCustomerProfileViewEnum.DASHBOARD;

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

    handleAuthorizeGoogle() {
        console.log('Sending request to obtain auth link');
        this.customerService.getGoogleAuthLink(this.currentCustomer)
            .subscribe(result => {


                if (result) {
                    const link = result.toString();
                    const win = window.open(link, '_blank');
                    win.focus();

                    observableInterval(60000)
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe(() => {
                            console.log('Checking again google auth');
                            this.checkGoogleAuth();
                        });
                } else {
                    console.error('Something went wrong, unable to obtain auth link');
                    this.toastrService.warning('Something went wrong, please, try again later');
                }


                // + set timeout to refresh status of google auth every 1min
            });
    }

    private checkGoogleAuth() {
        if (this.currentCustomer) {
            this.customerService.checkGoogleAuth(this.currentCustomer)
                .subscribe(result => {
                   this.isGoogleAuthorized = result;
                });
            console.log('Checking if customer is authorized in Google api');
        }
    }

    private assignCurrentCustomer(): Observable<void> {

        return new Observable(observer => {
            this.customerService.getAuthCustomer().subscribe(customer => {
                console.log('customer', customer);
                this.currentCustomer = customer;

                observer.next();
                observer.complete();
            });
        });

    }

    private assignTimezoneList() {
        this.dateService.getTimezones().subscribe(zones => {
            this.timezonesList = zones;
        })
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private updateCurrentCustomer() {
        this.customerService.getCustomer(this.currentCustomer.id)
            .subscribe(customer => {
                console.log(customer.timezone);
                this.customerService.setAuthCustomer(customer);
                this.assignCurrentCustomer().subscribe(() => {});
            });
    }

}
