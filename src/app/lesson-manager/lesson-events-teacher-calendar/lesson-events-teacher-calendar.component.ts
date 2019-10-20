import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {Subject} from 'rxjs';

import {CalendarEvent } from 'angular-calendar';

@Component({
    selector: 'app-callan-lesson-events-teacher-calendar',
    templateUrl: './lesson-events-teacher-calendar.component.html',
    styleUrls: ['./lesson-events-teacher-calendar.component.scss']
})
export class CallanLessonEventsTeacherCalendarComponent implements OnInit {

    @Input() datesEnabled: Date[];

    @Input() calendarEvents: CalendarEvent[];

    @Input() currentDate: Date;

    @Input() refresh$ = new Subject();

    @Input() scheduleMinuteStep: number;

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
