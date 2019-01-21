import {CallanBaseService} from './base.service';
import {CallanScheduleRange} from '../models/schedule-range.model';
import {CallanScheduleRangeTypeEnum} from '../enums/schedule-range.type.enum';
import {CallanScheduleRangeRegularityEnum} from '../enums/schedule-range.regularity.enum';
import {Observable} from 'rxjs';
import {CallanCustomer} from '../models/customer.model';
import {CallanCourse} from '../models/course.model';
import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanLessonEvent} from '../models/lesson-event.model';

export abstract class CallanScheduleService extends CallanBaseService {

    static createScheduleRange(): CallanScheduleRange {
        return new CallanScheduleRange();
    }

    static groupScheduleRanges(scheduleRanges: CallanScheduleRange[], regularity, type?): {[dayNumber: number]: CallanScheduleRange[]} {
        const sortedStruct = {};
        for (const scheduleRange of scheduleRanges) {
            if (scheduleRange.regularity === regularity && (!type || scheduleRange.type === type)) {

                let dayOfWeek;

                if (regularity === CallanScheduleRangeRegularityEnum.AD_HOC) {
                    if (!scheduleRange.date) {
                        console.warn('Skipping adhoc schedule range without date', scheduleRange);
                        continue;

                    } else {
                        dayOfWeek = scheduleRange.date.getDay();
                    }

                } else {
                    dayOfWeek = scheduleRange.dayOfWeek;
                }

                if (sortedStruct[dayOfWeek] === undefined) {
                    sortedStruct[dayOfWeek] = [];
                }

                sortedStruct[dayOfWeek].push(scheduleRange);
            }
        }

        return sortedStruct;
    }

    static convertMinutesToTimeString(minutes, isMilitaryFormat = false) {
        const hoursValue = Math.floor(minutes / 60);
        let minutesValue: string;

        if (Math.floor(minutes % 60) < 10) {
            minutesValue = '0' + Math.floor(minutes % 60);
        } else {
            minutesValue = Math.floor(minutes % 60).toString();
        }

        if (isMilitaryFormat) {
            return hoursValue + ':' + minutesValue;
        } else {
            if (hoursValue === 0) {
                return '12:' + minutesValue + ' AM';
            } else if (hoursValue < 12 ) {
                return hoursValue + ':' + minutesValue + ' AM';
            } else if (hoursValue === 12 ) {
                return hoursValue + ':' + minutesValue + ' PM';
            } else {
                return hoursValue - 12 + ':' + minutesValue + ' PM';
            }
        }
    }

    static getWeekDatesRangeForDate(date: Date): Date[] {
        // checking request's date's day number

        console.log('date on input:', date);

        const dateFrom = new Date(date.getTime());
        const dateTo = new Date(date.getTime());

        dateFrom.setHours(0, 0, 0, 0);

        dateTo.setHours(23, 59, 59, 999);

        let dayOfWeek = date.getDay();
        if (dayOfWeek === 0) {
            dayOfWeek = 7;
        }

        dateFrom.setDate(date.getDate() - (dayOfWeek - 1));
        dateTo.setDate(date.getDate() + (7 - dayOfWeek));

        return [dateFrom, dateTo];
    }

    static getLessonEndTime(lessonEvent: CallanLessonEvent, scheduleMinuteStep: number): number {
        return Math.round(lessonEvent.startTime.getTime() - (lessonEvent.startTime.getTime() % (scheduleMinuteStep * 60000))) + (lessonEvent.duration * 60000);
    }

    static isDateAvailable(checkDate: Date, dates: Date[]) {
        for (const date of dates) {
            if(date.getTime() - 60000 < checkDate.getTime() && date.getTime() + 60000 > checkDate.getTime()) {
                return true;
            }
        }

        return false;
    }

    static checkLessonDurationAgainstDatesEnabled(lessonEvent: CallanLessonEvent, datesEnabled: Date[], scheduleMinuteStep: number) {
        const endTime = CallanScheduleService.getLessonEndTime(lessonEvent, scheduleMinuteStep);
        return CallanScheduleService.isDateAvailable(new Date(endTime - (scheduleMinuteStep * 60000)), datesEnabled);
    }

    static initScheduleRange(scheduleRange: CallanScheduleRange) {

        const currentDate = new Date();
        scheduleRange.dayOfWeek = currentDate.getDay();
        scheduleRange.type = CallanScheduleRangeTypeEnum.INCLUSIVE;
        scheduleRange.regularity = CallanScheduleRangeRegularityEnum.REGULAR;

        scheduleRange.startMinutes = 60 * 9;
        scheduleRange.endMinutes = 60 * 10;

        console.log(scheduleRange.dayOfWeek, 'ttt', (new Date()).getDay());

        scheduleRange.date = new Date();
        scheduleRange.date.setDate(currentDate.getDate());
    }

    abstract getScheduleRanges(customer: CallanCustomer): Observable<CallanScheduleRange[]>;

    abstract getScheduleRange(id: number): Observable<CallanScheduleRange>;

    abstract getDatesAvailable(startDate: Date, endDate: Date, courseProgress?: CallanCourseProgress, customer?: CallanCustomer, isLookupLessonEvents?: boolean): Observable<Date[]>;

    abstract saveScheduleRange(scheduleRange: CallanScheduleRange): Observable<CallanScheduleRange>;

    abstract deleteScheduleRange(scheduleRange: CallanScheduleRange): Observable<boolean>;

    abstract mapDataToScheduleRange(scheduleRange: CallanScheduleRange, row: any): void;

    abstract mapScheduleRangeToData(scheduleRange: CallanScheduleRange): object;
}
