import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanCourseProgress} from '../../shared/models/callan-course-progress.model';

@Component({
    selector: 'app-callan-course-progress-details',
    templateUrl: './course-progress-details.component.html',
    styleUrls: ['./course-progress-details.component.scss']
})
export class CallanCourseProgressDetailsComponent implements OnInit {

    @Input() courseProgress: CallanCourseProgress;
    @Output() lessonEventCreateEvent = new EventEmitter<void>();

    constructor() {
    }

    ngOnInit() {
    }

    onClickLessonEventsCreate($event) {
        this.lessonEventCreateEvent.next();
    }
}
