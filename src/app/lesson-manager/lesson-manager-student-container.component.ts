import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Location} from '@angular/common';
import {Subject, timer as observableTimer} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {takeUntil} from 'rxjs/operators';

import {CallanCourse} from '../shared/models/course.model';
import {CalendarEvent,} from 'angular-calendar';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanCourseProgress} from '../shared/models/course-progress.model';
import {CallanLessonEvent} from '../shared/models/lesson-event.model';
import {AppError} from '../shared/models/error.model';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {CallanRoleNameEnum} from '../shared/enums/role.name.enum';
import {CallanScheduleService} from '../shared/services/schedule.service';
import * as moment from 'moment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppModalContentComponent} from '../shared-modules/modal-content/modal-content.component';
import {CallanLessonManagerStudentViewEnum} from '../shared/enums/lesson-manager-student.view.enum';

@Component({
    selector: 'app-callan-lesson-manager-container',
    templateUrl: './lesson-manager-student-container.component.html',
    styleUrls: ['./lesson-manager-student-container.component.scss']
})
export class CallanLessonManagerStudentContainerComponent implements OnInit, OnDestroy {

    allCourses$ = new BehaviorSubject<CallanCourse[]>([]);
    currentCustomer: CallanCustomer;
    authCustomer: CallanCustomer;

    courseProgresses$ = new BehaviorSubject<CallanCourseProgress[]>([]);
    currentCourseProgress$ = new BehaviorSubject<CallanCourseProgress>(null);
    currentCourseProgress: CallanCourseProgress;

    // we need this to be a subject
    lessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);
    currentCourseLessonEvents$ = new BehaviorSubject<CallanLessonEvent[]>([]);

    currentLessonEvent: CallanLessonEvent;

    currentDate: Date;
    datesEnabled: Date[];
    calendarEvents: CalendarEvent[];

    isTopUpLessonEventsBalanceButtonShown = false;

    // Helper indicator
    isLessonEventDetailsShown = false;

    isCustomerCourseAddButtonShown = false;
    isLessonEventsCreateButtonShown = true;

    view = CallanLessonManagerStudentViewEnum.DEFAULT;
    viewNameEnum: any;


    isSaving = false;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);
    refresh$ = new Subject<void>();

    // checkme
    private isInitialRouteProcessed = true;

    // https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private scheduleService: CallanScheduleService,
        private location: Location,
        private route: ActivatedRoute,
        private toastrService: ToastrService,
        private modalService: NgbModal
    ) {
        this.viewNameEnum = CallanLessonManagerStudentViewEnum;
    }

    ngOnInit() {

        this.route.params
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(params => {

                    this.isInitialRouteProcessed = false;

                    // if there is courseProgressId, we can take the student from there
                    if (params['courseProgressId'] !== undefined) {

                        observableCombineLatest(
                            this.customerService.getCurrentCustomer(),
                            this.lessonService.getCourseProgress(params['courseProgressId']))
                            .subscribe(results => {
                                const customer = results[0];
                                const courseProgress = results[1];

                                if (!customer) {
                                    this.customerService.getAuthCustomer().subscribe(authCustomer => {
                                        if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.ADMIN)) {
                                            // try to set course progress and customer from it
                                            console.log('Cause current auth customer is admin, we can set current ' +
                                                'customer from courseprogress');
                                            this.setCurrentCourseProgress(courseProgress);
                                            this.customerService.setCurrentCustomer(courseProgress.customer);
                                        }

                                        this.isInitialRouteProcessed = true;
                                    });
                                } else {
                                    if (customer && customer.id === courseProgress.customer.id) {
                                        this.setCurrentCourseProgress(courseProgress);
                                    }

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
            takeUntil(this.unsubscribe$)
        ).subscribe(value => {
            this.isLessonEventDetailsShown = value;
        });

        this.lessonService.getIsLessonEventsUpdated$().pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            console.log('Lesson events updated, fetching the new info');
            if (this.currentCustomer) {
                this.assignLessonEvents(this.currentCustomer);
                this.assignCurrentLessonEvent(this.currentCustomer);
            }

            if (this.currentCourseProgress) {
                this.assignCurrentCourseLessonEvents(this.currentCourseProgress);
            }
        });

        this.assignCurrentCustomer();
        this.assignAuthCustomer();

        // courses
        this.assignAllCourses();

        // course progresses change process
        this.subscribeOnCourseProgresses();

        // chosen courseProgress
        this.subscribeOnCurrentCourseProgress();

        this.subscribeOnLessonEvents();
        this.setCurrentDate(new Date());
        this.assignDatesEnabled(this.currentDate);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleSelectCourseProgress(courseProgress: CallanCourseProgress) {
        this.setCurrentCourseProgress(courseProgress);
    }

    handleLessonEventCreate() {
        // reset date first
        this.setCurrentDate(new Date());
        this.view = CallanLessonManagerStudentViewEnum.CALENDAR;
    }

    handleLessonEventCreateCancel() {
        this.view = CallanLessonManagerStudentViewEnum.DEFAULT;
    }

    handleLessonEventsBalanceDetailsCancel() {
        this.view = CallanLessonManagerStudentViewEnum.DEFAULT;
    }

    handleCustomerCourseAddShow() {
        this.view = CallanLessonManagerStudentViewEnum.CUSTOMER_COURSE_ADD;
    }

    handleCustomerCourseAddCancel() {
        this.view = CallanLessonManagerStudentViewEnum.DEFAULT;
    }

    handleLessonEventsBalanceShown() {
        this.view = CallanLessonManagerStudentViewEnum.BALANCE_DETAILS;
    }

    handleCalendarShowPreviousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.assignDatesEnabled(this.currentDate);
    }

    handleCalendarShowNextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.assignDatesEnabled(this.currentDate);
    }

    handleCalendarShowCurrentWeek() {
        this.setCurrentDate(new Date());
        this.assignDatesEnabled(this.currentDate);
    }

    handleCalendarHourSegmentClick($event) {
        const hourSegment: { date: Date, isSegmentEnabled: boolean } = $event;

        if (hourSegment.isSegmentEnabled) {
            const modalRef = this.modalService.open(AppModalContentComponent, {
                centered: true,
                backdrop: true,
                size: 'lg'
            });

            modalRef.componentInstance.title = 'Confirm planning lesson';
            modalRef.componentInstance.body = '<p>Next lesson will start at:</p> <p><strong>' +
                moment($event.date).format('D.MM.YYYY h:mm A') + '</strong></p>';

            modalRef.result.then((userResponse) => {

                if (userResponse) {
                    const lessonEvent = this.createLessonEvent(hourSegment.date);
                    this.lessonEventSave(lessonEvent);
                }
            }, () => {
                // just do nothing
            });
        } else {
            console.warn('This segement isnt enabled, unable to create event');
        }
    }

    handleCalendarLessonEventClick($event) {
        const event: {event: CalendarEvent} = $event;

        const modalRef = this.modalService.open(AppModalContentComponent, {
            centered: true,
            backdrop: true,
            size: 'lg'
        });


        modalRef.componentInstance.title = $event.event.title;
        modalRef.componentInstance.body = '<p>Lesson start:</p> <p>' + moment($event.event.start).format('D.MM.YYYY h:mm A') + '</p>';
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
                this.view = CallanLessonManagerStudentViewEnum.DEFAULT;
                this.toastrService.success('A new course has been added to your account', 'Success');

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


    handleLessonEventsBalanceSave(courseProgress: CallanCourseProgress) {
        // check for auth customer rights
        this.customerService.getAuthCustomer().subscribe(authCustomer => {
           if (CallanCustomerService.hasCustomerRole(authCustomer, CallanRoleNameEnum.ADMIN)) {
               console.log('Currently auth customer has rights for this action!');
               console.log('Saving', courseProgress);

               this.lessonService.saveCourseProgress(courseProgress)
                   .subscribe(() => {
                       // re-read list
                       console.log('re-read');
                       this.assignCourseProgresses(this.currentCustomer);
                       this.view = CallanLessonManagerStudentViewEnum.DEFAULT;
                       this.toastrService.success('New lesson balance saved', 'Success');

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
        });
    }

    private assignDatesEnabled(date: Date) {

        const range = CallanScheduleService.getWeekDatesRangeForDate(date);

        // we need to getHoursAvailable also includes already booked times
        this.scheduleService.getHoursAvailable(range[0], range[1], null, true).subscribe(dates => {
            this.datesEnabled = dates;

            observableTimer(100).subscribe(() => {
                this.refresh$.next();
            });
        });
    }

    private setCurrentDate(date: Date) {
        this.currentDate = date;
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private setCurrentCourseProgress(courseProgress: CallanCourseProgress) {

        if (this.isInitialRouteProcessed) {
            this.location.replaceState('/lessons/' + courseProgress.id);
        }

        // put int observable
        this.currentCourseProgress$.next(courseProgress);
    }

    private assignAuthCustomer() {
        this.customerService.getAuthCustomer()
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(customer => {
            this.authCustomer = customer;

            // special logic for Admin...
            if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {
                this.isTopUpLessonEventsBalanceButtonShown = true;
            }
        });
    }

    private assignCurrentCustomer() {
        this.customerService.getCurrentCustomer()
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(customer => {
            this.currentCustomer = customer;

            if (customer) {
                this.assignCourseProgresses(customer);
                this.assignLessonEvents(customer);
                this.assignCurrentLessonEvent(customer);
            }
        });
    }


    private assignAllCourses() {
        this.lessonService.getAllCourses()
            .subscribe(courses => {
            this.allCourses$.next(courses);
        });
    }

    private assignCourseProgresses(customer) {
        this.lessonService.getCourseProgresses(customer).subscribe(courseProgresses => {
            this.courseProgresses$.next(courseProgresses);
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

    private subscribeOnCurrentCourseProgress() {
        this.currentCourseProgress$
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(courseProgress => {
                this.currentCourseProgress = courseProgress;

                if (courseProgress) {
                    if (this.currentCourseProgress.lessonEventsBalance > 0) {
                        this.isLessonEventsCreateButtonShown = true;
                    } else {
                        this.isLessonEventsCreateButtonShown = false;
                    }

                    this.assignCurrentCourseLessonEvents(courseProgress);
                }
            });
    }

    private subscribeOnLessonEvents() {
        this.lessonEvents$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(events => {

            this.calendarEvents = [];

            if (events) {
                for (const lessonEvent of events) {
                    this.calendarEvents.push(CallanLessonService.convertLessonEventToCalendarEvent(lessonEvent));
                }
            }
        });
    }

    private subscribeOnCourseProgresses() {
        this.courseProgresses$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(progresses => {

                if (this.currentCourseProgress) {

                    // re-read current course progress
                    this.lessonService.getCourseProgress(this.currentCourseProgress.id).subscribe(progress => {
                        this.setCurrentCourseProgress(progress);
                    });

                } else {
                    if (progresses && progresses.length > 0) {
                        // assigning first progress as current
                        this.setCurrentCourseProgress(progresses[0]);
                    }
                }

                // CHECKME
                this.allCourses$
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe(allCourses => {
                        if (progresses) {
                            console.log('change add button sh', allCourses.length, progresses.length);
                            this.isCustomerCourseAddButtonShown = progresses.length < allCourses.length;
                        }
                    });
            });
    }

    private lessonEventSave(lessonEvent: CallanLessonEvent) {

        // add some required info
        CallanLessonService.initLessonEvent(lessonEvent);
        console.log('weve created', lessonEvent);

        this.lessonService.saveLessonEvent(lessonEvent)
            .subscribe(() => {
                console.log('Lesson events updated');
                this.toastrService.success('You have successfully planed the lesson!', 'Success');
                // re-read
                this.assignCourseProgresses(this.currentCustomer);
                this.view = CallanLessonManagerStudentViewEnum.DEFAULT;

            }, err => {
                if (err instanceof AppError) {
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

    private createLessonEvent(date: Date) {
        console.log('Time of lesson:', date);
        const lessonEvent = CallanLessonService.createLessonEvent();
        lessonEvent.courseProgress = this.currentCourseProgress;
        lessonEvent.student = this.currentCustomer;
        lessonEvent.startTime = date;
        return lessonEvent;
    }



}
