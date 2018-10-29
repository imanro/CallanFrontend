import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {delay} from 'rxjs/operators';
import {map, catchError, mergeMap} from 'rxjs/operators';
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
import {HttpClient} from '@angular/common/http';
import {CallanError} from '../models/error.model';

@Injectable()
export class CallanLessonApiService extends CallanLessonService {

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig,
        protected customerService: CallanCustomerService,
        protected http: HttpClient
    ) {
        super(appConfig);
    }

    getAllCourses(): Observable<CallanCourse[]> {
        const url = this.getApiUrl('/Courses');

        return this.http.get<CallanCourse[]>(url)
            .pipe(
                map<any, CallanCourse[]>(rows => {

                    const courses: CallanCourse[] = [];

                    for (const row of rows) {
                        const course = CallanLessonService.createCourse();
                        this.mapDataToCourse(course, row);
                        courses.push(course);
                    }

                    return courses;
                }),
                catchError(this.handleHttpError<CallanCourse[]>())
            );
    }

    getCourseProgresses(customer: CallanCustomer): Observable<CallanCourseProgress[]> {

        const url = this.getApiUrl('/CourseProgresses?filter=' + JSON.stringify({
            where: {customerId: customer.id},
            include: ['Course', 'Customer']
        }));

        return this.http.get<CallanCourseProgress[]>(url)
            .pipe(
                map<any, CallanCourseProgress[]>(rows => {

                    const progresses: CallanCourseProgress[] = [];

                    for (const row of rows ) {
                        const progress = CallanLessonService.createCourseProgress();
                        this.mapDataToCourseProgress(progress, row);
                        progresses.push(progress);
                    }

                    return progresses;
                }),
                catchError(this.handleHttpError<CallanCourseProgress[]>())
            );
    }

    getCourseProgress(id: number): Observable<CallanCourseProgress> {

        const url = this.getApiUrl('/CourseProgresses/' + id + '?filter=' + JSON.stringify({
            include: ['Course', 'Customer']
        }));

        return this.http.get<CallanCourseProgress>(url)
            .pipe(
                map<any, CallanCourseProgress>(row => {
                        const progress = CallanLessonService.createCourseProgress();
                        this.mapDataToCourseProgress(progress, row);
                        return progress;
                }),
                catchError(this.handleHttpError<CallanCourseProgress>())
            );
    }

    saveCourseProgress(progress: CallanCourseProgress): Observable<CallanCourseProgress> {

        const data = this.mapCourseProgressToData(progress);

        const url = this.getApiUrl('/CourseProgresses');

        console.log('We have prepared the following data:', data);

        return this.http.post(url, data)
            .pipe(
                mergeMap(responseData => {
                    console.log('The response is follow:', responseData);
                    return this.getCourseProgress(responseData['id']);
                }),
                catchError(this.handleHttpError<CallanCourseProgress>())
            );
    }

    getLessonEvents(customer: CallanCustomer): Observable<CallanLessonEvent[]> {

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
                            this.initLessonEvent(lessonEvent);
                            lessonEvent.student = currentCustomer;
                            lessonEvent.teacher = anotherCustomer;
                        }

                        console.log('alls done', list);
                        observer.next(list);
                    }
                });
        });
    }

    getNearestLessonEvent(customer: CallanCustomer): Observable<CallanLessonEvent> {

        return new Observable<CallanLessonEvent>(observer => {
            this.getLessonEvents(customer).subscribe(lessonEvents => {
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
        course.id = row.id;
        course.title = row.title;
    }

    mapDataToCourseProgress(courseProgress: CallanCourseProgress, row: any, isRelationsMandatory = true): void {
        courseProgress.id = row.id;
        courseProgress.completedLessonEventsCount = Number(row.completedLessonEventsCount);

        if (row.Customer) {
            const customer = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(customer, row.Customer);
            courseProgress.customer = customer;
        } else {
            if (isRelationsMandatory) {
                throw new CallanError('Customer data isn\'t present in API response')
            }
        }

        if (row.Course) {
            const course = CallanLessonService.createCourse();
            this.mapDataToCourse(course, row.Course);
            courseProgress.course = course;
        } else {
            if (isRelationsMandatory) {
                throw new CallanError('Course data isn\'t present in API response')
            }
        }
    }

    mapCourseProgressToData(progress: CallanCourseProgress): object {
        const data: any = {};
        data.id = progress.id;
        data.completedLessonEventsCount = progress.completedLessonEventsCount;

        data.customerId = progress.customer.id;
        data.courseId = progress.course.id;

        return data;
    }
}
