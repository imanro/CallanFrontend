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

    constructor() {
        console.log('constr');
    }

    handleLessonEventStart() {
        this.lessonStartEvent.next();
    }

    ngOnInit() {
        console.log('now, lesson event:', this.lessonEvent);
    }

}
