import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {delay} from 'rxjs/operators';

import {CallanCustomer} from '../models/callan-customer.model';
import {CallanCourse} from '../models/callan-course.model';

import {CallanLessonService} from './lesson.service';

import {mockCourses} from '../data/mock-courses';
import {mockProgresses} from '../data/mock-course-progresses';
import {CallanCourseProgress} from '../models/callan-course-progress.model';
import {AppConfig, IAppConfig} from '../../app.config';

@Injectable()
export class CallanLessonMockService extends CallanLessonService {

    constructor(
        @Inject(AppConfig) private appConfig: IAppConfig
    ) {
        super();
    }

    assignCourseProgresses(customer: CallanCustomer) {
        const result = [];
        for (const id in mockProgresses) {
            if (mockProgresses.hasOwnProperty(id)) {
                const row = mockProgresses[id];
                if (row.customer.id === customer.id) {
                    result.push(row);
                }
            }
        }

        this.courseProgresses$.next(result);
        // this.courseProgresses$.complete();
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
}
