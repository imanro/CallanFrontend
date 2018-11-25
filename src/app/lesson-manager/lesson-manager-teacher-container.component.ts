import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, timer as observableTimer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CallanLessonEvent} from '../shared/models/lesson-event.model';
import {CallanLessonManagerTeacherViewEnum} from '../shared/enums/lesson-manager-teacher.view.enum';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanScheduleService} from '../shared/services/schedule.service';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanRoleNameEnum} from '../shared/enums/role.name.enum';

@Component({
    selector: 'app-callan-lesson-manager-teacher-container',
    templateUrl: './lesson-manager-teacher-container.component.html',
    styleUrls: ['./lesson-manager-teacher-container.component.scss']
})
export class CallanLessonManagerTeacherContainerComponent implements OnInit, OnDestroy {

    currentLessonEvent: CallanLessonEvent;

    authCustomer: CallanCustomer;
    currentCustomer: CallanCustomer;
    currentDate: Date;

    lessonEvents: CallanLessonEvent[];

    lessonEventsListRefresh$ = new Subject<void>();

    isLessonEventShown = false;
    view = CallanLessonManagerTeacherViewEnum.DEFAULT;
    viewNameEnum: any;

    private unsubscribe$: Subject<void> = new Subject();

    constructor(
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService,
        private scheduleService: CallanScheduleService,
    ) {
        this.viewNameEnum = CallanLessonManagerTeacherViewEnum;
    }

    ngOnInit() {
        console.log('acc');
        this.subscribeOnLessonEventShown();
        this.subscribeOnCurrentLessonEvent();
        this.assignAuthCustomer();
        this.assignCurrentCustomer();
        this.setCurrentDate(new Date());
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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

    private assignAuthCustomer() {
        this.customerService.getAuthCustomer()
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(customer => {
                this.authCustomer = customer;
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
                    this.assignLessonEvents(customer)
                    //
                }
            });
    }

    private assignLessonEvents(customer) {
        this.lessonService.getLessonEventsByTeacher(customer).subscribe(lessonEvents => {
            this.lessonEvents = lessonEvents;

            observableTimer(50).subscribe(() => {
                this.lessonEventsListRefresh$.next();
            });
        });
    }

    private setCurrentDate(date: Date) {
        this.currentDate = date;
    }

}
