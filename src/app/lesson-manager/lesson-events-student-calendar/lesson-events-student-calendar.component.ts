import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {Subject} from 'rxjs';

import {CalendarEvent } from 'angular-calendar';
import {CallanCustomer} from '../../shared/models/customer.model';


@Component({
    selector: 'app-callan-lesson-events-student-calendar',
    templateUrl: './lesson-events-student-calendar.component.html',
    styleUrls: ['./lesson-events-student-calendar.component.scss']
})
export class CallanLessonEventsStudentCalendarComponent implements OnInit {

    @Input() student: CallanCustomer;

    @Input() datesEnabled: Date[];

    @Input() calendarEvents: CalendarEvent[];

    @Input() currentDate: Date;

    @Input() refresh$ = new Subject();

    @Input() scheduleMinuteStep: number;

    @Output() cancelEvent = new EventEmitter<void>();

    @Output() showNextWeekEvent = new EventEmitter<void>();

    @Output() showCurrentWeekEvent = new EventEmitter<void>();

    @Output() showPreviousWeekEvent = new EventEmitter<void>();

    @Output() hourSegmentClickEvent = new EventEmitter<{date: Date, isSegmentEnabled: boolean}>();

    @Output() lessonEventClickEvent = new EventEmitter<{ event: CalendarEvent }>();

    hourSegmentsAmount = 4;

    constructor(
    ) {
    }

    ngOnInit() {
        if (this.scheduleMinuteStep){
            this.hourSegmentsAmount = 60 / this.scheduleMinuteStep;
        }
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
