import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {CallanCustomer} from '../models/customer.model';
import {CallanCourse} from '../models/course.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanLessonEvent} from '../models/lesson-event.model';
import {CalendarEvent } from 'angular-calendar';

import {combineLatest as observableCombineLatest} from 'rxjs/observable/combineLatest';
import {CallanLesson} from '../models/lesson.model';
import {CallanLessonEventStateEnum} from '../enums/lesson-event.state.enum';
import {CallanBaseService} from './base.service';
import {AppConfig, IAppConfig} from '../../app.config';
import {CallanCourseStage} from '../models/course-stage.model';


@Injectable()
export abstract class CallanLessonService extends CallanBaseService {

    protected isLessonDetailsShown = false;
    protected isLessonDetailsShown$ = new BehaviorSubject<boolean>(false);

    static createCourseProgress(): CallanCourseProgress {
        return new CallanCourseProgress();
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

    static convertLessonEventToCalendarEvent(lessonEvent: CallanLessonEvent): CalendarEvent {

        const endMinutes = lessonEvent.duration % 60;
        const endHours = Math.floor(lessonEvent.duration / 60);

        const endDate = new Date(lessonEvent.startTime);
        endDate.setHours(lessonEvent.startTime.getHours() + endHours);
        endDate.setMinutes(lessonEvent.startTime.getMinutes() + endMinutes);

        console.log('end date now:', endDate, endMinutes, endHours, lessonEvent.duration);

        return {
            start: lessonEvent.startTime,
            end: endDate,
            title: lessonEvent.title,
            color: {
                primary: '#ad2121',
                secondary:
                    '#FAE3E3'
            }
        };
    }

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig
    ) {
        super(appConfig);
    }

    abstract getLessonEvents(courseProgress: CallanCourseProgress, customer?: CallanCustomer): Observable<CallanLessonEvent[]>;

    abstract getLessonEvent(id: number): Observable<CallanLessonEvent>;

    abstract getCourseProgresses(customer: CallanCustomer): Observable<CallanCourseProgress[]>;

    abstract saveCourseProgress(progress: CallanCourseProgress): Observable<CallanCourseProgress>;

    abstract saveLessonEvent(lessonEvent: CallanLessonEvent): Observable<CallanLessonEvent>;

    abstract getAllCourses(): Observable<CallanCourse[]>;

    abstract getCourseProgress(id: number): Observable<CallanCourseProgress>;

    // CHECKME: signature (does the lessonEvents needed here?)
    abstract getNearestLessonEvent(customer: CallanCustomer): Observable<CallanLessonEvent>;

    // CHECKME: signature (does the lessonEvents needed here?)
    abstract getDatesEnabled(lessonEvents: CallanLessonEvent[], previousDates: Date[]): Observable<Date[]>;

    abstract changetLessonEventState(lessonEvent: CallanLessonEvent, state: number): Observable<boolean>;

    abstract mapDataToCourse(course: CallanCourse, row: any): void;

    abstract mapDataToCourseProgress(courseProgress: CallanCourseProgress, row: any): void;

    abstract mapCourseProgressToData(courseProgress: CallanCourseProgress): object;

    abstract mapDataToLessonEvent(lessonEvent: CallanLessonEvent, row: any): void;

    abstract mapLessonEventToData(lessonEvent: CallanLessonEvent): object;

    abstract mapDataToLesson(lesson: CallanLesson, row: any): void;

    abstract mapDataToCourseStage(courseStage: CallanCourseStage, row: any): void;

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
