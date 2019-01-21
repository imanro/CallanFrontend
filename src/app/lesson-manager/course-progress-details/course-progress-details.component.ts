import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {CallanCustomer} from '../../shared/models/customer.model';
import {CallanCourseTeacherChoiceEnum} from '../../shared/enums/course.teacher-choice.enum';

@Component({
    selector: 'app-callan-course-progress-details',
    templateUrl: './course-progress-details.component.html',
    styleUrls: ['./course-progress-details.component.scss']
})
export class CallanCourseProgressDetailsComponent implements OnInit {

    @Input() courseProgress: CallanCourseProgress;

    @Input() isTopUpLessonEventsBalanceButtonShown;

    @Input() isLessonEventsCreateButtonShown;

    @Input() completedLessonEventsCount: number;

    @Output() lessonEventCreateEvent = new EventEmitter<void>();

    @Output() topUpLessonEventsBalanceEvent = new EventEmitter<CallanCourseProgress>();

    courseTeacherChoiceEnum: any;

    constructor(
    ) {
        this.courseTeacherChoiceEnum = CallanCourseTeacherChoiceEnum;
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
