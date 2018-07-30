import {Component, EventEmitter, Input, Output, OnInit, ViewChild, TemplateRef, OnDestroy} from '@angular/core';
import {CallanCourseProgress} from '../../shared/models/callan-course-progress.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import {Subject} from 'rxjs/Subject';
import {takeUntil} from 'rxjs/operators';
import * as moment from 'moment';

import {
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours
} from 'date-fns';

import {
    CalendarEvent,
    /*    CalendarEventAction,
        CalendarEventTimesChangedEvent */
} from 'angular-calendar';
import {CallanLessonEvent} from '../../shared/models/callan-lesson-event.model';
import {CallanLessonService} from '../../shared/services/lesson.service';


@Component({
    selector: 'app-callan-lesson-events-list',
    templateUrl: './lesson-events-list.component.html',
    styleUrls: ['./lesson-events-list.component.scss']
})
export class CallanLessonEventsListComponent implements OnInit, OnDestroy {

    @Input() courseProgress$: BehaviorSubject<CallanCourseProgress>;

    @Input() lessonEvents$: BehaviorSubject<CallanLessonEvent[]>;

    @Output() cancelEvent = new EventEmitter<void>();

    @Output() lessonEventCreateEvent = new EventEmitter<Date>();

    // FIXME
    @ViewChild('eventModalContent') eventModalContent: TemplateRef<any>;

    private eventModalData = {
        title: '',
        body: ''
    };

    currentModal: NgbModalRef;

    calendarEvents: CalendarEvent[] = [];
    currentHourSegment: {date: Date};

    calendarView = 'week';
    currentDate = new Date();

    hoursEnabled: number[];
    datesEnabled: Date[];
    hourSegments = 1;

    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private lessonService: CallanLessonService,
        private modalService: NgbModal
    ) {

    }

    ngOnInit() {
        console.log('now, lessons events is', this.lessonEvents$);

        this.lessonEvents$.pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(events => {

            this.calendarEvents = [];

            if (events) {
                for (const lessonEvent of events) {
                    this.calendarEvents.push(this.lessonService.convertLessonEventToCalendarEvent(lessonEvent));
                }
            }

            console.log('received new lesevents list', events);
            console.log(this.calendarEvents);

        });

        this.courseProgress$.pipe(
            takeUntil(this.unsubscribe)
        ).subscribe(courseProgress => {
            console.log('ccp: ', courseProgress);
        });

        this.hoursEnabled = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        this.datesEnabled = this.lessonService.createDatesEnabledDev();
        console.log(this.datesEnabled);
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleClickHourSegment($event) {

        this.currentHourSegment = $event;

        if($event.isSegmentEnabled) {
            this.eventModalData.title = 'Confirm planning lesson';
            this.eventModalData.body = '<p>Next lesson will start at:</p> <p><strong>' +
                moment($event.date).format('D.MM.YYYY h:mm A') + '</strong></p>';

            this.currentModal = this.modalService.open(this.eventModalContent, {
                centered: true,
                backdrop: true,
                size: 'lg'
            });
        }
    }

    handleLessonEventClicked($event) {
        console.log('ec', $event);
        console.log($event.event.title);
        this.eventModalData.title = $event.event.title;
        this.eventModalData.body = '<p>Lesson start:</p> <p>' + $event.event.start.toLocaleString() + '</p>';
        this.currentModal = this.modalService.open(this.eventModalContent, {
            centered: true,
            backdrop: true,
            size: 'lg'
        });
    }

    handleConfirmLessonEventCreate() {

        if (this.currentModal) {
            this.currentModal.close();
            this.currentModal = null;
        }

        console.log('confirmed', this.currentHourSegment.date);
        this.lessonEventCreateEvent.next(this.currentHourSegment.date);
    }

    handleClickCancel($event) {
        this.cancelEvent.next();
    }
}
