import {Injectable} from '@angular/core';
import {CallanTimezone} from '../models/timezone.model';
import {Observable} from 'rxjs';
import {CallanDateService} from './date.service';
import {of as observableOf} from 'rxjs';
import {mockTimezones} from '../data/mock-timezones';

@Injectable()
export class CallanDateMockService extends CallanDateService {
    getTimezones(): Observable<CallanTimezone[]> {
        return observableOf(mockTimezones);
    }

    mapDataToTimezone(timezone: CallanTimezone, row: any): void {
    }

}
