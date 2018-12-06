import {CallanBaseModel} from './base.model';
import {CallanCustomer} from './customer.model';

export class CallanActivityLog extends CallanBaseModel {
    id: number;
    message: string;
    date: Date;
    realm: number;
    action: string;
    itemId: number;
    initiator: CallanCustomer;
    affected: CallanCustomer;
}
