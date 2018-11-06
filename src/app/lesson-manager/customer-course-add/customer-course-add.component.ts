import {Component, EventEmitter, Input, Output, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CallanCourse} from '../../shared/models/course.model';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {takeUntil} from 'rxjs/operators';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanFormHelper} from '../../shared/helpers/form-helper';

@Component({
    selector: 'app-callan-customer-course-add',
    templateUrl: './customer-course-add.component.html',
    styleUrls: ['./customer-course-add.component.scss']
})
export class CallanCustomerCourseAddComponent implements OnInit, OnDestroy {

    @Input() allCourses$: Observable<CallanCourse[]>;
    @Input() currentCustomerCourseProgresses$: BehaviorSubject<CallanCourseProgress[]>;
    @Input() formErrors$ =  new BehaviorSubject<AppFormErrors>(null);
    @Input() isSaving = false;

    @Output() courseAddEvent = new EventEmitter<CallanCourse>();
    @Output() cancelEvent = new EventEmitter<void>();

    courseAddForm: FormGroup;
    courses: CallanCourse[];
    commonFormErrors = [];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder
    ) {
        this.buildForm();
    }

    ngOnInit() {

        observableCombineLatest(
            this.allCourses$,
            this.currentCustomerCourseProgresses$
        )
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(results => {
                this.courses = results[0].filter(course => {
                    for (const progress of results[1]) {
                        if (progress.course.id === course.id) {
                            return false;
                        }
                    }

                    return true;
                });

                this.setFormValues();
                }
            );

        this.formErrors$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(formErrors => {

                if (formErrors) {
                    console.log('Errors received');

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.courseAddForm);
                    console.log('unmapped:', unmapped);

                    if (unmapped.length > 0) {
                        this.commonFormErrors = [];
                        this.commonFormErrors = this.commonFormErrors.concat(unmapped);
                        console.log('common Form errors now', this.commonFormErrors);
                    }
                }
            });

        this.commonFormErrors = [];
    }

    private buildForm() {
        this.courseAddForm = this.fb.group({
            course: ['', Validators.required],
        });
    }

    private setFormValues() {
        if (this.courses && this.courses.length > 0) {
            this.courseAddForm.patchValue({'course': this.courses[0]});
        }
    }

    private prepareCourseAdd() {
        return this.courseAddForm.value.course;
    }

    handleCancel() {
        this.cancelEvent.next();
    }

    handleCourseAdd() {
        const course = this.prepareCourseAdd();
        this.courseAddEvent.next(course);
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

}
