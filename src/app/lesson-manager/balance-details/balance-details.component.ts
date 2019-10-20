import {Component, EventEmitter, Input, Output, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CallanCourse} from '../../shared/models/course.model';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import * as _ from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {CallanDateService} from '../../shared/services/date.service';

@Component({
    selector: 'app-balance-details',
    templateUrl: './balance-details.component.html',
    styleUrls: ['./balance-details.component.scss']
})
export class CallanBalanceDetailsComponent implements OnInit, OnDestroy
{
    @Input() courseProgress: CallanCourseProgress;

    @Input() formErrors$ =  new Subject<AppFormErrors>();

    @Output() cancelEvent = new EventEmitter<void>();

    @Output() balanceSaveEvent = new EventEmitter<CallanCourseProgress>();

    balanceForm: FormGroup;

    commonFormErrors = [];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder
    ) {
        this.buildForm();
    }

    ngOnInit() {

        this.setFormValues();

        this.formErrors$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formErrors => {

                if (formErrors) {
                    console.log('Errors received');

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.balanceForm);
                    console.log('unmapped:', unmapped);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                        console.log('common Form errors now', this.balanceForm);
                    }
                }
            });

        this.commonFormErrors = [];
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    private setFormValues() {
        this.balanceForm.patchValue({'hoursBalance': CallanDateService.getHoursPartOfHourlyConvertedMinutes(this.courseProgress.minutesBalance)});
        this.balanceForm.patchValue({'minutesBalance': CallanDateService.getMinutesPartOfHourlyConvertedMinutes(this.courseProgress.minutesBalance)});
    }

    private buildForm() {
        this.balanceForm = this.fb.group({
            hoursBalance: ['', Validators.required],
            minutesBalance: [''],
        });
    }

    private prepareCourseProgressSave() {
        const courseProgressSave = _.cloneDeep(this.courseProgress);
        const formModel = this.balanceForm.value;
        courseProgressSave.minutesBalance = CallanDateService.convertHoursMinutesToMinutes(formModel.hoursBalance, formModel.minutesBalance);
        console.log('obtained value', courseProgressSave.minutesBalance);
        return courseProgressSave;
    }


    handleCancel() {
        this.cancelEvent.next();
    }

    handleMinutesBalanceSave() {
        const courseProgressSave = this.prepareCourseProgressSave();
        this.balanceSaveEvent.next(courseProgressSave);
    }

}
