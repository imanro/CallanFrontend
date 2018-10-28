import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CallanLessonEvent} from '../../shared/models/lesson-event.model';

@Component({
    selector: 'app-callan-lesson-event',
    templateUrl: './lesson-event.component.html',
    styleUrls: ['./lesson-event.component.scss']
})
export class CallanLessonEventComponent implements OnInit {

    @Input() lessonEvent: CallanLessonEvent;
    @Output() lessonStartEvent = new EventEmitter<void>();

    constructor() {
    }

    handleLessonEventStart() {
        this.lessonStartEvent.next();
    }

    ngOnInit() {
    }

}
