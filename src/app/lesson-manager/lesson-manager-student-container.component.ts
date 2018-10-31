import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import {Location} from '@angular/common';
import {Subject} from 'rxjs/Subject';
import {ToastrService} from 'ngx-toastr';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {takeUntil} from 'rxjs/operators';

import {AppConfig} from '../app.config';
import {CallanCourse} from '../shared/models/course.model';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanCourseProgress} from '../shared/models/course-progress.model';
import {CallanLessonEvent} from '../shared/models/lesson-event.model';
import {CallanError} from '../shared/models/error.model';
import {CallanFormErrors} from '../shared/models/form-errors.model';

@Component({
    selector: 'app-callan-lesson-manager-container',
    templateUrl: './lesson-manager-student-container.component.html',
    styleUrls: ['./lesson-manager-student-container.component.scss']
})
export class CallanLessonManagerStudentContainerComponent implements OnInit, OnDestroy {

    allCourses$ = new BehaviorSubject<CallanCourse[]>([]);
    allCoursesSub$: Subscription; // CHECKME

    currentCustomer: CallanCustomer;
    currentCustomerCourseProgresses$ = new BehaviorSubject<CallanCourseProgress[]>([]);

    currentCourseProgress$ = new BehaviorSubject<CallanCourseProgress>(null);
    currentCourseProgress: CallanCourseProgress;

    // we need this to be a subject
    lessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);
    currentCourseLessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);

    currentLessonEvent: CallanLessonEvent;

    // Helper indicator
    isDetailsShown = false;
    isLessonEventDetailsShown = false;
    isCustomerCourseAddShown = false;
    isAddButtonShown = false;
    isSaving = false;

    formErrors$ = new BehaviorSubject<CallanFormErrors>(null);

    // checkme
    private isInitialRouteProcessed = false;

    // https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private appConfig: AppConfig,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private location: Location,
        private route: ActivatedRoute,
        private toastrService: ToastrService
    ) {
    }

    ngOnInit() {

        this.route.params
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(params => {

                    // if there is courseProgressId, we can take the student from there
                    if (params['courseProgressId'] !== undefined) {

                        observableCombineLatest(
                            this.customerService.getCurrentCustomer(),
                            this.lessonService.getCourseProgress(params['courseProgressId']))
                            .subscribe(results => {
                                const customer = results[0];
                                const courseProgress = results[1];

                                console.log('valuef', courseProgress, customer);

                                if (customer && customer.id === courseProgress.customer.id) {
                                    console.log('assigning');
                                    this.setCurrentCourseProgress(courseProgress);
                                    this.isInitialRouteProcessed = true;
                                }
                            });
                    } else {
                        // just unset course progress
                        this.setCurrentCourseProgress(null);
                        this.isInitialRouteProcessed = true;
                    }
                }
            );

        // for interaction with navbar
        this.lessonService.getIsLessonDetailsShown$().pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(value => {
            this.isLessonEventDetailsShown = value;
        });

        this.assignCurrentCustomer();

        // courses
        this.assignAllCourses();

        // course progresses change process
        this.currentCustomerCourseProgresses$
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(progresses => {
                if (progresses && progresses.length > 0) {
                    // assigning first progress as current
                    this.setCurrentCourseProgress(progresses[0]);
                }

                // CHECKME
                this.allCoursesSub$ = this.allCourses$
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(allCourses => {
                        if (progresses) {
                            console.log('change add button sh', allCourses.length, progresses.length);
                            this.isAddButtonShown = progresses.length < allCourses.length;
                        }
                    });
            });

        // choosen courseProgress
        this.assignCurrentCourseProgress();

    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    private assignCurrentCustomer() {
        this.customerService.getCurrentCustomer().subscribe(customer => {
            this.currentCustomer = customer;

            if (customer) {
                this.assignCourseProgresses(customer);
                this.assignLessonEvents(customer);
                this.assignCurrentLessonEvent(customer);
            }
        });
    }

    private assignCurrentCourseProgress() {
        this.currentCourseProgress$
            .pipe(
                takeUntil(this.unsubscribe)
            )
            .subscribe(courseProgress => {
                this.currentCourseProgress = courseProgress;
                this.assignCurrentCourseLessonEvents(courseProgress)
            });
    }

    private assignAllCourses() {
        this.lessonService.getAllCourses().subscribe(courses => {
            this.allCourses$.next(courses);
        });
    }

    private assignCourseProgresses(customer) {
        this.lessonService.getCourseProgresses(customer).subscribe(courseProgresses => {
            this.currentCustomerCourseProgresses$.next(courseProgresses);
        });
    }

    private assignCurrentLessonEvent(customer) {
        this.lessonService.getNearestStudentLessonEvent(customer).subscribe(lessonEvent => {
            this.currentLessonEvent = lessonEvent;
        });
    }

    private assignLessonEvents(customer) {
        this.lessonService.getLessonEventsByStudent(customer).subscribe(lessonEvents => {
            this.lessonEvents$.next(lessonEvents);
        });
    }

    private assignCurrentCourseLessonEvents(courseProgress) {
        if (courseProgress) {
            this.lessonService.getLessonEvents(courseProgress)
                .subscribe(lessonEvents => {
                    this.currentCourseLessonEvents$.next(lessonEvents);
                });
        }
    }

    private setCurrentCourseProgress(courseProgress: CallanCourseProgress) {
        if (this.isInitialRouteProcessed) {
            this.location.replaceState('/lessons/' + courseProgress.id);
            // put int observable
            this.currentCourseProgress$.next(courseProgress);
        }
    }

    private createFormErrors() {
        return new CallanFormErrors();
    }


    handleSelectCourseProgress(courseProgress: CallanCourseProgress) {
        this.setCurrentCourseProgress(courseProgress);
    }

    handleLessonEventCreate($event) {
        console.log('clicked');
        this.isDetailsShown = true;
    }

    handleLessonEventCreateCancel($event) {
        this.isDetailsShown = false;
    }

    handleCourseProgressAdd() {
        this.isCustomerCourseAddShown = true;
    }

    handleCustomerCourseAddCancel() {
        this.isCustomerCourseAddShown = false;
    }

    handleCustomerCourseAdd(course) {

        const progress = CallanLessonService.createCourseProgress();
        progress.customer = this.currentCustomer;
        progress.course = course;

        this.lessonService.saveCourseProgress(progress)
            .subscribe(courseProgress => {
                // re-read list
                console.log('re-read');
                this.assignCourseProgresses(this.currentCustomer);
                this.isCustomerCourseAddShown = false;
                this.toastrService.success('A new course has been added to your account', 'Success');

            }, err => {

                this.isSaving = false;

                if (err instanceof CallanError) {
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

    handleLessonEventCreateEvent(lessonEvent: CallanLessonEvent) {

        console.log('weve received', lessonEvent);
        // add some required info
        CallanLessonService.initLessonEvent(lessonEvent);
        console.log('weve created', lessonEvent);

        this.lessonService.saveLessonEvent(lessonEvent)
            .subscribe(() => {
                console.log('Lesson events updated');
               this.assignLessonEvents(this.currentCustomer);
                this.toastrService.success('You have successfully planed the lesson!', 'Success');
               this.isDetailsShown = false;
            }, err => {
                if (err instanceof CallanError) {
                    if (err.httpStatus === 401 || err.httpStatus === 403) {
                        throw err.error;
                    } else {
                        this.toastrService.warning('Something went wrong, sorry', 'Warning');
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
}
