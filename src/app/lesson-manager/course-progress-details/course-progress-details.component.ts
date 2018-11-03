import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {CallanCustomer} from '../../shared/models/customer.model';

@Component({
    selector: 'app-callan-course-progress-details',
    templateUrl: './course-progress-details.component.html',
    styleUrls: ['./course-progress-details.component.scss']
})
export class CallanCourseProgressDetailsComponent implements OnInit {

    @Input() courseProgress: CallanCourseProgress;
    @Input() isTopUpLessonEventsBalanceButtonShown;
    @Input() isLessonEventsCreateButtonShown;

    @Output() lessonEventCreateEvent = new EventEmitter<void>();
    @Output() topUpLessonEventsBalanceEvent = new EventEmitter<CallanCourseProgress>();

    constructor(
    ) {
    }

    ngOnInit() {
    }

    handleTopUpLessonEventsBalance() {
        this.topUpLessonEventsBalanceEvent.next(this.courseProgress);
    }

    handleLessonEventsCreate() {
        this.lessonEventCreateEvent.next();
    }
}
