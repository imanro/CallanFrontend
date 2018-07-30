import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {CallanCustomer} from '../models/callan-customer.model';
import {CallanCourse} from '../models/callan-course.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CallanCourseProgress} from '../models/callan-course-progress.model';
import {CallanLessonEvent} from '../models/callan-lesson-event.model';
import {
    CalendarEvent
} from 'angular-calendar';

@Injectable()
export abstract class CallanLessonService {

    protected courseProgresses$ = new BehaviorSubject<CallanCourseProgress[]>(null);

    protected currentCourseProgress$ = new BehaviorSubject<CallanCourseProgress>(null);

    constructor() {
    }

    abstract assignCourseProgresses(customer: CallanCustomer);

    getCourseProgresses(): BehaviorSubject<CallanCourseProgress[]> {
        return this.courseProgresses$;
    }

    abstract getAllCourses(): Observable<CallanCourse[]>;

    abstract getCourseProgress(id: number): Observable<CallanCourseProgress>;

    setCurrentCourseProgress(courseProgress: CallanCourseProgress): CallanCourseProgress {
        this.currentCourseProgress$.next(courseProgress);
        return courseProgress;
    }

    getCurrentCourseProgress(): BehaviorSubject<CallanCourseProgress> {
        return this.currentCourseProgress$;
    }

    createLessonEvent(): CallanLessonEvent {
        return new CallanLessonEvent();
    }

    initLessonEvent(lessonEvent: CallanLessonEvent) {
        lessonEvent.duration = 60;
        lessonEvent.title = '';
        lessonEvent.state = CallanLessonEvent.STATE_PLANNED;
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

    createLessonEventsDev(): CallanLessonEvent[] {

        const list = [];

        const baseStartDate = new Date();
        baseStartDate.setHours(13);
        baseStartDate.setMinutes(0);
        baseStartDate.setMinutes(0);
        baseStartDate.setSeconds(0);

        const event1 = this.createLessonEvent();
        this.initLessonEvent(event1);
        event1.title = 'Lesson 1';
        event1.startTime = baseStartDate;

        list.push(event1);

        const event2StartDate = new Date(baseStartDate.getTime());
        event2StartDate.setDate(baseStartDate.getDate() + 1);
        event2StartDate.setHours(baseStartDate.getHours() + 1);

        const event2 = this.createLessonEvent();
        this.initLessonEvent(event2);
        event2.title = 'Lesson 2';
        event2.startTime = event2StartDate;

        list.push(event2);

        return list;
    }

    createDatesEnabledDev(): Date[] {
        const list = [];

        const baseDate = new Date();

        baseDate.setDate(baseDate.getDate() + 1);
        baseDate.setHours(9);
        baseDate.setMinutes(0);
        baseDate.setMinutes(0);
        baseDate.setSeconds(0);

        let randStart, randEnd;

        for (let i = 0; i < 7; i++) {

            randStart = Math.floor(Math.random() * (20 - 10) + 10);
            randEnd = Math.floor(Math.random() * (20 - randStart) + randStart);

            // console.log(randStart, randEnd);

            for (let j = 10; j <= 20; j++) {
                // console.log(j, 'is');
                if (j >= randStart && j <= randEnd) {
                    // console.log('katit');
                    const date = new Date(baseDate.getTime());
                    date.setDate(baseDate.getDate() + i);
                    date.setHours(j);
                    // console.log(date);
                    list.push(date);
                }
            }
        }

        return list;
    }
}
