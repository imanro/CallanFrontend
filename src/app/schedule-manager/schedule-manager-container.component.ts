import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {ScheduleManagerViewNameEnum} from '../shared/enums/schedule-manager-view.name.enum';
import {CallanScheduleRange} from '../shared/models/schedule-range.model';
import {CallanScheduleService} from '../shared/services/schedule.service';
import {AppError} from '../shared/models/error.model';
import {BehaviorSubject} from 'rxjs';
import {AppFormErrors} from '../shared/models/form-errors.model';

@Component({
    selector: 'app-schedule-manager-container',
    templateUrl: './schedule-manager-container.component.html',
    styleUrls: ['./schedule-manager-container.component.scss']
})
export class CallanScheduleManagerContainerComponent implements OnInit, OnDestroy {

    view = ScheduleManagerViewNameEnum.DEFAULT;
    viewNameEnum: any;

    currentScheduleRange: CallanScheduleRange;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);

    isSaving = false;

    constructor(
        private scheduleService: CallanScheduleService,
        private toastrService: ToastrService
    ) {
        this.viewNameEnum = ScheduleManagerViewNameEnum;

        console.log('tof:', typeof(this.viewNameEnum));
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    handleScheduleRangeDetailsCancel() {
        this.view = ScheduleManagerViewNameEnum.DEFAULT;
    }

    handleShowScheduleRangeDetails() {

        this.currentScheduleRange = CallanScheduleService.createScheduleRange();
        this.scheduleService.initScheduleRange(this.currentScheduleRange);

        this.view = ScheduleManagerViewNameEnum.RANGE_DETAILS;
    }

    handleScheduleRangeDetailsSave(scheduleRange: CallanScheduleRange) {
        console.log('To save', scheduleRange);
        this.scheduleService.saveScheduleRange(scheduleRange).subscribe(() => {

            this.isSaving = false;

            // this.fetchScheduleRanges();
            this.toastrService.success('Time range has been successfully saved', 'Success');
            this.view = ScheduleManagerViewNameEnum.DEFAULT;

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

    private createFormErrors() {
        return new AppFormErrors();
    }

}
