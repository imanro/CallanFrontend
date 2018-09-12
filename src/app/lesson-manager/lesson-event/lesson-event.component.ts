import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';

@Component({
    selector: 'app-callan-lesson-event',
    templateUrl: './lesson-event.component.html',
    styleUrls: ['./lesson-event.component.scss']
})
export class CallanLessonEventComponent implements OnInit {

    @Input() lessonEvent: CallanLessonEvent;
    @Input() lessonEventRemainingMinutes: number;
    @Input() isLessonTimeSpent = false;
    @Input() isLessonStarted = false;

    @Output() lessonStartEvent = new EventEmitter<void>();

    lessonEventRemainingDays = 0;
    lessonEventRemainingHours = 0;

    constructor() {
        console.log('constr');
    }

    handleLessonEventStart() {
        this.lessonStartEvent.next();
    }

    ngOnInit() {

        this.lessonEventRemainingDays = Math.floor(this.lessonEventRemainingMinutes / 60 / 24);
        if (this.lessonEventRemainingDays > 0) {
            console.log('this case');
            this.lessonEventRemainingHours = Math.floor(this.lessonEventRemainingMinutes / 60 % 24);
        } else {
            this.lessonEventRemainingHours = Math.floor(this.lessonEventRemainingMinutes / 60 );
        }

        console.log('DHM', this.lessonEventRemainingDays, this.lessonEventRemainingHours, this.lessonEventRemainingMinutes);
    }

}
