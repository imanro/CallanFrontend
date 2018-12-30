import {Injectable} from '@angular/core';
import {CallanTimezone} from '../models/timezone.model';
import {Observable} from 'rxjs';
import {CallanDateService} from './date.service';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable()
export class CallanDateApiService extends CallanDateService {

    constructor(
        protected appConfig: AppConfig,
        protected http: HttpClient
    ) {
        super(appConfig);
    }

    getTimezones(): Observable<CallanTimezone[]> {
        const url = this.getApiUrl('/TimeZones?filter=') + JSON.stringify({order: ['offset ASC', 'name ASC']});

        return this.http.get<CallanTimezone[]>(url)
            .pipe(
              map<any, CallanTimezone[]>(rows => {
                 const cont = [];

                 for (const row of rows) {
                     const timezone = CallanDateService.createTimeZone();
                     this.mapDataToTimezone(timezone, row);
                     cont.push(timezone);
                 }

                 return cont;
              })
            );
    }

    mapDataToTimezone(timezone: CallanTimezone, row: any): void {
        timezone.id = row.id;
        timezone.name = row.name;
        timezone.code = row.code;
        timezone.country = row.country;
        timezone.offset = row.offset;
    }

}
