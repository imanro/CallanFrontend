import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {CallanScheduleManagerViewEnum} from '../shared/enums/schedule-manager.view.enum';
import {CallanScheduleRange} from '../shared/models/schedule-range.model';
import {CallanScheduleService} from '../shared/services/schedule.service';
import {AppError} from '../shared/models/error.model';
import {BehaviorSubject, Observable, Subject, timer as observableTimer} from 'rxjs';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {takeUntil} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppModalContentComponent} from '../shared-modules/modal-content/modal-content.component';

@Component({
    selector: 'app-schedule-manager-container',
    templateUrl: './schedule-manager-container.component.html',
    styleUrls: ['./schedule-manager-container.component.scss']
})
export class CallanScheduleManagerContainerComponent implements OnInit, OnDestroy {

    view = CallanScheduleManagerViewEnum.DEFAULT;
    viewNameEnum: any;

    currentCustomer: CallanCustomer;
    datesEnabled: Date[] = [];
    scheduleRanges$ = new BehaviorSubject<CallanScheduleRange[]>([]);
    currentScheduleRange: CallanScheduleRange;
    currentDate: Date;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);
    refresh$ = new Subject<void>();

    isSaving = false;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private scheduleService: CallanScheduleService,
        private customerService: CallanCustomerService,
        private toastrService: ToastrService,
        private modalService: NgbModal
    ) {
        this.viewNameEnum = CallanScheduleManagerViewEnum;
        console.log('tof:', typeof(this.viewNameEnum));
    }

    ngOnInit() {
        this.setCurrentDate(new Date());
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

    handleScheduleRangeSave(scheduleRange: CallanScheduleRange) {
        console.log('To save', scheduleRange);
        scheduleRange.customer = this.currentCustomer;

        this.scheduleService.saveScheduleRange(scheduleRange).subscribe(() => {

            this.isSaving = false;

            // this.fetchScheduleRanges();
            this.toastrService.success('Time range has been successfully saved', 'Success');
            this.view = CallanScheduleManagerViewEnum.DEFAULT;
            // re-read
            this.assignScheduleRanges();
            this.assignDatesEnabled(this.currentDate);

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

    handleScheduleRangeDelete(scheduleRange: CallanScheduleRange) {

        const modalRef = this.modalService.open(AppModalContentComponent, {
            centered: true,
            backdrop: true,
            size: 'lg'
        });

        modalRef.componentInstance.title = 'Confirm';
        modalRef.componentInstance.body = 'Are you sure you want to delete this range?';

        modalRef.result.then((userResponse) => {

            if (userResponse) {
                this.scheduleService.deleteScheduleRange(scheduleRange).subscribe(() => {
                        this.toastrService.success('Time range has been successfully deleted', 'Success');
                        this.assignScheduleRanges();
                        this.assignDatesEnabled(this.currentDate);
                    },
                    err => {
                        this.toastrService.error('Something went wrong', 'Error');
                    }
                );
            }
        }, () => {
            // just do nothing
        });
    }

    handleSetCurrentDate(date) {
        this.setCurrentDate(date);
        this.assignDatesEnabled(date);
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
                    this.assignDatesEnabled(this.currentDate);
                }
            });
    }

    private setCurrentDate(date: Date) {
        this.currentDate = date;
    }

    private assignScheduleRanges() {
        if (this.currentCustomer) {
            this.scheduleService.getScheduleRanges(this.currentCustomer)
                .subscribe(scheduleRanges => {
                    console.log('and, here is ranges', scheduleRanges);
                    this.scheduleRanges$.next(scheduleRanges);
                    this.refresh$.next();
                });
        }
    }

    private assignDatesEnabled(date: Date) {
        // CHECK, why customer isnt presented
        const range = CallanScheduleService.getWeekDatesRangeForDate(date);
        console.log('created range', range);

        if (this.currentCustomer) {
            this.scheduleService.getHoursAvailable(range[0], range[1], this.currentCustomer).subscribe(dates => {
                // this.datesEnabled$.next(dates);
                this.datesEnabled = dates;

                // we need this indeed
                observableTimer(100).subscribe(() => {
                    this.refresh$.next();
                });
            });
        }
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

}
