import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {CallanCustomer} from '../models/customer.model';
import {CallanCourse} from '../models/course.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanLessonEvent} from '../models/lesson-event.model';
import {CalendarEvent } from 'angular-calendar';

import {CallanLesson} from '../models/lesson.model';
import {CallanLessonEventStateEnum} from '../enums/lesson-event.state.enum';
import {CallanBaseService} from './base.service';
import {AppConfig} from '../../app.config';
import {CallanCourseStage} from '../models/course-stage.model';
import {Subject} from 'rxjs';
import {CallanCourseCompetence} from '../models/course-competence.model';
import {AppDataFilter} from '../models/data-filter.model';


@Injectable()
export abstract class CallanLessonService extends CallanBaseService {

    protected isLessonEventShown$ = new BehaviorSubject<boolean>(false);

    protected currentLessonEvent$ = new BehaviorSubject<CallanLessonEvent>(null);

    protected isLessonEventsUpdated$ = new Subject<void>();

    static createCourseProgress(): CallanCourseProgress {
        return new CallanCourseProgress();
    }

    static createCourseSpeciality(): CallanCourseCompetence {
        return new CallanCourseCompetence();
    }

    static createCourse(): CallanCourse {
        return new CallanCourse();
    }

    static createCourseStage(): CallanCourseStage {
        return new CallanCourseStage();
    }

    static createLessonEvent(): CallanLessonEvent {
        return new CallanLessonEvent();
    }

    static createLesson(): CallanLesson {
        return new CallanLesson();
    }

    static initLessonEvent(lessonEvent: CallanLessonEvent) {
        lessonEvent.duration = 60;
        lessonEvent.title = '';
        lessonEvent.state = CallanLessonEventStateEnum.PLANNED;
    }

    static convertLessonEventToCalendarEvent(lessonEvent: CallanLessonEvent, isStudentInfo?: boolean, isTeacherInfo?: boolean): CalendarEvent {

        const endMinutes = lessonEvent.duration % 60;
        const endHours = Math.floor(lessonEvent.duration / 60);

        const endDate = new Date(lessonEvent.startTime);
        endDate.setHours(lessonEvent.startTime.getHours() + endHours);
        endDate.setMinutes(lessonEvent.startTime.getMinutes() + endMinutes);

        const subTitle = lessonEvent.courseProgress ? lessonEvent.courseProgress.course.title : '';
        let title = lessonEvent.title ? (subTitle ? lessonEvent.title + '(' + subTitle + ')' : '') : subTitle;

        if (isStudentInfo) {
            title += lessonEvent.student ? '<br/>Student: ' + lessonEvent.student.getFullName() : '';
        }

        if (isTeacherInfo) {
            title += lessonEvent.teacher ? '<br/>Teacher: ' + lessonEvent.teacher.getFullName() : '';
        }

        return {
            start: lessonEvent.startTime,
            end: endDate,
            title: title,
            color: {
                primary: '#ad2121',
                secondary:
                    '#FAE3E3'
            },
            meta: lessonEvent
        };
    }

    static getLessonEventStateName(value) {
        switch (value) {
            case(CallanLessonEventStateEnum.PLANNED):
                return 'Planned';
            case(CallanLessonEventStateEnum.STARTED):
                return 'Started';
            case(CallanLessonEventStateEnum.COMPLETED):
                return 'Completed';
            case(CallanLessonEventStateEnum.CONFIRMED):
                return 'Confirmed';
            case(CallanLessonEventStateEnum.CANCELED):
                return 'Canceled';
        }
    }

    static countCompletedLessonEvents(lessonEvents: CallanLessonEvent[], courseProgressId: number): number {
        return lessonEvents.filter(lessonEvent => (lessonEvent.state === CallanLessonEventStateEnum.COMPLETED || lessonEvent.state === CallanLessonEventStateEnum.CONFIRMED) && lessonEvent.courseProgress && lessonEvent.courseProgress.id === courseProgressId).length;
    }

    abstract getLessonEvents(courseProgress: CallanCourseProgress): Observable<CallanLessonEvent[]>;

    abstract getLessonEventsByStudent(student: CallanCustomer): Observable<CallanLessonEvent[]>;

    abstract getLessonEventsByTeacher(teacher: CallanCustomer): Observable<CallanLessonEvent[]>;

    abstract findLessonEvents(dataFilter: AppDataFilter): Observable<CallanLessonEvent[]>;

    abstract getLessonEvent(id: number): Observable<CallanLessonEvent>;

    abstract saveLessonEvent(lessonEvent: CallanLessonEvent): Observable<CallanLessonEvent>;

    abstract getCourseProgresses(customer: CallanCustomer): Observable<CallanCourseProgress[]>;

    abstract getCourseProgress(id: number): Observable<CallanCourseProgress>;

    abstract saveCourseProgress(progress: CallanCourseProgress): Observable<CallanCourseProgress>;

    abstract getCourseCompetences(customer: CallanCustomer): Observable<CallanCourseCompetence[]>;

    abstract getCourseCompetencesByCourse(course: CallanCourse): Observable<CallanCourseCompetence[]>;

    abstract getCourseCompetence(id: number): Observable<CallanCourseCompetence>;

    abstract saveCourseCompetence(courseCompetency: CallanCourseCompetence): Observable<CallanCourseCompetence>;

    abstract deleteCourseCompetence(courseCompetency: CallanCourseCompetence): Observable<boolean>;

    abstract getAllCourses(): Observable<CallanCourse[]>;

    abstract getNearestStudentLessonEvent(student: CallanCustomer): Observable<CallanLessonEvent>;

    abstract getNearestTeacherLessonEvent(teacher: CallanCustomer): Observable<CallanLessonEvent>;

    abstract changeLessonEventState(lessonEvent: CallanLessonEvent, state: number, reason?: string): Observable<CallanLessonEvent>;

    abstract mapDataToCourse(course: CallanCourse, row: any): void;

    abstract mapDataToCourseProgress(courseProgress: CallanCourseProgress, row: any): void;

    abstract mapCourseProgressToData(courseProgress: CallanCourseProgress): object;

    abstract mapDataToLessonEvent(lessonEvent: CallanLessonEvent, row: any): void;

    abstract mapLessonEventToData(lessonEvent: CallanLessonEvent): object;

    abstract mapDataToLesson(lesson: CallanLesson, row: any): void;

    abstract mapDataToCourseStage(courseStage: CallanCourseStage, row: any): void;

    abstract mapDataToCourseCompetence(courseCompetence: CallanCourseCompetence, row: any): void;

    abstract mapCourseCompetencyToData(courseCompetence: CallanCourseCompetence): object;

    constructor(
        protected appConfig: AppConfig
    ) {
        super(appConfig);
    }

    reset() {
        this.setCurrentLessonEvent(null);
        this.setIsLessonEventShown(false);
    }

    setCurrentLessonEvent(lessonEvent: CallanLessonEvent) {
        this.currentLessonEvent$.next(lessonEvent);
    }

    getCurrentLessonEvent$(): BehaviorSubject<CallanLessonEvent> {
        return this.currentLessonEvent$;
    }

    getIsLessonEventShown$(): BehaviorSubject<boolean> {
        return this.isLessonEventShown$;
    }

    getIsLessonEventsUpdated$(): Subject<void> {
        return this.isLessonEventsUpdated$;
    }

    setIsLessonEventShown(value): boolean {
        if (value !== this.isLessonEventShown$.getValue()) {
            this.isLessonEventShown$.next(value);
        }

        return value;
    }

    toggleIsLessonEventShown(): void {
        if (this.isLessonEventShown$.getValue()) {
            this.setIsLessonEventShown(false);
        } else {
            this.setIsLessonEventShown(true);
        }
    }
}
