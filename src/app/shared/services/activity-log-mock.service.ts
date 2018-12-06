import {Injectable} from '@angular/core';
import {CallanActivityLogService} from './activity-log.service';
import {CallanActivityLog} from '../models/activity-log.model';
import {Observable} from 'rxjs';
import {mockActivityLogItems} from '../data/mock-activity-log-items';
import {delay} from 'rxjs/operators';

@Injectable()
export class CallanActivityLogMockService extends CallanActivityLogService {
    getActivityLogItems(limit?, offset = 0): Observable<CallanActivityLog[]> {
        const d = this.appConfig.mockDelayMs;

        return new Observable<CallanActivityLog[]>(observer => {
            observer.next(mockActivityLogItems);
            observer.complete();
        }).pipe(
            delay(d)
        );
    }

    findActivityLogItems(term: string, affectedId?: number, initiatorId?: number, limit?, offset = 0): Observable<CallanActivityLog[]> {
        const d = this.appConfig.mockDelayMs;

        if (term) {
            term = term.toLowerCase();
        }

        return new Observable<CallanActivityLog[]>(observer => {

            let rows: CallanActivityLog[];

            if (term) {
                rows = mockActivityLogItems.filter(row => {
                    console.log('search for', row.message, term, row.message.indexOf(term));
                    return row.message.toLowerCase().indexOf(term) !== -1;
                });
            } else {
                rows = mockActivityLogItems;
            }

            observer.next(rows);
            observer.complete();

        }).pipe(
            delay(d)
        );
    }

    getActivityLogItemsCount(term?: string, affectedId?: number, initiatorId?: number, limit?, offset?): Observable<number> {
        return new Observable<number>(observer => {
           observer.next(mockActivityLogItems.length);
           observer.complete();
        });
    }

    mapDataToActivityLog(activityLogItem: CallanActivityLog, row: any): void {
    }

}
