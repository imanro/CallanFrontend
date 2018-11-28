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
        protected appConfig: AppConfig,
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

    getLessonEvents(courseProgress: CallanCourseProgress): Observable<CallanLessonEvent[]> {

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

    getLessonEventsByStudent(student: CallanCustomer): Observable<CallanLessonEvent[]> {
        return this.getLessonEvents(null);
    }

    getLessonEventsByTeacher(teacher: CallanCustomer): Observable<CallanLessonEvent[]> {
        return this.getLessonEventsByStudent(teacher);
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

    getNearestStudentLessonEvent(student: CallanCustomer): Observable<CallanLessonEvent> {

        return new Observable<CallanLessonEvent>(observer => {
            this.getLessonEventsByStudent(null).subscribe(lessonEvents => {
                observer.next(lessonEvents[0]);
                console.log(lessonEvents[0]);
                observer.complete();
            });
        });
    }

    getNearestTeacherLessonEvent(teacher: CallanCustomer): Observable<CallanLessonEvent> {

        return new Observable<CallanLessonEvent>(observer => {
            this.getLessonEventsByTeacher(null).subscribe(lessonEvents => {
                observer.next(lessonEvents[0]);
                console.log(lessonEvents[0]);
                observer.complete();
            });
        });
    }

    changeLessonEventState(lessonEvent: CallanLessonEvent, state: number): Observable<CallanLessonEvent> {
        lessonEvent.state = state;
        return new Observable<CallanLessonEvent>(observer => {
            observer.next(lessonEvent);
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
