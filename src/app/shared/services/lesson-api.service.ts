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
import {AppError} from '../models/error.model';
import {CallanLesson} from '../models/lesson.model';
import {CallanCourseStage} from '../models/course-stage.model';

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

    getLessonEvents(courseProgress: CallanCourseProgress): Observable<CallanLessonEvent[]> {

        const url = this.getApiUrl('/LessonEvents?filter=' + JSON.stringify({
            where: {courseProgressId: courseProgress.id},
            order: ['startTime ASC'],
            include: ['Teacher', 'Student', {CourseProgress: ['Course']}, {Lesson: ['Course']}]
        }));

        return this.http.get<CallanLessonEvent[]>(url)
            .pipe(
                map<any, CallanLessonEvent[]>(rows => {

                    const lessonEvents: CallanLessonEvent[] = [];

                    for (const row of rows) {
                        const lessonEvent = CallanLessonService.createLessonEvent();
                        this.mapDataToLessonEvent(lessonEvent, row);
                        lessonEvents.push(lessonEvent);
                    }

                    return lessonEvents;
                }),
                catchError(this.handleHttpError<CallanLessonEvent[]>())
            );

    }

    getLessonEventsByStudent(student: CallanCustomer = null): Observable<CallanLessonEvent[]> {

        const url = this.getApiUrl('/LessonEvents?filter=' + JSON.stringify({
            where: {studentId: student.id},
            order: ['startTime ASC'],
            include: ['Teacher', 'Student', {CourseProgress: ['Course']}, {Lesson: ['Course']}]
        }));

        return this.http.get<CallanLessonEvent[]>(url)
            .pipe(
                map<any, CallanLessonEvent[]>(rows => {

                    const lessonEvents: CallanLessonEvent[] = [];

                    for (const row of rows) {
                        const lessonEvent = CallanLessonService.createLessonEvent();
                        this.mapDataToLessonEvent(lessonEvent, row);
                        lessonEvents.push(lessonEvent);
                    }

                    return lessonEvents;
                }),
                catchError(this.handleHttpError<CallanLessonEvent[]>())
            );
    }

    getLessonEventsByTeacher(teacher: CallanCustomer = null): Observable<CallanLessonEvent[]> {

        const url = this.getApiUrl('/LessonEvents?filter=' + JSON.stringify({
            where: {teacherId: teacher.id},
            order: ['startTime ASC'],
            include: ['Teacher', 'Student', {CourseProgress: ['Course']}, {Lesson: ['Course']}]
        }));

        return this.http.get<CallanLessonEvent[]>(url)
            .pipe(
                map<any, CallanLessonEvent[]>(rows => {

                    const lessonEvents: CallanLessonEvent[] = [];

                    for (const row of rows) {
                        const lessonEvent = CallanLessonService.createLessonEvent();
                        this.mapDataToLessonEvent(lessonEvent, row);
                        lessonEvents.push(lessonEvent);
                    }

                    return lessonEvents;
                }),
                catchError(this.handleHttpError<CallanLessonEvent[]>())
            );
    }

    getLessonEvent(id: number): Observable<CallanLessonEvent> {
        const url = this.getApiUrl('/LessonEvents/' + id + '?filter=' + JSON.stringify({
            include: ['Teacher', 'Student', {CourseProgress: ['Course']}, {Lesson: ['Course']}]
        }));

        return this.http.get<CallanLessonEvent>(url)
            .pipe(
                map<any, CallanLessonEvent>(row => {

                    const lessonEvent = CallanLessonService.createLessonEvent();
                    this.mapDataToLessonEvent(lessonEvent, row);
                    return lessonEvent;
                }),
                catchError(this.handleHttpError<CallanLessonEvent>())
            );
    }

    getNearestStudentLessonEvent(student: CallanCustomer): Observable<CallanLessonEvent> {

        // Process this case: query the lesson event which status is not completed and time is not passed

        return new Observable<CallanLessonEvent>(observer => {
            this.getLessonEventsByStudent(student).subscribe(lessonEvents => {
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


    saveCourseProgress(progress: CallanCourseProgress): Observable<CallanCourseProgress> {

        const data = this.mapCourseProgressToData(progress);

        console.log('We have prepared the following data:', data);

        if (progress.id) {
            const url = this.getApiUrl('/CourseProgresses/' + progress.id);
            return this.http.put(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        return this.getCourseProgress(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanCourseProgress>())
                );
        } else {
            const url = this.getApiUrl('/CourseProgresses');
            return this.http.post(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        return this.getCourseProgress(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanCourseProgress>())
                );
        }
    }

    saveLessonEvent(lessonEvent: CallanLessonEvent): Observable<CallanLessonEvent> {
        const data = this.mapLessonEventToData(lessonEvent);
        console.log('We have prepared the following data:', data);

        if (lessonEvent.id) {
            // Peforming PUT
            const url = this.getApiUrl('/LessonEvents/' + lessonEvent.id);
            return this.http.put(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        this.getIsLessonEventsUpdated$().next();
                        return this.getLessonEvent(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanLessonEvent>())
                );

        } else {
            // Performing POST
            const url = this.getApiUrl('/LessonEvents');
            return this.http.post(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        this.getIsLessonEventsUpdated$().next();
                        return this.getLessonEvent(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanLessonEvent>())
                );
        }
    }

    changetLessonEventState(lessonEvent: CallanLessonEvent, state: number): Observable<CallanLessonEvent> {
        lessonEvent.state = state;
        return this.saveLessonEvent(lessonEvent);
    }

    mapDataToCourse(course: CallanCourse, row: any): void {
        course.id = row.id;
        course.title = row.title;
    }

    mapDataToCourseProgress(courseProgress: CallanCourseProgress, row: any, isRelationsMandatory = true): void {
        courseProgress.id = row.id;
        courseProgress.completedLessonEventsCount = Number(row.completedLessonEventsCount);
        courseProgress.lessonEventsBalance = Number(row.lessonEventsBalance);

        if (row.Customer) {
            const customer = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(customer, row.Customer);
            courseProgress.customer = customer;
        } else {
            if (isRelationsMandatory) {
                throw new AppError('Customer data isn\'t present in API response')
            }
        }

        if (row.Course) {
            const course = CallanLessonService.createCourse();
            this.mapDataToCourse(course, row.Course);
            courseProgress.course = course;
        } else {
            if (isRelationsMandatory) {
                throw new AppError('Course data isn\'t present in API response')
            }
        }
    }

    mapCourseProgressToData(progress: CallanCourseProgress): object {
        const data: any = {};

        if (progress.id) {
            data.id = progress.id;
        }

        if (progress.completedLessonEventsCount !== undefined) {
            data.completedLessonEventsCount = progress.completedLessonEventsCount;
        }

        if (progress.lessonEventsBalance !== undefined) {
            data.lessonEventsBalance = progress.lessonEventsBalance;
        }

        data.customerId = progress.customer.id;
        data.courseId = progress.course.id;

        return data;
    }

    mapDataToLessonEvent(lessonEvent: CallanLessonEvent, row: any): void {
        lessonEvent.id = row.id;
        lessonEvent.duration = row.duration;
        lessonEvent.startTime = new Date(row.startTime);
        lessonEvent.state = row.state;

        const courseProgress = CallanLessonService.createCourseProgress();
        this.mapDataToCourseProgress(courseProgress, row.CourseProgress, false);
        lessonEvent.courseProgress = courseProgress;

        if (row.Student) {
            const student = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(student, row.Student);
            lessonEvent.student = student;
        }

        if (row.Teacher) {
            const teacher = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(teacher, row.Teacher);
            lessonEvent.teacher = teacher;
        }

        if (row.Lesson) {
            const lesson = CallanLessonService.createLesson();
            this.mapDataToLesson(lesson, row.Lesson);
            lessonEvent.lesson = lesson;
        }
    }

    mapLessonEventToData(lessonEvent: CallanLessonEvent): object {
        const data: any = {};

        data.duration = lessonEvent.duration;
        data.state = lessonEvent.state;
        data.startTime = lessonEvent.startTime.toISOString();
        data.courseProgressId = lessonEvent.courseProgress.id;

        if (!lessonEvent.teacher && !lessonEvent.student) {
            throw new AppError('Either student or teacher should be set for lessonEvent');
        } else {

            if (lessonEvent.teacher) {
                data.teacherId = lessonEvent.teacher.id;
            }

            if (lessonEvent.student) {
                data.studentId = lessonEvent.student.id;
            }
        }

        return data;
    }

    mapDataToLesson(lesson: CallanLesson, row: any): void {
        lesson.id = row.id;
        lesson.title = row.title;

        if (row.Course) {
            const course = CallanLessonService.createCourse();
            this.mapDataToCourse(course, row.Course);
            lesson.course = course;
        }

        if (row.CourseStage) {
            const courseStage = CallanLessonService.createCourseStage();
            this.mapDataToCourse(courseStage, row.CourseStage);
            lesson.courseStage = courseStage;
        }
    }

    mapDataToCourseStage(courseStage: CallanCourseStage, row: any): void {

    }
}
