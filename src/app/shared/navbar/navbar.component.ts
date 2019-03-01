import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {interval as observableInterval} from 'rxjs';

import {AppConfig} from '../../app.config';
import {CallanCustomer} from '../models/customer.model';
import {CallanCustomerService} from '../services/customer.service';
import {CallanLessonEvent} from '../models/lesson-event.model';
import {CallanLessonService} from '../services/lesson.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {CallanLessonEventStateEnum} from '../enums/lesson-event.state.enum';
import {CallanRoleNameEnum} from '../enums/role.name.enum';
import {ToastrService} from 'ngx-toastr';
import {AppError} from '../models/error.model';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnDestroy {
    toggleClass = 'ft-maximize';

    // auth related
    authCustomer: CallanCustomer;
    currentCustomer: CallanCustomer;

    // lesson-related
    currentLessonEvent: CallanLessonEvent;
    currentLessonEventRemainingMinutes: number;
    lessonEventAllowStartOffsetMinutes: number;

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private appConfig: AppConfig,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private toastrService: ToastrService,
    ) {
    }

    ngOnInit() {
        this.assignAuthCustomer();
        this.assignCurrentCustomer();
        this.subscribeOnIsLessonEventsUpdated();

        this.subscribeOnNearestLessonEventInterval();
        this.subscribeOnNearestLessonEventRemainingMinutesInterval();
        this.lessonEventAllowStartOffsetMinutes = this.appConfig.lessonEventAllowStartOffsetMinutes;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    handleLessonEventView(lessonEvent) {

        // set details shown value
        this.lessonService.setCurrentLessonEvent(lessonEvent);
        this.lessonService.toggleIsLessonEventShown();


        // if we're not in the required module, change address...)
        if (this.router.routerState.snapshot.url.indexOf('/lessons') !== 0) {
            this.navigateToLessons();
        }
    }

    handleLessonEventStart(lessonEvent) {

        console.log('to start');
        const prevState = lessonEvent.state;

        this.lessonService.changeLessonEventState(lessonEvent, CallanLessonEventStateEnum.STARTED).subscribe(updatedLessonEvent => {

            this.currentLessonEvent = updatedLessonEvent;
            this.lessonService.setCurrentLessonEvent(this.currentLessonEvent);
            this.lessonService.setIsLessonEventShown(true);

            // if we're not in the required module, change address...)
            if (this.router.routerState.snapshot.url.indexOf('/lessons') !== 0) {
                this.navigateToLessons();
            }
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
    }

    ToggleClass() {
        if (this.toggleClass === 'ft-maximize') {
            this.toggleClass = 'ft-minimize';
        } else {
            this.toggleClass = 'ft-maximize'
        }
    }

    private navigateToLessons() {
        if (this.currentCustomer) {
            if (CallanCustomerService.hasCustomerRole(this.currentCustomer, CallanRoleNameEnum.STUDENT)) {
                this.router.navigate(['/lessons/student']);
            } else if (CallanCustomerService.hasCustomerRole(this.currentCustomer, CallanRoleNameEnum.TEACHER)) {
                this.router.navigate(['/lessons/teacher']);
            }
        }
    }

    private subscribeOnIsLessonEventsUpdated() {
            this.lessonService.getIsLessonEventsUpdated$().pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(() => {

                console.log('Lesson events updated, fetching the new info');
                if (this.currentCustomer) {
                    this.assignNearestLessonEvent(this.currentCustomer);
                }
            });
    }

    private subscribeOnNearestLessonEventRemainingMinutesInterval() {
        observableInterval(this.appConfig.nearestLessonEventRemainingMinutesCheckIntervalMs).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            this.assignNearestLessonEventRemainingMinutes(this.currentLessonEvent);
        });
    }

    private subscribeOnNearestLessonEventInterval() {
        observableInterval(this.appConfig.nearestLessonEventCheckIntervalMs).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            this.assignNearestLessonEvent(this.currentCustomer, true);
        });
    }

    private assignAuthCustomer() {
        this.customerService.getAuthCustomer()
            .subscribe(customer => {
                this.authCustomer = customer;
            });
    }

    private assignCurrentCustomer() {
        this.customerService.getCurrentCustomer$()
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(customer => {
                this.currentCustomer = customer;
                this.assignNearestLessonEvent(customer);
            });
    }

    private assignNearestLessonEvent(customer, isFromInterval = false) {
        console.log('Assign nearest lesson event');
        if (customer) {
            if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.STUDENT)) {
                this.lessonService.getNearestStudentLessonEvent(customer).subscribe(lessonEvent => {
                    if (lessonEvent) {
                        this.currentLessonEvent = lessonEvent;

                        console.log('New lesson event assigned, the lesson is', lessonEvent);
                        this.assignNearestLessonEventRemainingMinutes(lessonEvent);
                    }
                }, err => {
                    this.currentLessonEvent = null;
                });

            } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.TEACHER)) {
                this.lessonService.getNearestTeacherLessonEvent(customer).subscribe(lessonEvent => {

                    if (lessonEvent) {
                        if (isFromInterval && (!this.currentLessonEvent || this.currentLessonEvent.id !== lessonEvent.id)) {
                            this.toastrService.success('New upcoming lesson!', 'Notification');
                        }

                        this.currentLessonEvent = lessonEvent;

                            console.log('New lesson event assigned, the lesson is', lessonEvent);
                            this.assignNearestLessonEventRemainingMinutes(lessonEvent);
                    }
                }, err => {
                    this.currentLessonEvent = null;
                });
            }
        }
    }

    private assignNearestLessonEventRemainingMinutes(lessonEvent) {
        console.log('Assing remaining minutes');
        if (lessonEvent) {
            const currentDate = new Date();
            const diff = lessonEvent.startTime.getTime() - currentDate.getTime();
            this.currentLessonEventRemainingMinutes = Math.floor(diff / 60000);
            console.log('Minutes left:', this.currentLessonEventRemainingMinutes);
        }
    }
}
