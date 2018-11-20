import {CallanScheduleService} from './schedule.service';
import {Observable, throwError} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {CallanCustomer} from '../models/customer.model';
import {CallanScheduleRange} from '../models/schedule-range.model';
import {AppConfig} from '../../app.config';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CallanCustomerService} from './customer.service';
import {AppError} from '../models/error.model';
import {CallanScheduleRangeRegularityEnum} from '../enums/schedule-range.regularity.enum';

@Injectable()
export class CallanScheduleApiService extends CallanScheduleService {

    constructor(
        protected appConfig: AppConfig,
        protected customerService: CallanCustomerService,
        protected http: HttpClient
    ) {
        super(appConfig);
    }

    getScheduleRanges(customer: CallanCustomer): Observable<CallanScheduleRange[]> {
        const url = this.getApiUrl('/ScheduleRanges?filter=') + JSON.stringify({
            where: {customerId: customer.id},
            include: ['Customer']
        });

        return this.http.get<CallanScheduleRange[]>(url)
            .pipe(
                map<any, CallanScheduleRange[]>(rows => {

                    const scheduleRanges: CallanScheduleRange[] = [];

                    for (const row of rows) {
                        try {
                            const range = CallanScheduleService.createScheduleRange();
                            this.mapDataToScheduleRange(range, row);
                            scheduleRanges.push(range);
                        } catch (err) {
                            if (err.message) {
                                console.log(err.message);
                            }

                            continue;
                        }
                    }

                    return scheduleRanges;
                }),
                catchError(this.handleHttpError<CallanScheduleRange[]>())
            );
    }

    getScheduleRange(id: number): Observable<CallanScheduleRange> {

        const url = this.getApiUrl('/ScheduleRanges/') + id + '?filter=' + JSON.stringify({
            include: ['Customer']
        });

        return this.http.get<CallanScheduleRange>(url)
            .pipe(
                map<any, CallanScheduleRange|any>(row => {

                    try {
                        const range = CallanScheduleService.createScheduleRange();
                        this.mapDataToScheduleRange(range, row);
                        return range;

                    } catch (err) {
                        return throwError(err);
                    }

                }),
                catchError(this.handleHttpError<CallanScheduleRange>())
            );
    }

    saveScheduleRange(scheduleRange: CallanScheduleRange): Observable<CallanScheduleRange> {

        let data;

        try {
            data = this.mapScheduleRangeToData(scheduleRange);
        } catch (err) {
            return throwError(err);
        }
        console.log('We have prepared the following data:', data);

        if (scheduleRange.id) {
            const url = this.getApiUrl('/ScheduleRanges/' + scheduleRange.id);
            return this.http.put(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        return this.getScheduleRange(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanScheduleRange>())
                );
        } else {
            const url = this.getApiUrl('/ScheduleRanges');
            return this.http.post(url, data)
                .pipe(
                    mergeMap(responseData => {
                        console.log('The response is follow:', responseData);
                        return this.getScheduleRange(responseData['id']);
                    }),
                    catchError(this.handleHttpError<CallanScheduleRange>())
                );
        }
    }

    deleteScheduleRange(scheduleRange: CallanScheduleRange): Observable<boolean> {
        const url = this.getApiUrl('/ScheduleRanges/' + scheduleRange.id);
        return this.http.delete<boolean>(url)
            .pipe(
                map(() => {
                    return true;
                }),
                catchError(this.handleHttpError<boolean>())
            );
    }

    getHoursAvailable(startDate: Date, endDate: Date, customer?: CallanCustomer, isLookupLessonEvents = false): Observable<Date[]> {

        const params: any = {};

        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
        params.isLookupLessonEvents = isLookupLessonEvents;

        if (customer) {
            params.customerId = customer.id;
        }

        const url = this.getApiUrl('/ScheduleRanges/availableHours') + '?' + this.buildQueryString(params);
        console.log('querying for dates', url);

        return this.http.get<Date[]>(url)
            .pipe(
                map<any, Date[]>(rows => {

                    console.log('received', rows);

                    const result: Date[] = [];
                    for (const dateRow of rows) {
                        result.push(new Date(dateRow));
                    }

                    console.log(result, 'made');
                    return result;
                }),
                catchError(this.handleHttpError<Date[]>())
            );
    }

    mapDataToScheduleRange(scheduleRange: CallanScheduleRange, row: any): void {
        scheduleRange.id = row.id;
        scheduleRange.type = row.type;
        scheduleRange.dayOfWeek = row.dayOfWeek;

        if (row.regularity === CallanScheduleRangeRegularityEnum.AD_HOC) {
            if (row.date) {
                scheduleRange.date = new Date(row.date);
            } else {
                throw new AppError('Skipping adhoc schedulerange without of date ' + row.id);
            }
        }

        scheduleRange.regularity = row.regularity;
        scheduleRange.startMinutes = row.startMinutes;
        scheduleRange.endMinutes = row.endMinutes;

        if (row.Customer) {
            const customer = CallanCustomerService.createCustomer();
            this.customerService.mapDataToCustomer(customer, row.Customer);
            scheduleRange.customer = customer;
        }
    }

    mapScheduleRangeToData(scheduleRange: CallanScheduleRange): object {
        const data = {};
        data['id'] = scheduleRange.id;
        data['type'] = scheduleRange.type;
        data['regularity'] = scheduleRange.regularity;

        data['dayOfWeek'] = scheduleRange.dayOfWeek;
        data['startMinutes'] = scheduleRange.startMinutes;
        data['endMinutes'] = scheduleRange.endMinutes;

        if (scheduleRange.date && scheduleRange.regularity === CallanScheduleRangeRegularityEnum.AD_HOC) {
            data['date'] = scheduleRange.date.toISOString();
        }

        if (!scheduleRange.customer) {
            throw new AppError('Customer should be set in scheduleRange');
        } else {
            data['customerId'] = scheduleRange.customer.id;
        }

        return data;
    }
}
