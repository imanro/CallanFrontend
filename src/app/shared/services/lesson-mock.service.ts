import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {delay, mergeMap} from 'rxjs/operators';
import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';

import {AppConfig, IAppConfig} from '../../app.config';

import {mockCourses} from '../data/mock-courses';
import {mockProgresses} from '../data/mock-course-progresses';
import {mockLessonEvents} from '../data/mock-lesson-events';

import {CallanCustomer} from '../models/customer.model';
import {CallanCourse} from '../models/course.model';
import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanLessonEvent} from '../models/lesson-event.model';

import {CallanLessonService} from './lesson.service';
import {CallanCustomerService} from './customer.service';
import {CallanLesson} from '../models/lesson.model';
import {CallanCourseStage} from '../models/course-stage.model';

@Injectable()
export class CallanLessonMockService extends CallanLessonService {

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig,
        protected customerService: CallanCustomerService
    ) {
        super(appConfig);
    }

    getAllCourses(): Observable<CallanCourse[]> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCourse[]>(observer => {
            observer.next(mockCourses);
            observer.complete();
        }).pipe(
            delay(d)
        );
    }

    getCourseProgresses(customer: CallanCustomer): Observable<CallanCourseProgress[]> {
        return new Observable<CallanCourseProgress[]>(observer => {
            const result = [];
            for (const id in mockProgresses) {
                if (mockProgresses.hasOwnProperty(id)) {
                    const row = mockProgresses[id];
                    if (row.customer.id === customer.id) {
                        result.push(row);
                    }
                }
            }

            observer.next(result);
            observer.complete();
        })
    }

    getCourseProgress(id: number): Observable<CallanCourseProgress> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCourseProgress>(observer => {

            if (mockProgresses[id] !== undefined) {
                observer.next(mockProgresses[id]);
            } else {
                throw new Error('Unknown course progress id given: ' + id);
            }

            observer.complete();
        }).pipe(
            delay(d)
        )
    }

    saveCourseProgress(progress: CallanCourseProgress): Observable<CallanCourseProgress> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanCourseProgress>(observer => {
            progress.id = mockProgresses.length + 1;

            mockProgresses.push(progress);
            observer.next(progress);
            console.log('now:', mockProgresses);

            observer.complete();
        }).pipe(
            delay(d)
        );
    }

    saveLessonEvent(lessonEvent: CallanLessonEvent): Observable<CallanLessonEvent> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanLessonEvent>(observer => {
            lessonEvent.id = mockLessonEvents.length + 1;

            mockLessonEvents.push(lessonEvent);
            observer.next(lessonEvent);
            console.log('now:', mockLessonEvents);

            observer.complete();
        }).pipe(
            delay(d)
        )
    }

    getLessonEvents(courseProgress: CallanCourseProgress, customer: CallanCustomer = null): Observable<CallanLessonEvent[]> {

        // we need customers
        return new Observable<CallanLessonEvent[]>(observer => {

            observableCombineLatest(
                this.customerService.getCurrentCustomer(),
                this.customerService.getCustomers())
                .subscribe(results => {
                    const currentCustomer = results[0];
                    const allCustomers = results[1];

                    if (currentCustomer) {
                        let anotherCustomer: CallanCustomer;

                        for (const testCustomer of allCustomers) {
                            if (testCustomer.id !== currentCustomer.id) {
                                anotherCustomer = testCustomer;
                                break;
                            }
                        }

                        if (anotherCustomer === undefined) {
                            throw new Error('could not assign another customer');
                        }

                        console.log('customers:', currentCustomer, anotherCustomer);

                        const list = mockLessonEvents;

                        for (const lessonEvent of list) {
                            CallanLessonService.initLessonEvent(lessonEvent);
                            lessonEvent.student = currentCustomer;
                            lessonEvent.teacher = anotherCustomer;
                        }

                        console.log('alls done', list);
                        observer.next(list);
                    }
                });
        });
    }

    getLessonEvent(id: number): Observable<CallanLessonEvent> {
        return new Observable<CallanLessonEvent>(observer => {
            this.customerService.getCurrentCustomer()
                .subscribe(customer => {

                    this.getLessonEvents(null)
                        .subscribe(lessonEvents => {
                            if (lessonEvents.length > 0) {
                                observer.next(lessonEvents[0]);
                            } else {
                                observer.next(null);
                            }
                        })
                });
        });
    }

    getNearestLessonEvent(customer: CallanCustomer): Observable<CallanLessonEvent> {

        return new Observable<CallanLessonEvent>(observer => {
            this.getLessonEvents(null, customer).subscribe(lessonEvents => {
                observer.next(lessonEvents[0]);
                console.log(lessonEvents[0]);
                observer.complete();
            });
        });
    }

    getDatesEnabled(lessonEvents: CallanLessonEvent[], previousDates: Date[]): Observable<Date[]> {

        return new Observable<Date[]>(observer => {
            const baseDate = new Date();

            baseDate.setDate(baseDate.getDate() + 1);
            baseDate.setHours(9);
            baseDate.setMinutes(0);
            baseDate.setMinutes(0);
            baseDate.setSeconds(0);

            let randStart, randEnd;

            let list = [];
            if (previousDates) {
                console.log('There was a previous dates', previousDates);
                list = previousDates;
            } else {
                list = [];
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
            }

            // checking the list against the lessonEvents
            let counter = 0;
            for (const date of list) {
                for (const lessonEvent of lessonEvents) {
                    if (
                        lessonEvent.startTime.getFullYear() === date.getFullYear() &&
                        lessonEvent.startTime.getMonth() === date.getMonth() &&
                        lessonEvent.startTime.getDate() === date.getDate() &&
                        lessonEvent.startTime.getHours() === date.getHours()
                    ) {
                        console.log('Removing an item from list of enabled dates');
                        list.splice(counter, 1);
                    }
                }

                counter++;
            }

            console.log('Now, list of enabled dates contains', list.length, 'elements');
            console.log(list);
            observer.next(list);
        });
    }

    changetLessonEventState(lessonEvent: CallanLessonEvent, state: number): Observable<boolean> {
        lessonEvent.state = state;
        return new Observable<boolean>(observer => {
            observer.next(true);
            observer.complete();
        });
    }

    mapDataToCourse(course: CallanCourse, row: any): void {
    }

    mapDataToCourseProgress(courseProgress: CallanCourseProgress, row: any): void {

    }

    mapCourseProgressToData(courseProgress: CallanCourseProgress): object {
        return {}
    }

    mapDataToLessonEvent(lessonEvent: CallanLessonEvent, row: any): void {

    }

    mapLessonEventToData(lessonEvent: CallanLessonEvent): object {
        return {}
    }

    mapDataToLesson(lesson: CallanLesson, row: any): void {

    }

    mapDataToCourseStage(courseStage: CallanCourseStage, row: any): void {

    }
}
