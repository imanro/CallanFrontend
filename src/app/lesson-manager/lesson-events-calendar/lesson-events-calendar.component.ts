import {Component, EventEmitter, Input, Output, OnInit, ViewChild, TemplateRef, OnDestroy} from '@angular/core';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs';

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
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';
import {CallanCustomer} from '../../shared/models/customer.model';


@Component({
    selector: 'app-callan-lesson-events-calendar',
    templateUrl: './lesson-events-calendar.component.html',
    styleUrls: ['./lesson-events-calendar.component.scss']
})
export class CallanLessonEventsCalendarComponent implements OnInit {

    @Input() courseProgress: CallanCourseProgress;

    @Input() student: CallanCustomer;

    @Input() lessonEvents$: BehaviorSubject<CallanLessonEvent[]>;

    @Input() datesEnabled: Date[];

    @Input() calendarEvents: CalendarEvent[];

    @Input() currentDate: Date;

    @Input() refresh$ = new Subject();

    @Output() cancelEvent = new EventEmitter<void>();

    @Output() showNextWeekEvent = new EventEmitter<void>();

    @Output() showCurrentWeekEvent = new EventEmitter<void>();

    @Output() showPreviousWeekEvent = new EventEmitter<void>();

    @Output() lessonEventCreateEvent = new EventEmitter<CallanLessonEvent>();

    @Output() hourSegmentClickEvent = new EventEmitter<{date: Date, isSegmentEnabled: boolean}>();

    @Output() lessonEventClickEvent = new EventEmitter<{ event: CalendarEvent }>();

    constructor(
    ) {
    }

    ngOnInit() {
    }


    handleClickHourSegment($event) {
        this.hourSegmentClickEvent.next($event);
    }

    handleLessonEventClicked($event) {
        this.lessonEventClickEvent.next($event);
    }

    handleClickCancel() {
        this.cancelEvent.next();
    }

    handleShowPreviousWeek() {
        this.showPreviousWeekEvent.next();
    }

    handleShowNextWeek() {
        this.showNextWeekEvent.next();
    }

    handleShowCurrentWeek() {
        this.showCurrentWeekEvent.next();
    }
}
