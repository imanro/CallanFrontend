import {CallanBaseModel} from './base.model';

export class CallanGeneralEvent extends CallanBaseModel {
    id: number;
    title: string;
    startTime: Date;
    endTime: Date;
}
