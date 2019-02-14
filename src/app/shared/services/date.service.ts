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

    abstract getTimezones(): Observable<CallanTimezone[]>;

    abstract mapDataToTimezone(timezone: CallanTimezone, row: any): void;
}
