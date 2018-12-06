import {mockCustomers} from './mock-customers';
import {CallanActivityLogRealmEnum} from '../enums/activity-log.realm.enum';
import {CallanActivityLogActionEnum} from '../enums/activity-log.action.enum';
import {CallanActivityLog} from '../models/activity-log.model';

const activityLogRowsData = [
    {
        id: 1,
        message: 'Something happened',
        initiator: mockCustomers[0],
        affected: mockCustomers[1],
        realm: CallanActivityLogRealmEnum.BALANCE,
        action: CallanActivityLogActionEnum.BALANCE_CHANGE
    },
];

const mockActivityLogItems: CallanActivityLog[] = [];

for (const row of activityLogRowsData ) {
    mockActivityLogItems.push(Object.assign(new CallanActivityLog(), row));
}


export { mockActivityLogItems };
