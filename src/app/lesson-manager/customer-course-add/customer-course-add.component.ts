import {Component, EventEmitter, Input, Output, OnDestroy, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {CallanCourse} from '../../shared/models/course.model';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {takeUntil} from 'rxjs/operators';
import * as _ from 'lodash';
import {AppFormErrors} from '../../shared/models/form-errors.model';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {CallanCourseTeacherChoiceEnum} from '../../shared/enums/course.teacher-choice.enum';
import {CallanCourseCompetence} from '../../shared/models/course-competence.model';

@Component({
    selector: 'app-callan-customer-course-add',
    templateUrl: './customer-course-add.component.html',
    styleUrls: ['./customer-course-add.component.scss']
})
export class CallanCustomerCourseAddComponent implements OnInit, OnDestroy, OnChanges {

    @Input() allCourses: CallanCourse[];

    @Input() currentCustomerCourseProgresses: CallanCourseProgress[];

    @Input() courseProgress: CallanCourseProgress;

    @Input() formErrors$ =  new Subject<AppFormErrors>();

    @Input() courseCompetences: CallanCourseCompetence[];

    @Input() isSaving = false;

    @Output() courseProgressAddEvent = new EventEmitter<CallanCourseProgress>();

    @Output() courseSelectEvent = new EventEmitter<CallanCourse>();

    @Output() cancelEvent = new EventEmitter<void>();

    courseAddForm: FormGroup;

    courses: CallanCourse[];

    commonFormErrors = [];

    courseTeacherChoiceEnum: any;

    isCourseCompetenceSelected = true;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder
    ) {
        this.buildForm();
        this.courseTeacherChoiceEnum = CallanCourseTeacherChoiceEnum;
    }

    ngOnInit() {

        // this.subscribeOnCustomerCoursesAndAllCourses();

        this.subscribeOnFormErrors();
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('changes', changes);

        if(changes.allCourses !== undefined) {
            this.setCourses();
            this.setFormValues();
        }
    }

    handleCancel() {
        this.cancelEvent.next();
    }

    handleCourseProgressAdd() {
        const courseProgress = this.prepareCourseProgressAdd();
        this.courseProgressAddEvent.next(courseProgress);
    }

    handleCourseSelect(course: CallanCourse) {
        if (course.teacherChoice === CallanCourseTeacherChoiceEnum.MANUAL) {
            // to not perform an unnecessary queries
            this.courseSelectEvent.next(course);
            this.isCourseCompetenceSelected = false;
        } else {
            this.isCourseCompetenceSelected = true;
        }
    }

    handleSelectCourseCompetence(competence: CallanCourseCompetence) {
        this.courseProgress.primaryTeacher = competence.customer;
        this.isCourseCompetenceSelected = true;
    }

    toNumber(value: any): number {
        return Number(value);
    }

    private buildForm() {
        this.courseAddForm = this.fb.group({
            course: ['', Validators.required],
        });

        this.courseAddForm.get('course').valueChanges.subscribe(value => {
            this.handleCourseSelect(value);
        });

    }

    private setFormValues() {
        if (this.courses && this.courses.length > 0) {
            this.courseAddForm.patchValue({'course': this.courses[0]});
        }
    }

    private prepareCourseProgressAdd() {
        const addCourseProgress = _.cloneDeep(this.courseProgress);
        addCourseProgress.course = this.courseAddForm.value.course;

        console.log(addCourseProgress, 'prepared');

        // TODO: finish refactoring
        return addCourseProgress;
    }

    private subscribeOnFormErrors() {
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

    private setCourses() {
        if (this.allCourses.length && this.currentCustomerCourseProgresses) {
            this.courses = this.allCourses.filter(course => {
                for (const progress of this.currentCustomerCourseProgresses) {
                    if (progress.course.id === course.id) {
                        return false;
                    }
                }

                return true;
            });
        }
    }
}
