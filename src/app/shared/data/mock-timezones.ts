import {CallanTimezone} from '../models/timezone.model';

const timezoneData = [
    {
        id: 1,
        country: 'Ukraine',
        name: 'Europe/Kiev',
        code: ' EET/EEST',
        offset: '+0200'
    }
];

const mockTimezones = [];

for (const row of timezoneData) {
    mockTimezones.push(Object.assign(new CallanTimezone(), row));
}

export {mockTimezones};
