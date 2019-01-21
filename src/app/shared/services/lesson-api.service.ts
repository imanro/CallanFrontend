import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {map, catchError, mergeMap, delay} from 'rxjs/operators';
import {AppConfig} from '../../app.config';


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
import {CallanCourseCompetence} from '../models/course-competence.model';

@Injectable()
export class CallanLessonApiService extends CallanLessonService {

    constructor(
        protected appConfig: AppConfig,
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
            include: ['Course', 'Customer', 'PrimaryTeacher']
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
            include: ['Course', 'Customer', 'PrimaryTeacher']
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

    getCourseCompetences(customer: CallanCustomer): Observable<CallanCourseCompetence[]> {

        const url = this.getApiUrl('/CourseCompetences?filter=' + JSON.stringify({
            where: {customerId: customer.id},
            include: ['Course', 'Customer']
        }));

        return this.http.get<CallanCourseCompetence[]>(url)
            .pipe(
                map<any, CallanCourseCompetence[]>(rows => {

                    const competences: CallanCourseCompetence[] = [];

                    for (const row of rows ) {
                        const speciality = CallanLessonService.createCourseSpeciality();
                        this.mapDataToCourseCompetence(speciality, row);
                        competences.push(speciality);
                    }

                    return competences;
                }),
                catchError(this.handleHttpError<CallanCourseCompetence[]>())
            );
    }

    getCourseCompetencesByCourse(course: CallanCourse): Observable<CallanCourseCompetence[]> {
        const url = this.getApiUrl('/CourseCompetences?filter=' + JSON.stringify({
            where: {courseId: course.id},
            include: ['Course', 'Customer']
        }));

        return this.http.get<CallanCourseCompetence[]>(url)
            .pipe(
                map<any, CallanCourseCompetence[]>(rows => {

                    const competences: CallanCourseCompetence[] = [];

                    for (const row of rows ) {
                        const speciality = CallanLessonService.createCourseSpeciality();
                        this.mapDataToCourseCompetence(speciality, row);
                        competences.push(speciality);
                    }

                    return competences;
                }),
                catchError(this.handleHttpError<CallanCourseCompetence[]>())
            );
    }

    getCourseCompetence(id: number): Observable<CallanCourseCompetence> {
        const url = this.getApiUrl('/CourseCompetences/' + id + '?filter=' + JSON.stringify({
            include: ['Course', 'Customer']
        }));

        return this.http.get<CallanCourseCompetence>(url)
            .pipe(
                map<any, CallanCourseCompetence>(row => {

                    const speciality = CallanLessonService.createCourseSpeciality();
                    this.mapDataToCourseCompetence(speciality, row);
                    return speciality;

                }),
                catchError(this.handleHttpError<CallanCourseCompetence>())
            );
    }

    saveCourseCompetence(courseSpeciality: CallanCourseCompetence): Observable<CallanCourseCompetence> {
        const data = this.mapCourseCompetencyToData(courseSpeciality);

        console.log('We have prepared the following data:', data);

        if (courseSpeciality.id) {
            const url = this.getApiUrl('/CourseCompetences/' + courseSpeciality.id);
            // Checkme: -> patch
            return this.http.put(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        return this.getCourseCompetence(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanCourseCompetence>())
                );
        } else {
            const url = this.getApiUrl('/CourseCompetences');
            return this.http.post(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        return this.getCourseCompetence(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanCourseCompetence>())
                );
        }
    }

    deleteCourseCompetence(courseSpeciality: CallanCourseCompetence): Observable<boolean> {
        const url = this.getApiUrl('/CourseCompetences/' + courseSpeciality.id);

        return this.http.delete<boolean>(url)
            .pipe(
                map<any, boolean>(row => {
                    return (row.count && Number(row.count) > 0);
                }),
                catchError(this.handleHttpError<boolean>())
            );
    }

    getLessonEvents(courseProgress: CallanCourseProgress): Observable<CallanLessonEvent[]> {

        const url = this.getApiUrl('/LessonEvents?filter=' + JSON.stringify({
            where: {courseProgressId: courseProgress.id},
            order: ['state ASC', 'startTime ASC'],
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
            order: ['state ASC', 'startTime ASC'],
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
            order: ['state ASC', 'startTime ASC'],
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

        const url = this.getApiUrl('/LessonEvents/nearestStudentLessonEvent?studentId=' + student.id +
            '&include=' + JSON.stringify(['Teacher', 'Student', {CourseProgress: ['Course']}, {Lesson: ['Course']}]));

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

    getNearestTeacherLessonEvent(student: CallanCustomer): Observable<CallanLessonEvent> {

        const url = this.getApiUrl('/LessonEvents/nearestTeacherLessonEvent?teacherId=' + student.id +
            '&include=' + JSON.stringify(['Teacher', 'Student', {CourseProgress: ['Course']}, {Lesson: ['Course']}]));

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


    saveCourseProgress(progress: CallanCourseProgress): Observable<CallanCourseProgress> {

        const data = this.mapCourseProgressToData(progress);

        console.log('We have prepared the following data:', data);

        if (progress.id) {
            const url = this.getApiUrl('/CourseProgresses/' + progress.id);
            // Checkme: -> patch
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
            // Peforming PATCH
            const url = this.getApiUrl('/LessonEvents/' + lessonEvent.id);
            // Checkme: -> patch
            return this.http.patch(url, data)
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

    changeLessonEventState(lessonEvent: CallanLessonEvent, state: number, reason?: string): Observable<CallanLessonEvent> {
        lessonEvent.state = state;

        if (reason) {
            lessonEvent.cancelationReason = reason;
        }

        return this.saveLessonEvent(lessonEvent);
    }

    mapDataToCourse(course: CallanCourse, row: any): void {
        course.id = row.id;
        course.title = row.title;
        course.teacherChoice = row.teacherChoice;
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

        if (row.PrimaryTeacher) {
            const teacher = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(teacher, row.PrimaryTeacher);
            courseProgress.primaryTeacher = teacher;
            console.log('Primary teacher assigned', courseProgress.primaryTeacher);
        }
    }

    mapCourseProgressToData(progress: CallanCourseProgress): object {
        const data: any = {};

        if (progress.id) {
            data.id = progress.id;
        }

        if (progress.lessonEventsBalance !== undefined) {
            data.lessonEventsBalance = progress.lessonEventsBalance;
        }

        data.customerId = progress.customer.id;
        data.courseId = progress.course.id;

        if (progress.primaryTeacher) {
            data.primaryTeacherId = progress.primaryTeacher.id;
        }

        return data;
    }

    mapDataToLessonEvent(lessonEvent: CallanLessonEvent, row: any): void {
        lessonEvent.id = row.id;
        lessonEvent.duration = row.duration;
        lessonEvent.startTime = new Date(row.startTime);
        lessonEvent.state = row.state;
        lessonEvent.cancelationReason = row.cancelationReason;

        if (row.CourseProgress) {
            const courseProgress = CallanLessonService.createCourseProgress();
            this.mapDataToCourseProgress(courseProgress, row.CourseProgress, false);
            lessonEvent.courseProgress = courseProgress;
        }

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

        data.cancelationReason = lessonEvent.cancelationReason;

        if (lessonEvent.courseProgress) {
            data.courseProgressId = lessonEvent.courseProgress.id;
        }

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
            this.mapDataToCourseStage(courseStage, row.CourseStage);
            lesson.courseStage = courseStage;
        }
    }

    mapDataToCourseStage(courseStage: CallanCourseStage, row: any): void {

    }

    mapDataToCourseCompetence(courseSpeciality: CallanCourseCompetence, row: any): void {
        courseSpeciality.id = row.id;

        if (row.Course) {
            const course = CallanLessonService.createCourse();
            this.mapDataToCourse(course, row.Course);
            courseSpeciality.course = course;
        }

        if (row.Customer) {
            const customer = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(customer, row.Customer);
            courseSpeciality.customer = customer;
        }
    }

    mapCourseCompetencyToData(courseSpeciality: CallanCourseCompetence): object {

        const data: any = {};

        if (courseSpeciality.customer) {
            data.customerId = courseSpeciality.customer.id;
        }

        if (courseSpeciality.course) {
            data.courseId = courseSpeciality.course.id;
        }

        return data;
    }
}
