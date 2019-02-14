import {CallanBaseService} from './base.service';
import {CallanScheduleRange} from '../models/schedule-range.model';
import {CallanScheduleRangeTypeEnum} from '../enums/schedule-range.type.enum';
import {CallanScheduleRangeRegularityEnum} from '../enums/schedule-range.regularity.enum';
import {Observable} from 'rxjs';
import {CallanCustomer} from '../models/customer.model';
import {CallanCourse} from '../models/course.model';
import {CallanCourseProgress} from '../models/course-progress.model';
import {CallanLessonEvent} from '../models/lesson-event.model';
import {CallanDateService} from './date.service';
import {CallanGeneralEvent} from '../models/general-event.model';

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
        const dayMinutes = 24 * 60;

        if (minutes >= dayMinutes) {
            minutes -= dayMinutes;
        }

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

    static isScheduleDateAvailable(checkDate: Date, scheduleDates: Date[]) {
        for (const date of scheduleDates) {
            if(date.getTime() - 60000 < checkDate.getTime() && date.getTime() + 60000 > checkDate.getTime()) {
                return true;
            }
        }

        return false;
    }

    static isScheduleDatesAvailable(checkDates: Date[], scheduleDates: Date[]) {
        for (const checkDate of checkDates) {
            const res = CallanScheduleService.isScheduleDateAvailable(checkDate, scheduleDates);

            if (!res) {
                return res;
            }
        }

        return true;
    }

    static isNotLessonEventsOverlapesDate(checkDate: Date, lessonEvents: CallanLessonEvent[]) {
        for (const lessonEvent of lessonEvents) {

            const endTime = new Date(lessonEvent.startTime.getTime() + (60000 * lessonEvent.duration));

            const res = endTime.getTime() <= checkDate.getTime() || lessonEvent.startTime.getTime() > checkDate.getTime();

            if (!res) {
                console.log('lesson declines date', lessonEvent.startTime);
                return res;
            }
        }

        return true;
    }

    static isNotLessonEventsOverlapesDates(checkDates, lessonEvents: CallanLessonEvent[]) {
        for (const checkDate of checkDates) {
            const res = CallanScheduleService.isNotLessonEventsOverlapesDate(checkDate, lessonEvents);

            if (!res) {
                return res;
            }
        }

        return true;
    }

    static isNotGeneralEventsOverlapesDate(checkDate: Date, generalEvents: CallanGeneralEvent[]) {
        for (const generalEvent of generalEvents) {

            const res = generalEvent.endTime.getTime() <= checkDate.getTime() || generalEvent.startTime.getTime() > checkDate.getTime();

            if (!res) {
                console.log('general event declines date', generalEvent.startTime);
                return res;
            }
        }

        return true;
    }

    static isNotGeneralEventsOverlapesDates(checkDates, generalEvents: CallanGeneralEvent[]) {
        for (const checkDate of checkDates) {
            const res = CallanScheduleService.isNotGeneralEventsOverlapesDate(checkDate, generalEvents);

            if (!res) {
                return res;
            }
        }

        return true;
    }

    static checkLessonTime(lessonEvent: CallanLessonEvent, datesEnabled: Date[], scheduleMinuteStep: number, lessonEvents: CallanLessonEvent[], generalEvents: CallanGeneralEvent[]): boolean {

        const amount = Math.floor(lessonEvent.duration / scheduleMinuteStep);
        const segments = CallanDateService.createSegmentsFromDate(lessonEvent.startTime, scheduleMinuteStep, amount);

        console.log('created sgm:', segments);

        let res = CallanScheduleService.isScheduleDatesAvailable(segments, datesEnabled);

        console.log('Received res:', res);

        if (res){
            // checking against lessonEvents
            res = CallanScheduleService.isNotLessonEventsOverlapesDates(segments, lessonEvents);
            console.log('Received lesson res:', res);
            if (res) {
                res = CallanScheduleService.isNotGeneralEventsOverlapesDates(segments, generalEvents);
                console.log('Received general res:', res);
                return res;
            } else {
                return res;
            }

        } else {
            return res;
        }
    }

    static initScheduleRange(scheduleRange: CallanScheduleRange) {

        const currentDate = new Date();
        scheduleRange.dayOfWeek = currentDate.getDay();
        scheduleRange.type = CallanScheduleRangeTypeEnum.INCLUSIVE;
        scheduleRange.regularity = CallanScheduleRangeRegularityEnum.REGULAR;

        scheduleRange.startMinutes = 60 * 9;
        scheduleRange.minutesAmount = 60;

        console.log(scheduleRange.dayOfWeek, 'ttt', (new Date()).getDay());

        scheduleRange.date = new Date();
        scheduleRange.date.setDate(currentDate.getDate());
    }

    static convertToUtcTime(scheduleRange: CallanScheduleRange) {
        const timezoneOffset = new Date().getTimezoneOffset();
        scheduleRange.startMinutes = scheduleRange.startMinutes + timezoneOffset;
        CallanScheduleService.fixScheduleRangeDayBoundMinutes(scheduleRange);
    }

    static convertToLocalTime(scheduleRange: CallanScheduleRange) {
        const timezoneOffset = new Date().getTimezoneOffset();

        scheduleRange.startMinutes = scheduleRange.startMinutes - timezoneOffset;
        CallanScheduleService.fixScheduleRangeDayBoundMinutes(scheduleRange);
    }

    static fixScheduleRangeDayBoundMinutes(scheduleRange: CallanScheduleRange) {
        if (scheduleRange.startMinutes < 0) {
            // if minutes is less than 0, move to previous day
            scheduleRange.startMinutes = 24 * 60 + scheduleRange.startMinutes;
            scheduleRange.dayOfWeek -= 1;
        } else if (scheduleRange.startMinutes >= 24 * 60) {
            scheduleRange.startMinutes = scheduleRange.startMinutes % (24 * 60);
            scheduleRange.dayOfWeek += 1;

            if (scheduleRange.dayOfWeek > 6) {
                scheduleRange.dayOfWeek = 0;
            }
        }
    }

    static getMinutesAmountByMinutesRange(startMinutes, endMinutes) {
        return endMinutes > 0 ? endMinutes - startMinutes : 24 * 60 - startMinutes;
    }

    abstract getScheduleRanges(customer: CallanCustomer): Observable<CallanScheduleRange[]>;

    abstract getScheduleRange(id: number): Observable<CallanScheduleRange>;

    abstract getDatesAvailable(startDate: Date, endDate: Date, courseProgress?: CallanCourseProgress, customer?: CallanCustomer, isLookupLessonEvents?: boolean): Observable<Date[]>;

    abstract saveScheduleRange(scheduleRange: CallanScheduleRange): Observable<CallanScheduleRange>;

    abstract deleteScheduleRange(scheduleRange: CallanScheduleRange): Observable<boolean>;

    abstract mapDataToScheduleRange(scheduleRange: CallanScheduleRange, row: any): void;

    abstract mapScheduleRangeToData(scheduleRange: CallanScheduleRange): object;
}
