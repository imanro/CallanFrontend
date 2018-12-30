import {Injectable} from '@angular/core';
import {CallanBaseService} from './base.service';
import {CallanTimezone} from '../models/timezone.model';
import {Observable} from 'rxjs';

@Injectable()
export abstract class CallanDateService extends CallanBaseService {

    static createTimeZone() {
        return new CallanTimezone();
    }

    abstract getTimezones(): Observable<CallanTimezone[]>;

    abstract mapDataToTimezone(timezone: CallanTimezone, row: any): void;
}
