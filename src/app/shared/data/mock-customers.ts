import {CallanCustomer} from '../models/callan-customer.model';

const customerData = [
    {
        id: 2,
        email: 'roman.denisov@biscience.com',
        firstName: 'Roman',
        lastName: 'Denisov'
    },
    {
        id: 3,
        email: 'tertia@gmail.com',
        firstName: 'Tertia',
        lastName: 'Fourie'
    }
];

const mockCustomers: CallanCustomer[] = [];

for (const row of customerData ) {
    mockCustomers.push(Object.assign(new CallanCustomer(), row));
}



export { mockCustomers };
