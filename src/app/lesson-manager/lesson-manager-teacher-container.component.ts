import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, timer as observableTimer, interval as observableInterval} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CallanLessonEvent} from '../shared/models/lesson-event.model';
import {CallanLessonManagerTeacherViewEnum} from '../shared/enums/lesson-manager-teacher.view.enum';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanLessonService} from '../shared/services/lesson.service';
import {CallanScheduleService} from '../shared/services/schedule.service';
import {CallanCustomer} from '../shared/models/customer.model';
import {CallanLessonEventViewEnum} from '../shared/enums/lesson-event.view.enum';
import {AppConfig} from '../app.config';
import {AppModalContentFeedbackComponent} from '../shared-modules/modal-content-feedback/modal-content-feedback.component';
import {CallanLessonEventStateEnum} from '../shared/enums/lesson-event.state.enum';
import {AppError} from '../shared/models/error.model';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
    lessonEventViewNameEnum: any;

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
    }

    ngOnInit() {
        console.log('acc');
        this.subscribeOnLessonEventShown();
        this.subscribeOnCurrentLessonEvent();

        this.subscribeOnIsLessonEventsUpdated();
        this.subscribeOnLessonEventsUpdateInterval();


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
