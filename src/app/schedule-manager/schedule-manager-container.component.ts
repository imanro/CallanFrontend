import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {CallanScheduleManagerViewEnum} from '../shared/enums/schedule-manager.view.enum';
import {CallanScheduleRange} from '../shared/models/schedule-range.model';
import {CallanScheduleService} from '../shared/services/schedule.service';
import {AppError} from '../shared/models/error.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-schedule-manager-container',
    templateUrl: './schedule-manager-container.component.html',
    styleUrls: ['./schedule-manager-container.component.scss']
})
export class CallanScheduleManagerContainerComponent implements OnInit, OnDestroy {

    view = CallanScheduleManagerViewEnum.DEFAULT;
    viewNameEnum: any;

    currentCustomer: CallanCustomer;
    scheduleRanges$ = new BehaviorSubject<CallanScheduleRange[]>([]);
    currentScheduleRange: CallanScheduleRange;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);

    isSaving = false;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private scheduleService: CallanScheduleService,
        private customerService: CallanCustomerService,
        private toastrService: ToastrService
    ) {
        this.viewNameEnum = CallanScheduleManagerViewEnum;

        console.log('tof:', typeof(this.viewNameEnum));
    }

    ngOnInit() {
        this.assignCurrentCustomer();
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleScheduleRangeDetailsCancel() {
        this.view = CallanScheduleManagerViewEnum.DEFAULT;
    }

    handleShowScheduleRangeDetails() {

        this.currentScheduleRange = CallanScheduleService.createScheduleRange();
        this.scheduleService.initScheduleRange(this.currentScheduleRange);

        this.view = CallanScheduleManagerViewEnum.RANGE_DETAILS;
    }

    handleScheduleRangeDetailsSave(scheduleRange: CallanScheduleRange) {
        console.log('To save', scheduleRange);
        this.scheduleService.saveScheduleRange(scheduleRange).subscribe(() => {

            this.isSaving = false;

            // this.fetchScheduleRanges();
            this.toastrService.success('Time range has been successfully saved', 'Success');
            this.view = CallanScheduleManagerViewEnum.DEFAULT;

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

    private assignCurrentCustomer() {
        this.customerService.getCurrentCustomer()
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(customer => {
                this.currentCustomer = customer;

                if (customer) {
                    console.log('Customer has been assigned');
                    this.assignScheduleRanges();
                }
            });
    }

    private assignScheduleRanges() {
        if (this.currentCustomer) {
            this.scheduleService.getScheduleRanges(this.currentCustomer)
                .subscribe(scheduleRanges => {
                    console.log('and, here is ranges', scheduleRanges);
                    this.scheduleRanges$.next(scheduleRanges);
                });
        }
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

}