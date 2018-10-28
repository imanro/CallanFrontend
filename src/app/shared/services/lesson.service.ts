import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {CallanCustomer} from '../models/customer.model';
import {CallanCourse} from '../models/course.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanLessonEvent} from '../models/lesson-event.model';
import {
    CalendarEvent
} from 'angular-calendar';
import {CallanCustomerService} from './customer.service';

import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {CallanLesson} from '../models/lesson.model';
import {CallanLessonEventStateEnum} from '../enums/lesson-event.state.enum';


@Injectable()
export abstract class CallanLessonService {

    protected isLessonDetailsShown = false;
    protected isLessonDetailsShown$ = new BehaviorSubject<boolean>(false);

    static createCourseProgress(): CallanCourseProgress {
        return new CallanCourseProgress();
    }

    constructor(
        protected customerService?: CallanCustomerService
    ) {
    }

    abstract getLessonEvents(customer: CallanCustomer): Observable<CallanLessonEvent[]>;

    abstract getCourseProgresses(customer: CallanCustomer): Observable<CallanCourseProgress[]>;

    abstract addCourseProgress(customer: CallanCustomer, course: CallanCourse): Observable<CallanCourseProgress>;

    abstract getAllCourses(): Observable<CallanCourse[]>;

    abstract getCourseProgress(id: number): Observable<CallanCourseProgress>;

    // CHECKME: signature (does the lessonEvents needed here?)
    abstract getNearestLessonEvent(customer: CallanCustomer): Observable<CallanLessonEvent>;

    // CHECKME: signature (does the lessonEvents needed here?)
    abstract getDatesEnabled(lessonEvents: CallanLessonEvent[], previousDates: Date[]): Observable<Date[]>;

    abstract changetLessonEventState(lessonEvent: CallanLessonEvent, state: number): Observable<boolean>;

    createCourse(): CallanCourse {
        return new CallanCourse();
    }

    createLesson(): CallanLesson {
        return new CallanLesson();
    }

    createLessonEvent(): CallanLessonEvent {
        return new CallanLessonEvent();
    }


    initLessonEvent(lessonEvent: CallanLessonEvent) {
        lessonEvent.duration = 60;
        lessonEvent.title = '';
        lessonEvent.state = CallanLessonEventStateEnum.PLANNED;
    }

    convertLessonEventToCalendarEvent(lessonEvent: CallanLessonEvent): CalendarEvent {

        const endMinutes = lessonEvent.duration % 60;
        const endHours = Math.floor(lessonEvent.duration / 60);

        const endDate = new Date(lessonEvent.startTime);
        endDate.setHours(lessonEvent.startTime.getHours() + endHours);
        endDate.setMinutes(lessonEvent.startTime.getMinutes() + endMinutes);

        console.log('end date now:', endDate, endMinutes, endHours, lessonEvent.duration);

        const calendarEvent = {
            start: lessonEvent.startTime,
            end: endDate,
            title: lessonEvent.title,
            color: {
                primary: '#ad2121',
                secondary:
                    '#FAE3E3'
            }
        };

        return calendarEvent;
    }

    getIsLessonDetailsShown() {
        return this.isLessonDetailsShown;
    }

    getIsLessonDetailsShown$() {
        return this.isLessonDetailsShown$;
    }

    setIsLessonDetailsShown(value) {
        if (value !== this.isLessonDetailsShown) {
            this.isLessonDetailsShown = value;
            this.isLessonDetailsShown$.next(value);
        }

        return this.isLessonDetailsShown;
    }

    toggleIsLessonDetailsShown() {
        if (this.isLessonDetailsShown) {
            this.setIsLessonDetailsShown(false);
        } else {
            this.setIsLessonDetailsShown(true);
        }
    }
}
