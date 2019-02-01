import {CallanBaseModel} from './base.model';
import {CallanCustomer} from './customer.model';

export class CallanScheduleRange extends CallanBaseModel {
    id: number;
    customer: CallanCustomer;
    date?: Date;
    type: number; // inclusive/exclusive
    regularity: number; // regular / ad-hoc
    dayOfWeek: number;
    startMinutes: number; // in minutes
    minutesAmount: number;
    timezoneOffset: number; // for saving in db
}
