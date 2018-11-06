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

    abstract getScheduleRanges(customer: CallanCustomer, type: string): Observable<CallanScheduleRange[]>;

    abstract getScheduleRange(id: number): Observable<CallanScheduleRange>;

    abstract saveScheduleRange(scheduleRange: CallanScheduleRange): Observable<CallanScheduleRange>;
}
