import {CallanBaseModel} from './base.model';
import {CallanRole} from './role.model';

export class CallanCustomer extends CallanBaseModel {
    id: number;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    roles: CallanRole[];

    getFullName?(): string {
        return this.lastName && this.firstName ? this.lastName + ' ' + this.firstName : this.firstName;
    }
}
