import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Subject, timer as observableTimer, interval as observableInterval, Observable} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {takeUntil} from 'rxjs/operators';

import {CallanCourse} from '../shared/models/course.model';
import {CalendarEvent} from 'angular-calendar';
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
import {AppModalContentFeedbackComponent} from '../shared-modules/modal-content-feedback/modal-content-feedback.component';
import {CallanLessonManagerStudentViewEnum} from '../shared/enums/lesson-manager-student.view.enum';
import {CallanLessonEventStateEnum} from '../shared/enums/lesson-event.state.enum';
import {CallanLessonEventViewEnum} from '../shared/enums/lesson-event.view.enum';
import {AppConfig} from '../app.config';
import {CallanCourseCompetence} from '../shared/models/course-competence.model';

@Component({
    selector: 'app-callan-lesson-manager-container',
    templateUrl: './lesson-manager-student-container.component.html',
    styleUrls: ['./lesson-manager-student-container.component.scss']
})
export class CallanLessonManagerStudentContainerComponent implements OnInit, OnDestroy {

    currentCustomer: CallanCustomer;
    authCustomer: CallanCustomer;

    //
    courseProgresses: CallanCourseProgress[];
    allCourses: CallanCourse[];

    courseCompetences: CallanCourseCompetence[];
    currentCourseProgress: CallanCourseProgress;

    completedLessonEvents: {[courseProgressId: number]: number} = {};

    // we need this to be a subject
    lessonEvents: CallanLessonEvent[];

    currentLessonEvent: CallanLessonEvent;

    currentDate: Date;
    datesEnabled: Date[];
    calendarEvents: CalendarEvent[];

    isConfirmLessonButtonShown = false;
    isTopUpLessonEventsBalanceButtonShown = false;

    // Helper indicator
    isLessonEventShown = false;
    isCustomerCourseAddButtonShown = false;
    isLessonEventsCreateButtonShown = true;

    view = CallanLessonManagerStudentViewEnum.DASHBOARD;
    viewNameEnum: any;
    lessonEventViewNameEnum: any;

    isSaving = false;

    formErrors$ = new Subject<AppFormErrors>();
    calendarRefresh$ = new Subject<void>();
    lessonEventsListRefresh$ = new Subject<void>();

    scheduleMinuteStep: number;

    // checkme
    private isInitialRouteProcessed = true;

    // https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private appConfig: AppConfig,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private scheduleService: CallanScheduleService,
        private location: Location,
        private route: ActivatedRoute,
        private toastrService: ToastrService,
        private modalService: NgbModal
    ) {
        this.scheduleMinuteStep = appConfig.scheduleMinuteStep;
        this.viewNameEnum = CallanLessonManagerStudentViewEnum;
        this.lessonEventViewNameEnum = CallanLessonEventViewEnum;
    }

    ngOnInit() {
        this.processRouteParams();

        // for interaction with navbar
        this.subscribeOnLessonEventShown();

        this.subscribeOnIsLessonEventsUpdated();
        this.subscribeOnLessonEventsUpdateInterval();
        this.subscribeOnCurrentLessonEventUpdateInterval();

        this.assignCurrentCustomer();
        this.assignAuthCustomer();

        // courses
        this.assignAllCourses();

        // course progresses change process
        // this.subscribeOnCourseProgresses();

        // current lessonEvent subscription
        this.subscribeOnCurrentLessonEvent();
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
        this.assignDatesEnabled(this.currentDate, this.currentCourseProgress);

        this.view = CallanLessonManagerStudentViewEnum.CALENDAR;
    }

    handleLessonEventCreateCancel() {
        this.view = CallanLessonManagerStudentViewEnum.DASHBOARD;
    }

    handleLessonEventsBalanceDetailsCancel() {
        this.view = CallanLessonManagerStudentViewEnum.DASHBOARD;
    }

    handleCustomerCourseAddShow() {
        this.setCurrentCourseProgress(this.createCourseProgress());
        this.view = CallanLessonManagerStudentViewEnum.CUSTOMER_COURSE_ADD;
    }

    handleCustomerCourseAddCancel() {
        if (this.courseProgresses && this.courseProgresses.length) {
            this.setCurrentCourseProgress(this.courseProgresses[0]);
        }
        this.view = CallanLessonManagerStudentViewEnum.DASHBOARD;
    }

    handleLessonEventsBalanceShown() {
        this.view = CallanLessonManagerStudentViewEnum.BALANCE_DETAILS;
    }

    handleCalendarShowPreviousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.assignDatesEnabled(this.currentDate, this.currentCourseProgress);
    }

    handleCalendarShowNextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.assignDatesEnabled(this.currentDate, this.currentCourseProgress);
    }

    handleCalendarShowCurrentWeek() {
        this.setCurrentDate(new Date());
        this.assignDatesEnabled(this.currentDate, this.currentCourseProgress);
    }

    handleCalendarHourSegmentClick($event) {
        const hourSegment: { date: Date, isSegmentEnabled: boolean } = $event;

        if (hourSegment.isSegmentEnabled) {
            const modalRef = this.modalService.open(AppModalContentComponent, {
                centered: true,
                backdrop: true,
                size: 'lg'
            });

            const lessonEvent = this.createLessonEvent(hourSegment.date);

            // check lesson duration against of dates enabled
            // take start time, increment by segment and check that this date is available

            if (!CallanScheduleService.checkLessonDurationAgainstDatesEnabled(lessonEvent, this.datesEnabled, this.scheduleMinuteStep)) {
                modalRef.componentInstance.buttons.cancel = false;
                modalRef.componentInstance.title = 'This time isn\'t available';
                modalRef.componentInstance.body = `Sorry, the Lesson duration (${lessonEvent.duration} min.) would exceed on not available time. ` +
                `Please, choose another time so that the whole lesson duration would fit the available time range`;
            } else {
                modalRef.componentInstance.title = 'Confirm planning lesson';
                modalRef.componentInstance.body = '<p>The next Lesson will start at:<br/><strong>' +
                    moment($event.date).format('D.MM.YYYY h:mm A') + '</strong></p>';
                modalRef.componentInstance.body += `<p>The Lesson duration is: <strong>${lessonEvent.duration}</strong> minutes`;

                modalRef.result.then((userResponse) => {

                    if (userResponse) {
                        this.lessonEventSave(lessonEvent);
                    }
                }, () => {
                    // just do nothing
                });
            }
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
        modalRef.componentInstance.body = '<p>Lesson start:<br/>' + moment($event.event.start).format('D.MM.YYYY h:mm A') + '</p>';
    }


    handleCourseProgressAdd(courseProgress: CallanCourseProgress) {

        courseProgress.customer = this.currentCustomer;

        this.lessonService.saveCourseProgress(courseProgress)
            .subscribe(createdProgress => {
                // re-read list
                console.log('re-read');
                this.assignCourseProgresses(this.currentCustomer).subscribe(() => {
                    this.setCurrentCourseProgress(createdProgress);
                });

                this.view = CallanLessonManagerStudentViewEnum.DASHBOARD;
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
                       this.assignCourseProgresses(this.currentCustomer).subscribe(() => {});

                       this.view = CallanLessonManagerStudentViewEnum.DASHBOARD;
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

    handleSetCurrentLessonEvent(lessonEvent) {

        if (this.currentLessonEvent) {

            if (this.currentLessonEvent.id === lessonEvent.id ) {
                this.toggleLessonEventShown();
            } else {
                this.setIsLessonEventShown(true);
            }
        } else {
            this.setIsLessonEventShown(true);
        }

        this.setCurrentLessonEvent(lessonEvent);
    }

    handleCancelLessonEvent(lessonEvent) {
        // check state
        console.log('to cancel');

        const modalRef = this.modalService.open(AppModalContentFeedbackComponent, {
            centered: true,
            backdrop: true,
            size: 'lg'
        });

        console.log('LE:', lessonEvent);

        modalRef.componentInstance.title = 'Confirm cancel lesson';
        modalRef.componentInstance.message = '<p>Do you confirm the lesson cancelation? Please, write a few fords about the reason</p>';

        modalRef.result.then((userResponse) => {

            if (userResponse) {
                if (userResponse.result) {
                    // cancel (update status) and then reload lesson evnets
                    // TODO: check is this action available for this lesson currently
                    const prevState = lessonEvent.state;

                    this.lessonService.changeLessonEventState(lessonEvent, CallanLessonEventStateEnum.CANCELED, userResponse.feedback).subscribe(() => {
                        console.log('Done');
                        this.toastrService.success('The lesson was canceled, you\'ve been refunded', 'Success');
                        // FIXME - to subscription, perhaps
                        this.assignCourseProgresses(this.currentCustomer).subscribe(() => {});
                    }, err => {

                        if (err instanceof AppError) {
                            let message;

                            if (err.httpStatus === 400) {
                                message = err.message;
                            } else {
                                message = 'Something went wrong';
                            }

                            console.error(err, 'occurred');
                            this.toastrService.error(message, 'Error');
                        }

                        lessonEvent.state = prevState;

                    });
                } else {
                    console.log('No cancelation , continuing to work');
                }
            }
        }, () => {
            // just do nothing
        });
    }

    handleLessonEventConfirm(lessonEvent) {
        this.lessonService.changeLessonEventState(lessonEvent, CallanLessonEventStateEnum.CONFIRMED).subscribe(() => {
            console.log('Done');
        });
    }

    handleCourseSelect(course) {
        this.lessonService.getCourseCompetencesByCourse(course)
            .subscribe(competences => {
                this.courseCompetences = competences;
            })
    }

    private processRouteParams() {
        console.log(this.route.snapshot.toString(), 'route');
        this.route.params
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(params => {

                    this.isInitialRouteProcessed = false;

                    console.log(params);
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
                                            console.log('Because current auth customer is admin, we can set current ' +
                                                'customer from courseprogress');
                                            this.setCurrentCourseProgress(courseProgress);
                                            this.customerService.setCurrentCustomer(courseProgress.customer);
                                        }

                                        this.isInitialRouteProcessed = true;
                                    });
                                } else {
                                    if (customer && customer.id === courseProgress.customer.id) {
                                        console.log('try to set');
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
    }

    private assignDatesEnabled(date: Date, courseProgress: CallanCourseProgress) {

        const range = CallanScheduleService.getWeekDatesRangeForDate(date);

        // we need to getHoursAvailable also includes already booked times
        this.scheduleService.getDatesAvailable(range[0], range[1], courseProgress, null, true).subscribe(dates => {
            this.datesEnabled = dates;

            observableTimer(100).subscribe(() => {
                this.calendarRefresh$.next();
            });
        });
    }

    private setCurrentDate(date: Date) {
        this.currentDate = date;
    }

    private setCurrentLessonEvent(lessonEvent) {
        this.lessonService.setCurrentLessonEvent(lessonEvent);
    }

    private setIsLessonEventShown(value) {
        this.lessonService.setIsLessonEventShown(value);
    }

    private toggleLessonEventShown() {
        this.lessonService.toggleIsLessonEventShown();
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private setCurrentCourseProgress(courseProgress: CallanCourseProgress) {

        if (this.isInitialRouteProcessed && courseProgress && !courseProgress.isNew()) {
            this.location.replaceState('/lessons/student/' + courseProgress.id);
        }

        this.currentCourseProgress = courseProgress;

        if (this.currentCourseProgress) {
            if (this.currentCourseProgress.lessonEventsBalance > 0) {
                this.isLessonEventsCreateButtonShown = true;
            } else {
                this.isLessonEventsCreateButtonShown = false;
            }
        }

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
                this.isConfirmLessonButtonShown = true;
            } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.STUDENT)) {
                this.isConfirmLessonButtonShown = true;
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
                this.assignCourseProgresses(customer).subscribe(() => {
                    this.assignLessonEvents(customer).subscribe(() => {})
                });
            }
        });
    }

    private assignAllCourses() {
        this.lessonService.getAllCourses()
            .subscribe(courses => {
                this.allCourses = courses;
                this.setIsCustomerCourseAddButtonShown();
        });
    }

    private assignCourseProgresses(customer) {
        return new Observable<boolean>(observer => {
            if (customer) {
                this.lessonService.getCourseProgresses(customer).subscribe(courseProgresses => {

                    for (const progress of courseProgresses) {
                        this.completedLessonEvents[progress.id] = 0;
                    }

                    this.courseProgresses = courseProgresses;

                    if (!this.currentCourseProgress) {
                        if (courseProgresses.length > 0) {
                            // set 0 as.DASHBOARD
                            this.setCurrentCourseProgress(courseProgresses[0]);
                        }
                    } else {
                        // updating current
                        for (const progress of courseProgresses) {
                            if (progress.id === this.currentCourseProgress.id) {
                                this.setCurrentCourseProgress(progress);
                            }
                        }
                    }

                    this.setIsCustomerCourseAddButtonShown();
                    observer.next(true);
                });
            } else {
                observer.next(true);
            }
        });
    }

    // FIXME
    private assignLessonEvents(customer) {
        return new Observable<boolean>(observer => {
            if (customer) {
                this.lessonService.getLessonEventsByStudent(customer).subscribe(lessonEvents => {
                    this.lessonEvents = lessonEvents;

                    if (this.courseProgresses) {
                        for (const progress of this.courseProgresses) {
                            // FIXME: update in favour of usual variables, not subjects
                            this.completedLessonEvents[progress.id] = CallanLessonService.countCompletedLessonEvents(lessonEvents, progress.id);
                        }
                    }


                    observableTimer(50).subscribe(() => {
                        this.lessonEventsListRefresh$.next();
                    });

                    this.setCalendarEvents(lessonEvents);
                    observer.next(true);
                });
            } else {
                observer.next(true);
            }
        });
    }

    private subscribeOnCurrentLessonEvent() {
        this.lessonService.getCurrentLessonEvent$().subscribe(lessonEvent => {
            console.log('Current lesson event is changed');
            this.currentLessonEvent = lessonEvent;
        })
    }


    private setCalendarEvents(lessonEvents: CallanLessonEvent[]) {
        this.calendarEvents = [];

        for (const lessonEvent of lessonEvents) {

            // show in the calendar only this two types of lessons
            if (
                lessonEvent.state === CallanLessonEventStateEnum.PLANNED ||
                lessonEvent.state === CallanLessonEventStateEnum.STARTED

            ) {
                this.calendarEvents.push(CallanLessonService.convertLessonEventToCalendarEvent(lessonEvent));
            }
        }

        this.calendarRefresh$.next();
    }

    private setIsCustomerCourseAddButtonShown() {
        if (this.allCourses && this.courseProgresses) {
            this.isCustomerCourseAddButtonShown = this.courseProgresses.length < this.allCourses.length;
        }
    }

    private subscribeOnLessonEventShown() {
        this.lessonService.getIsLessonEventShown$().pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(value => {
            this.isLessonEventShown = value;
        });
    }

    private subscribeOnIsLessonEventsUpdated() {
        this.lessonService.getIsLessonEventsUpdated$().pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {

            if (this.currentLessonEvent ) {
                console.log('This case');
            }

            console.log('Lesson events updated, fetching the new info');
            if (this.currentCustomer) {
                this.assignLessonEvents(this.currentCustomer).subscribe(() => {

                });
            }
        });
    }

    private subscribeOnLessonEventsUpdateInterval() {
        observableInterval(this.appConfig.lessonEventsUpdateIntervalMs).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            console.log('The lesson Events Should be updated');
            this.assignLessonEvents(this.currentCustomer);
        });
    }

    private subscribeOnCurrentLessonEventUpdateInterval() {
        observableInterval(this.appConfig.lessonEventsUpdateIntervalMs).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            if (this.currentLessonEvent) {
                console.log('The current lesson event should be updated');

                this.lessonService.getLessonEvent(this.currentLessonEvent.id)
                    .subscribe(lessonEvent => {
                        console.log('Updated!!');
                       this.lessonService.setCurrentLessonEvent(lessonEvent);
                    });
            }
        });
    }

    private lessonEventSave(lessonEvent: CallanLessonEvent) {

        // add some required info
        console.log('weve created', lessonEvent);

        this.lessonService.saveLessonEvent(lessonEvent)
            .subscribe(() => {
                console.log('Lesson events updated');
                this.toastrService.success('You have successfully planed the lesson!', 'Success');
                // re-read
                // FIXME - to subscription, perhaps
                this.assignCourseProgresses(this.currentCustomer).subscribe(() => {
                    this.assignLessonEvents(this.currentCustomer).subscribe(() => {})
                });
                this.view = CallanLessonManagerStudentViewEnum.DASHBOARD;

            }, err => {
                if (err instanceof AppError) {
                    if (err.httpStatus === 401 || err.httpStatus === 403) {
                        throw err.error;
                    } else {

                        let message;

                        if (err.httpStatus === 400) {
                            message = err.message;
                        } else {
                            message = 'Something went wrong, sorry';
                        }

                        console.error(err, 'occurred');
                        this.toastrService.warning(message, 'Warning');
                    }

                } else {
                    throw err;
                }
            });
    }

    private createLessonEvent(date: Date) {
        console.log('Time of lesson:', date);
        const lessonEvent = CallanLessonService.createLessonEvent();
        CallanLessonService.initLessonEvent(lessonEvent);
        lessonEvent.courseProgress = this.currentCourseProgress;
        lessonEvent.student = this.currentCustomer;
        lessonEvent.startTime = date;
        return lessonEvent;
    }

    private createCourseProgress(): CallanCourseProgress {
        return CallanLessonService.createCourseProgress();
    }

}
