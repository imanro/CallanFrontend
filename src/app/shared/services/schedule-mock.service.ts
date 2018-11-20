import {CallanScheduleService} from './schedule.service';
import {Observable} from 'rxjs';
import {delay} from 'rxjs/operators';
import {mockScheduleRanges} from '../data/mock-schedule-ranges';
import {CallanCustomer} from '../models/customer.model';
import {CallanScheduleRange} from '../models/schedule-range.model';

export class CallanScheduleMockService extends CallanScheduleService {

    getScheduleRanges(customer: CallanCustomer): Observable<CallanScheduleRange[]> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanScheduleRange[]>(observer => {
           observer.next(mockScheduleRanges);
           observer.complete();
        }).pipe(
            delay(d)
        );
    }

    getScheduleRange(id: number): Observable<CallanScheduleRange> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanScheduleRange>(observer => {

            if (mockScheduleRanges.length > 0) {
                observer.next(mockScheduleRanges[0]);
            } else {
                observer.next(null);
            }
            observer.complete();
        }).pipe(
            delay(d)
        );
    }

    saveScheduleRange(scheduleRange: CallanScheduleRange): Observable<CallanScheduleRange> {
        const d = this.appConfig.mockDelayMs;
        return new Observable<CallanScheduleRange>(observer => {
            scheduleRange.id = mockScheduleRanges.length > 0 ? mockScheduleRanges[mockScheduleRanges.length - 1].id + 1 : 1;
            scheduleRange.dayOfWeek = Number(scheduleRange.dayOfWeek);
            mockScheduleRanges.push(scheduleRange);
            observer.next(scheduleRange);
            observer.complete();
        }).pipe(
            delay(d)
        );
    }

    deleteScheduleRange(scheduleRange: CallanScheduleRange): Observable<boolean> {

        const d = this.appConfig.mockDelayMs;

        return new Observable<boolean>(observer => {
            if (mockScheduleRanges.length > 0) {

                let index = null;
                for (let i = 0; i < mockScheduleRanges.length; i++){
                    const testRange = mockScheduleRanges[i];

                    if (testRange.id === scheduleRange.id) {
                        index = i;
                        break;
                    }

                    if (index !== null) {
                        delete mockScheduleRanges[index];
                    }

                    observer.next(true);
                }
            } else {
                observer.next(false);
            }

            observer.complete();
        }).pipe(
            delay(d)
        );
    }

    getHoursAvailable(startDate: Date, endDate: Date, customer?: CallanCustomer, isLookupLessonEvents = false): Observable<Date[]> {

        return new Observable<Date[]>(observer => {
            const segment1 = new Date();

            const result: Date[] = [];
            result.push(segment1);
            observer.next(result);
        });
    }

    mapDataToScheduleRange(scheduleRange: CallanScheduleRange, row: any): void {
    }

    mapScheduleRangeToData(scheduleRange: CallanScheduleRange): object {
        return {};
    }

}
