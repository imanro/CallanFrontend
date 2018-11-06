import {CallanBaseModel} from './base.model';
import {CallanCustomer} from './customer.model';

export class CallanScheduleRange extends CallanBaseModel {
    id: number;
    customer: CallanCustomer;
    date?: Date;
    type: string; // inclusive/exclusive
    regularity: string; // regular / ad-hoc
    dayOfWeek: number;
    startMinutes: number; // in minutes
    endMinutes: number;
}
