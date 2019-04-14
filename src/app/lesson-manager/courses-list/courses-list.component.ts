import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';

@Component({
    selector: 'app-callan-courses-list',
    templateUrl: './courses-list.component.html',
    styleUrls: ['./courses-list.component.scss']
})
export class CallanCoursesListComponent implements OnInit {

    @Input() courseProgresses: CallanCourseProgress[];

    @Input() currentCourseProgress: CallanCourseProgress;

    @Input() isTopUpBalanceButtonShown;

    @Input() isLessonEventsCreateButtonShown;

    @Input() completedLessonEvents: {[index: number]: number};

    @Output() courseSelectEvent = new EventEmitter<CallanCourseProgress>();

    @Output() topUpBalanceEvent = new EventEmitter<void>();

    @Output() lessonEventCreateEvent = new EventEmitter<CallanCourseProgress>();

    constructor() {
    }

    ngOnInit() {
    }

    private getCourseProgress(id: number): CallanCourseProgress {
        for (const course of this.courseProgresses) {
            // console.log(course.id, id);
            if (course.id === id) {
                return course;
            }
        }

        return null;
    }

    handleCourseProgressChange($event: NgbPanelChangeEvent) {
        const progress = this.getCourseProgress(parseInt($event.panelId));

        if (progress) {
            this.courseSelectEvent.next(progress);
        } else {
            console.error('Unable to find such progress');
        }
    }

    handleLessonEventsCreate() {
        this.lessonEventCreateEvent.next();
    }

    handleTopUpBalance($event) {
        this.topUpBalanceEvent.next($event);
    }
}
