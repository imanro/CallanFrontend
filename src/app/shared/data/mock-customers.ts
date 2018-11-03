import {CallanCustomer} from '../models/customer.model';
import {mockRoles} from './mock-roles';

const roleAdmin = mockRoles[0];
const roleTeacher = mockRoles[1];
const roleStudent = mockRoles[2];


const customerData = [
    {
        id: 2,
        email: 'roman.denisov@biscience.com',
        firstName: 'Roman',
        lastName: 'Denisov',
        roles: [roleTeacher, roleAdmin]
    },
    {
        id: 3,
        email: 'tertia@gmail.com',
        firstName: 'Tertia',
        lastName: 'Fourie',
        roles: [roleStudent]
    }
];


const mockCustomers: CallanCustomer[] = [];

for (const row of customerData ) {
    mockCustomers.push(Object.assign(new CallanCustomer(), row));
}



export { mockCustomers };
