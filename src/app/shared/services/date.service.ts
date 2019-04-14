import {Injectable} from '@angular/core';
import {CallanBaseService} from './base.service';
import {CallanTimezone} from '../models/timezone.model';
import {Observable} from 'rxjs';

@Injectable()
export abstract class CallanDateService extends CallanBaseService {

    static createTimeZone() {
        return new CallanTimezone();
    }

    static createSegmentsFromDate(baseDate: Date, minutesLength: number, amount: number): Date[] {
        const stack: Date[] = [];
        for (let i = 0; i < amount; i++) {
            stack.push(new Date(baseDate.getTime() + ((minutesLength * 60000) * i)));
        }

        return stack;
    }

    static getHoursPartOfHourlyConvertedMinutes(min) {
        return Math.floor(min / 60);
    }

    static getMinutesPartOfHourlyConvertedMinutes(min) {
        return min % 60;
    }

    static formatMinutesAsHoursString(min) {
        // 119
        const hoursPart = CallanDateService.getHoursPartOfHourlyConvertedMinutes(min);
        const minutesPart = CallanDateService.getMinutesPartOfHourlyConvertedMinutes(min);

        if (minutesPart) {
            return `${hoursPart} h. ${minutesPart} min.`;
        } else {
            return `${hoursPart} h.`;
        }
    }

    static convertHoursMinutesToMinutes(hours, minutes) {
        return Number(hours) * 60 + Number(minutes);
    }

    abstract getTimezones(): Observable<CallanTimezone[]>;

    abstract mapDataToTimezone(timezone: CallanTimezone, row: any): void;
}
