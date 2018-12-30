import {CallanBaseModel} from './base.model';

export class CallanTimezone extends CallanBaseModel {
    id: number;
    name: string;
    country: string;
    offset: string;
    code: string;
}
