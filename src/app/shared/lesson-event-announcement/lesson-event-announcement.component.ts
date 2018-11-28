import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {CallanLessonEvent} from '../models/lesson-event.model';

@Component({
    selector: 'app-callan-lesson-event-announcement',
    templateUrl: './lesson-event-announcement.component.html',
    styleUrls: ['./lesson-event-announcement.component.scss']
})
export class CallanLessonEventAnnouncementComponent implements OnInit, OnChanges {

    @Input() lessonEventRemainingMinutes: number;
    @Input() isLessonTimeSpent = false;
    @Input() lessonEvent: CallanLessonEvent;

    @Output() lessonStartEvent = new EventEmitter<CallanLessonEvent>();
    @Output() lessonViewEvent = new EventEmitter<CallanLessonEvent>();

    lessonEventRemainingDays = 0;
    lessonEventRemainingHours = 0;

    constructor() {
    }

    ngOnInit() {

    }

    ngOnChanges() {
        this.recalculateRemaining();
    }

    handleLessonEventStart() {
        this.lessonStartEvent.next(this.lessonEvent);
    }

    handleLessonEventView() {
        this.lessonViewEvent.next(this.lessonEvent);
    }

    private recalculateRemaining() {
        this.lessonEventRemainingDays = Math.floor(this.lessonEventRemainingMinutes / 60 / 24);
        if (this.lessonEventRemainingDays > 0) {
            this.lessonEventRemainingHours = Math.floor(this.lessonEventRemainingMinutes / 60 % 24);
        } else {
            this.lessonEventRemainingHours = Math.floor(this.lessonEventRemainingMinutes / 60);
        }
    }

}
