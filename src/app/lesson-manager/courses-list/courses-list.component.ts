import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import {CallanCourse} from '../../shared/models/course.model';
import {CallanCourseProgress} from '../../shared/models/course-progress.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'app-callan-courses-list',
    templateUrl: './courses-list.component.html',
    styleUrls: ['./courses-list.component.scss']
})
export class CallanCoursesListComponent implements OnInit {

    @Input() allCourses$: Observable<CallanCourse[]>;
    @Input() currentCustomerCourseProgresses$: BehaviorSubject<CallanCourseProgress[]>;
    @Input() currentCourseProgress$: BehaviorSubject<CallanCourseProgress>;
    @Input() isTopUpLessonEventsBalanceButtonShown;
    @Input() isLessonEventsCreateButtonShown;

    @Output() courseSelectEvent = new EventEmitter<CallanCourseProgress>();
    @Output() topUpLessonEventsBalanceEvent = new EventEmitter<void>();
    @Output() lessonEventCreateEvent = new EventEmitter<CallanCourseProgress>();

    currentCourseProgress: CallanCourseProgress;

    constructor() {
    }

    ngOnInit() {

        this.currentCourseProgress$
            .subscribe(courseProgress => {
                this.currentCourseProgress = courseProgress;
                console.log('changed!', courseProgress);
            });

        // console.log(this.currentCustomerCourseProgresses$);
        this.currentCustomerCourseProgresses$.subscribe(values => {
           // console.log('values:', values);
        });
    }


    private getCourseProgress(id: number): CallanCourseProgress {
        const courses = this.currentCustomerCourseProgresses$.getValue();
        for (const course of courses) {
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

    handleTopUpLessonEventsBalance($event) {
        this.topUpLessonEventsBalanceEvent.next($event);
    }
}
