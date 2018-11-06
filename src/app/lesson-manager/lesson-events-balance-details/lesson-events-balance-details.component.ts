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

@Component({
    selector: 'app-lesson-events-balance-details',
    templateUrl: './lesson-events-balance-details.component.html',
    styleUrls: ['./lesson-events-balance-details.component.scss']
})
export class LessonEventsBalanceDetailsComponent implements OnInit, OnDestroy
{

    @Input() courseProgress: CallanCourseProgress;

    @Input() formErrors$ =  new BehaviorSubject<AppFormErrors>(null);

    @Output() cancelEvent = new EventEmitter<void>();

    @Output() lessonEventsBalanceSaveEvent = new EventEmitter<CallanCourseProgress>();

    lessonEventsBalanceForm: FormGroup;

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

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.lessonEventsBalanceForm);
                    console.log('unmapped:', unmapped);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                        console.log('common Form errors now', this.lessonEventsBalanceForm);
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
            this.lessonEventsBalanceForm.patchValue({'lessonEventsBalance': this.courseProgress.lessonEventsBalance});
    }

    private buildForm() {
        this.lessonEventsBalanceForm = this.fb.group({
            lessonEventsBalance: ['', Validators.required],
        });
    }

    private prepareCourseProgressSave() {
        const courseProgressSave = _.cloneDeep(this.courseProgress);
        const formModel = this.lessonEventsBalanceForm.value;
        courseProgressSave.lessonEventsBalance = formModel.lessonEventsBalance;
        return courseProgressSave;
    }


    handleCancel() {
        this.cancelEvent.next();
    }

    handleLessonEventsBalanceSave() {
        const courseProgressSave = this.prepareCourseProgressSave();
        this.lessonEventsBalanceSaveEvent.next(courseProgressSave);
    }

}
