import {Injectable} from '@angular/core';
import {CallanActivityLogService} from './activity-log.service';
import {Observable} from 'rxjs';
import {CallanActivityLog} from '../models/activity-log.model';
import {CallanCustomerService} from './customer.service';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../../app.config';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class CallanActivityLogApiService extends CallanActivityLogService {

    constructor(
        protected appConfig: AppConfig,
        protected customerService: CallanCustomerService,
        protected http: HttpClient
    ) {
        super(appConfig);
    }

    getActivityLogItems(limit?, offset = 0): Observable<CallanActivityLog[]> {

        const filter = {include: ['Affected', 'Initiator'], order: ['date DESC']};

        if (limit) {
            filter['limit'] = limit;
            filter['skip'] = offset;
        }

        const url = this.getApiUrl('/ActivityLogs?filter=' + JSON.stringify(filter));

        return this.http.get<CallanActivityLog[]>(url)
            .pipe(
                map<any, CallanActivityLog[]>(rows => {

                    const items: CallanActivityLog[] = [];

                    for (const row of rows) {
                        const item = CallanActivityLogService.createActivityLog();
                        this.mapDataToActivityLog(item, row);
                        items.push(item);
                    }

                    return items;
                }),
                catchError(this.handleHttpError<CallanActivityLog[]>())
            );
    }

    findActivityLogItems(term?: string, affectedId?: number, initiatorId?: number, limit?, offset?): Observable<CallanActivityLog[]> {

        const filter = {
            include: ['Affected', 'Initiator'],
            order: ['date DESC'],
        };

        if (limit) {
            filter['limit'] = limit;
            filter['skip'] = offset;
        }

        filter['where'] = {};

        if (term) {
            filter['where']['message'] = {like: '___'};
        }

        if (affectedId) {
            filter['where']['affectedId'] = affectedId;
        }

        if (initiatorId) {
            filter['where']['initiatorId'] = initiatorId;
        }

        const url = this.getApiUrl('/ActivityLogs?filter=' + JSON.stringify(filter).replace('___', encodeURI('%' + term + '%')));

        return this.http.get<CallanActivityLog[]>(url)
            .pipe(
                map<any, CallanActivityLog[]>(rows => {

                    const items: CallanActivityLog[] = [];

                    for (const row of rows) {
                        const item = CallanActivityLogService.createActivityLog();
                        this.mapDataToActivityLog(item, row);
                        items.push(item);
                    }

                    return items;
                }),
                catchError(this.handleHttpError<CallanActivityLog[]>())
            );
    }

    getActivityLogItemsCount(term?: string, affectedId?: number, initiatorId?: number): Observable<number> {
        const where = {};
        if (term) {
            where['message'] = {like: '___'};
        }

        if (affectedId) {
            where['affectedId'] = affectedId;
        }

        if (initiatorId) {
            where['initiatorId'] = initiatorId;
        }

        const url = this.getApiUrl('/ActivityLogs/count?where=' + JSON.stringify(where).replace('___', encodeURI('%' + term + '%')));

        return this.http.get<number>(url)
            .pipe(
                map<any, number>(result => {
                    return Number(result.count);
                }),
                catchError(this.handleHttpError<number>())
            );
    }

    mapDataToActivityLog(activityLogItem: CallanActivityLog, row: any): void {
        activityLogItem.id = row.id;
        activityLogItem.action = row.action;
        activityLogItem.message = row.message;
        activityLogItem.realm = row.realm;
        activityLogItem.itemId = row.itemId;
        activityLogItem.date = new Date(row.date);

        if (row.Affected) {
            const affected = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(affected, row.Affected);
            activityLogItem.affected = affected;
        }

        if (row.Initiator) {
            const initiator = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(initiator, row.Initiator);
            activityLogItem.initiator = initiator;
        }
    }
}
