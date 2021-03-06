import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval as observableInterval, Observable, Subject, timer as observableTimer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AppError} from '../shared/models/error.model';
import {AppFormErrors} from '../shared/models/form-errors.model';

import {CallanLessonEvent} from '../shared/models/lesson-event.model';
import {CallanLessonManagerTeacherViewEnum} from '../shared/enums/lesson-manager-teacher.view.enum';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanScheduleService} from '../shared/services/schedule.service';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanLessonEventViewEnum} from '../shared/enums/lesson-event.view.enum';
import {CallanCourseCompetence} from '../shared/models/course-competence.model';
import {AppConfig} from '../app.config';
import {AppModalContentComponent} from '../shared-modules/modal-content/modal-content.component';
import {AppModalContentFeedbackComponent} from '../shared-modules/modal-content-feedback/modal-content-feedback.component';
import {CallanLessonEventStateEnum} from '../shared/enums/lesson-event.state.enum';
import {CallanRoleNameEnum} from '../shared/enums/role.name.enum';
import {CallanCourse} from '../shared/models/course.model';
import {CalendarEvent} from 'angular-calendar';
import {CallanGeneralEvent} from '../shared/models/general-event.model';
import {AppDataFilter} from '../shared/models/data-filter.model';

@Component({
    selector: 'app-callan-lesson-manager-teacher-container',
    templateUrl: './lesson-manager-teacher-container.component.html',
    styleUrls: ['./lesson-manager-teacher-container.component.scss']
})
export class CallanLessonManagerTeacherContainerComponent implements OnInit, OnDestroy {

    view = CallanLessonManagerTeacherViewEnum.DASHBOARD;

    viewNameEnum: any;

    tabs: {[id: string]: string} = {};

    tabSelected: string;

    authCustomer: CallanCustomer;

    currentCustomer: CallanCustomer;

    currentLessonEvent: CallanLessonEvent;

    currentCourseCompetence: CallanCourseCompetence;

    currentDate: Date;

    datesEnabled: Date[];

    allCourses: CallanCourse[];

    courseSpecialities: CallanCourseCompetence[];

    lessonEvents: CallanLessonEvent[];

    generalEvents: CallanGeneralEvent[];

    calendarEvents: CalendarEvent[];

    isLessonEventShown = false;

    isAddCourseSpecialityButtonShown = false;

    isCourseSpecialityListControlsShown = false;

    lessonEventViewNameEnum: any;

    scheduleMinuteStep: number;

    listRowsLimit: number;

    formErrors$ = new Subject<AppFormErrors>();

    calendarRefresh$ = new Subject<void>();

    isSaving = false;

    lessonEventsFilterByStudentValue: CallanCustomer;

    studentList$ = new Subject<CallanCustomer[]>();

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private appConfig: AppConfig,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private scheduleService: CallanScheduleService,
        private modalService: NgbModal,
        private toastrService: ToastrService,
    ) {
        this.viewNameEnum = CallanLessonManagerTeacherViewEnum;
        this.lessonEventViewNameEnum = CallanLessonEventViewEnum;
        this.scheduleMinuteStep = appConfig.scheduleMinuteStep;
        this.listRowsLimit = this.appConfig.listRowsLimit;

        this.buildTabs();
    }

    ngOnInit() {
        this.subscribeOnLessonEventShown();
        this.subscribeOnCurrentLessonEvent();

        this.subscribeOnIsLessonEventsUpdated();
        this.subscribeOnLessonEventsUpdateInterval();
        this.subscribeOnCurrentLessonEventUpdateInterval();

        this.assignAuthCustomer();
        this.assignAllCourses();
        this.assignCurrentCustomer().subscribe(() => {
            this.setCurrentDate(new Date());
            this.assignDatesEnabled(this.currentDate, this.currentCustomer);
            this.assignGeneralEvents(this.currentDate, this.currentCustomer);
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleTabSelected(id: CallanLessonManagerTeacherViewEnum) {
        this.setView(id);
    }

    setView(id: CallanLessonManagerTeacherViewEnum) {
        console.log('selected tab', id);
        this.view = id;

        if(this.tabs[id] !== undefined) {
            this.tabSelected = id;
        }
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

        modalRef.componentInstance.title = 'Confirm cancel lesson';
        modalRef.componentInstance.message = '<p>Do you confirm the student\'s lesson cancelation? Please, write a few fords about the reason</p>';

        modalRef.result.then((userResponse) => {

            if (userResponse) {
                if (userResponse.result) {
                    // cancel (update status) and then reload lesson evnets
                    // TODO: check is this action available for this lesson currently
                    const prevState = lessonEvent.state;

                    this.lessonService.changeLessonEventState(lessonEvent, CallanLessonEventStateEnum.CANCELED, userResponse.feedback).subscribe(() => {
                        console.log('Done');
                        this.toastrService.success('The lesson was canceled, the student has been refunded', 'Success');
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

    handleCourseSpecialityAddShow() {
        this.currentCourseCompetence = this.createCourseCompetence();
        this.view = CallanLessonManagerTeacherViewEnum.COURSE_SPECIALITY_DETAILS;
    }

    handleCourseSpecialityAddCancel() {
        this.view = CallanLessonManagerTeacherViewEnum.DASHBOARD;
    }

    handleCourseSpecialityAdd(courseSpeciality) {

        this.lessonService.saveCourseCompetence(courseSpeciality)
            .subscribe(() => {
                // re-read list
                console.log('re-read');
                this.assignCourseSpecialities(this.currentCustomer);
                this.view = CallanLessonManagerTeacherViewEnum.DASHBOARD;
                this.toastrService.success('The new speciality has been added to teacher', 'Success');

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

    handleCourseSpecialityDelete(courseSpeciality) {
        const modalRef = this.modalService.open(AppModalContentComponent, {
            centered: true,
            backdrop: true,
            size: 'lg'
        });

        modalRef.componentInstance.title = 'Confirm speciality remove';
        modalRef.componentInstance.body = '<p>Are you sure you want to delete this speciality from customer\'s account?</p>';

        modalRef.result.then((userResponse) => {

            if (userResponse) {
                this.lessonService.deleteCourseCompetence(courseSpeciality)
                    .subscribe(result => {
                        if (result) {
                            this.toastrService.success('The speciality has been successfully deleted from customer\'s account', 'Success');
                            this.assignCourseSpecialities(this.currentCustomer);
                        } else {
                            this.toastrService.warning('Some error occurred while delete speciality', 'Warning');
                        }
                    }, err => {
                        console.error(err);
                        this.toastrService.warning('Some error occurred while delete speciality', 'Warning');
                    });
            }
        }, () => {
            // just do nothing
        });
    }

    handleCalendarShowPreviousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.assignDatesEnabled(this.currentDate, this.currentCustomer);
        this.assignGeneralEvents(this.currentDate, this.currentCustomer);
    }

    handleCalendarShowNextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.assignDatesEnabled(this.currentDate, this.currentCustomer);
        this.assignGeneralEvents(this.currentDate, this.currentCustomer);
    }

    handleCalendarShowCurrentWeek() {
        this.setCurrentDate(new Date());
        this.assignDatesEnabled(this.currentDate, this.currentCustomer);
        this.assignGeneralEvents(this.currentDate, this.currentCustomer);
    }

    handleCalendarLessonEventClick($event) {
        const event: {event: CalendarEvent} = $event;

        // meta now is lessonEvent itself
        if (event.event.meta instanceof CallanLessonEvent) {
            console.log('show event!!');
            this.setCurrentLessonEvent(event.event.meta);
            this.setIsLessonEventShown(true);
            window.scrollTo(0,0);
        }
    }

    handleStudentSearch(term) {
        this.customerService.findCustomers(term).subscribe(customers => {
            this.studentList$.next(customers);
        });
    }

    handleFilterLessonEventsByStudent(student: CallanCustomer) {
        this.filterLessonEventsByStudent(student);
    }

    handleGetStudentDetails(student: CallanCustomer) {
        this.filterLessonEventsByStudent(student);
        this.setView(CallanLessonManagerTeacherViewEnum.LESSON_LIST);
    }

    private buildTabs() {
        this.tabs[CallanLessonManagerTeacherViewEnum.DASHBOARD] = 'Schedule';
        this.tabs[CallanLessonManagerTeacherViewEnum.COURSE_SPECIALITY_LIST] = 'Your qualifications';
        this.tabs[CallanLessonManagerTeacherViewEnum.LESSON_LIST] = 'Lessons';

        this.tabSelected = CallanLessonManagerTeacherViewEnum.DASHBOARD;
    }

    private setCalendarEvents() {

        this.calendarEvents = [];

        if (this.lessonEvents) {
            for (const lessonEvent of this.lessonEvents) {

                // show in the calendar only this two types of lessons
                if (
                    lessonEvent.state === CallanLessonEventStateEnum.PLANNED ||
                    lessonEvent.state === CallanLessonEventStateEnum.STARTED ||
                    lessonEvent.state === CallanLessonEventStateEnum.COMPLETED ||
                    lessonEvent.state === CallanLessonEventStateEnum.CONFIRMED

                ) {
                    this.calendarEvents.push(CallanLessonService.convertLessonEventToCalendarEvent(lessonEvent, true));
                }
            }
        }

        if (this.generalEvents) {
            for (const event of this.generalEvents) {
                // show in the calendar only this two types of lessons
                this.calendarEvents.push(CallanCustomerService.convertGeneralEventToCalendarEvent(event));
            }
        }


        observableTimer(500).subscribe(() => {
            this.calendarRefresh$.next();
        });
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

    private subscribeOnCurrentLessonEvent() {
        this.lessonService.getCurrentLessonEvent$().subscribe(lessonEvent => {
            this.currentLessonEvent = lessonEvent;
        })
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
                this.assignLessonEvents(this.currentCustomer);
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

    private assignAuthCustomer() {
        this.customerService.getAuthCustomer()
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(customer => {
                this.authCustomer = customer;
                this.assignIsAddCourseSpecialityButtonShown();
                this.assignIsCourseSpecialityListControlsShown();
            });
    }

    private assignIsAddCourseSpecialityButtonShown() {

        if (this.authCustomer && this.courseSpecialities && this.allCourses) {
            if (CallanCustomerService.hasCustomerRole(this.authCustomer, CallanRoleNameEnum.ADMIN) &&
                this.courseSpecialities.length < this.allCourses.length) {
                this.isAddCourseSpecialityButtonShown = true;
            } else {
                this.isAddCourseSpecialityButtonShown = false;
            }
        } else {
            this.isAddCourseSpecialityButtonShown = false;
        }
    }

    private assignIsCourseSpecialityListControlsShown() {
        if (this.authCustomer && CallanCustomerService.hasCustomerRole(this.authCustomer, CallanRoleNameEnum.ADMIN)) {
            this.isCourseSpecialityListControlsShown = true;
        } else {
            this.isCourseSpecialityListControlsShown = false;
        }
    }

    private assignCurrentCustomer(): Observable<void> {
        return new Observable(observer => {
            this.customerService.getCurrentCustomer()
                .pipe(
                    takeUntil(this.unsubscribe$)
                )
                .subscribe(customer => {
                    this.currentCustomer = customer;

                    if (customer) {
                        this.assignLessonEvents(customer);
                        this.assignCourseSpecialities(customer);


                            observer.next();
                            observer.complete();
                        //
                    }
                });
        });
    }

    private filterLessonEventsByStudent(student: CallanCustomer) {
        if (student) {
            const filter = new AppDataFilter();
            filter.where = {studentId: student.id, teacherId: this.currentCustomer.id};
            this.findLessonEvents(filter);
            this.lessonEventsFilterByStudentValue = student;
        } else {
            this.assignLessonEvents(this.currentCustomer);
        }
    }

    private assignLessonEvents(customer) {
        this.lessonService.getLessonEventsByTeacher(customer).subscribe(lessonEvents => {
            this.lessonEvents = lessonEvents;
            this.setCalendarEvents();
        });
    }

    private findLessonEvents(filter: AppDataFilter) {
        this.lessonService.findLessonEvents(filter).subscribe(lessonEvents => {
            this.lessonEvents = lessonEvents;
        });
    }

    private assignCourseSpecialities(customer) {
        this.lessonService.getCourseCompetences(customer).subscribe(specialities => {
            this.courseSpecialities = specialities;
            console.log(specialities, 'now');
            this.assignIsAddCourseSpecialityButtonShown();
        });
    }

    private assignAllCourses() {
        this.lessonService.getAllCourses()
            .subscribe(courses => {
                this.allCourses = courses;
                this.assignIsAddCourseSpecialityButtonShown();
            });
    }

    private assignDatesEnabled(date: Date, customer: CallanCustomer) {

        const range = CallanScheduleService.getWeekDatesRangeForDate(date);

        // we need to getHoursAvailable also includes already booked times
        this.scheduleService.getDatesAvailable(range[0], range[1], null, customer, true).subscribe(dates => {
            console.log('dates enabled came');
            this.datesEnabled = dates;

            observableTimer(100).subscribe(() => {
                console.log('rfrsh');
                this.calendarRefresh$.next();
            });
        });
    }

    private assignGeneralEvents(date: Date, customer: CallanCustomer) {

        const range = CallanScheduleService.getWeekDatesRangeForDate(date);

        // we need to getHoursAvailable also includes already booked times
        this.customerService.getGoogleCalendarEvents(customer, range[0], range[1], true).subscribe(events => {
            console.log('general events came', events);
            this.generalEvents = events;
            this.setCalendarEvents();
        });
    }

    private setCurrentDate(date: Date) {
        this.currentDate = date;
    }

    private createCourseCompetence() {
        const speciality = CallanLessonService.createCourseSpeciality();
        speciality.customer = this.currentCustomer;
        return speciality;
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

}
