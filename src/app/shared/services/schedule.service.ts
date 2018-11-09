import {CallanBaseService} from './base.service';
import {CallanScheduleRange} from '../models/schedule-range.model';
import {CallanScheduleRangeTypeEnum} from '../enums/schedule-range.type.enum';
import {CallanScheduleRangeRegularityEnum} from '../enums/schedule-range.regularity.enum';
import {Observable} from 'rxjs';
import {CallanCustomer} from '../models/customer.model';

export abstract class CallanScheduleService extends CallanBaseService {

    static createScheduleRange(): CallanScheduleRange {
        return new CallanScheduleRange();
    }

    static groupScheduleRanges(scheduleRanges: CallanScheduleRange[], regularity, type?): {[dayNumber: number]: CallanScheduleRange[]} {
        const sortedStruct = {};
        for (const scheduleRange of scheduleRanges) {
            if (scheduleRange.regularity === regularity && (!type || scheduleRange.type === type)) {
                if (sortedStruct[scheduleRange.dayOfWeek] === undefined) {
                    sortedStruct[scheduleRange.dayOfWeek] = [];
                }

                sortedStruct[scheduleRange.dayOfWeek].push(scheduleRange);
            }
        }

        return sortedStruct;
    }

    static splitGrouopedScheduleRanges(groupedScheduleRanges: { [dayNumber: number]: CallanScheduleRange[] }):
        { [dayNumber: number]: CallanScheduleRange[] } {

        const sortedStruct: { [dayNumber: number]: CallanScheduleRange[] } = {};

        for (const dayNumber in groupedScheduleRanges) {
            if (groupedScheduleRanges.hasOwnProperty(dayNumber)) {
                const scheduleRanges = groupedScheduleRanges[dayNumber];

                const inclusives: CallanScheduleRange[] = scheduleRanges.filter(function (scheduleRange) {
                    return scheduleRange.type === CallanScheduleRangeTypeEnum.INCLUSIVE
                });
                const exclusives: CallanScheduleRange[] = scheduleRanges.filter(function (scheduleRange) {
                    return scheduleRange.type === CallanScheduleRangeTypeEnum.EXCLUSIVE
                });

                const inclusiveIntersects = CallanScheduleService.intersectScheduleRangesInclusive(inclusives);
                sortedStruct[dayNumber] = inclusiveIntersects;

                // first, count intersection of inclusive ranges. If neighbor ranges are intersects (start time of 2nd
                // is <= end time of 1st), create common range from two (just by setting End time of first to
                // End time of 2nd IF ITS bigger and skipping of second's)

                // than, by each non-intersecting range

                // by each exclusive range

                // if not processed

                // if exclusive begun earlier, put it first, register as processed

                // if its end time is bigger than inclusive's, skip inclusive

                // if not (end time intersects with inclusive), set new start time of inclusive, put inclusive in stack
            }
        }

        return sortedStruct;
    }

    static intersectScheduleRangesInclusive(scheduleRanges: CallanScheduleRange[]) {
        const inclusiveIntersects = [];
        const processedInclusive = {};

        for (const range1 of scheduleRanges) {

            if (processedInclusive[range1.id] === undefined) {
                console.log('DAY:', range1.dayOfWeek);
                for (const range2 of scheduleRanges) {
                    if (range1.id !== range2.id && range2.dayOfWeek === range1.dayOfWeek) {
                        if (range2.startMinutes <= range1.endMinutes) {
                            console.log('INTERSECTS');
                            // intersects
                            if (range2.endMinutes > range1.endMinutes) {
                                console.log('FIXING');
                                range1.endMinutes = range2.endMinutes;
                                processedInclusive[range2.id] = true;
                            }

                            // dont process crossing range anyway
                            processedInclusive[range2.id] = true;
                        }
                    }
                }

                inclusiveIntersects.push(range1);
                processedInclusive[range1.id] = true;
            }

        }
        return inclusiveIntersects;
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

    initScheduleRange(scheduleRange: CallanScheduleRange) {

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

    abstract saveScheduleRange(scheduleRange: CallanScheduleRange): Observable<CallanScheduleRange>;
}
