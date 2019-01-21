import {CallanBaseModel} from './base.model';
import {CallanRole} from './role.model';
import {CallanTimezone} from './timezone.model';

export class CallanCustomer extends CallanBaseModel {
    id: number;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    description: string;
    roles: CallanRole[];
    availableHourInAdvanceMin: number;
    timezone: CallanTimezone;

    getFullName?(): string {
        return this.lastName && this.firstName ? this.lastName + ' ' + this.firstName : this.firstName;
    }
}
