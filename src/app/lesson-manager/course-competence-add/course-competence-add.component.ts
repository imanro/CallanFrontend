import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CallanCourseCompetence} from '../../shared/models/course-competence.model';
import {CallanCourse} from '../../shared/models/course.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import * as _ from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {CallanFormHelper} from '../../shared/helpers/form-helper';
import {AppFormErrors} from '../../shared/models/form-errors.model';

@Component({
    selector: 'app-course-speciality-add',
    templateUrl: './course-competence-add.component.html',
    styleUrls: ['./course-competence-add.component.scss']
})
export class CallanCourseSpecialityAddComponent implements OnInit, OnDestroy {

    @Input() courseSpeciality: CallanCourseCompetence;

    @Input() allCourses: CallanCourse[];

    @Input() courseSpecialities: CallanCourseCompetence[];

    @Input() formErrors$ = new Subject<AppFormErrors>();

    @Output() courseSpecialityAddEvent = new EventEmitter<CallanCourseCompetence>();

    @Output() cancelEvent = new EventEmitter<void>();

    courseSpecialityAddForm: FormGroup;

    commonFormErrors = [];

    coursesList: CallanCourse[];

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private fb: FormBuilder
    ) {
        this.buildForm();
    }

    ngOnInit() {
        this.assignFormErrors();
        this.assignCoursesList();
        this.setFormValues();
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleCourseSpecialityAdd() {
        const courseSpeciality = this.prepareCourseSpecialityAdd();
        console.log('We\'ve prepared following values:', courseSpeciality);
        this.courseSpecialityAddEvent.next(courseSpeciality);
    }


    handleCancel() {
        this.cancelEvent.next();
    }

    private prepareCourseSpecialityAdd() {
        const addCourseSpeciality = _.cloneDeep(this.courseSpeciality);
        const formModel = this.courseSpecialityAddForm.value;

        addCourseSpeciality.course = formModel.course;
        return addCourseSpeciality;
    }

    private assignFormErrors() {
        this.formErrors$
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(formErrors => {

                if (formErrors) {
                    console.log('Errors received');

                    const unmapped = CallanFormHelper.bindErrors(formErrors, this.courseSpecialityAddForm);
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

    private assignCoursesList() {
        this.coursesList = this.allCourses.filter(course => {
            for (const speciality of this.courseSpecialities) {
                if (speciality.course.id === course.id) {
                    return false;
                }
            }

            return true;
        });
    }

    private buildForm() {
        this.courseSpecialityAddForm = this.fb.group({
            course: ['', Validators.required],
        });
    }

    private setFormValues() {
        if (this.coursesList && this.coursesList.length > 0) {
            this.courseSpecialityAddForm.patchValue({'course': this.coursesList[0]});
        }
    }

}
