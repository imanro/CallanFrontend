import {Injectable} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {map, catchError, delay} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

// import { CallanCustomersModule } from '../callan.module';
import {CallanCustomerService} from './customer.service';
import {CallanCustomer} from '../models/customer.model';
import {AppConfig} from '../../app.config';
import {CallanRole} from '../models/role.model';
import {CallanRoleNameEnum} from '../enums/role.name.enum';
import {AppError} from '../models/error.model';
import {CallanAuthService} from './auth.service';
import {CallanTimezone} from '../models/timezone.model';
import {CallanDateService} from './date.service';

@Injectable()
export class CallanCustomerApiService extends CallanCustomerService {

    constructor(
        protected appConfig: AppConfig,
        protected authService: CallanAuthService,
        protected dateService: CallanDateService,
        protected http: HttpClient
    ) {
        super(appConfig, authService);
    }

    getCustomers(): Observable<CallanCustomer[]> {
        const url = this.getApiUrl('/Customers?filter=' + JSON.stringify({include: ['roles', 'Timezone']}));

        return this.http.get<CallanCustomer[]>(url)
            .pipe(
                map<any, CallanCustomer[]>(rows => {

                    const  customers: CallanCustomer[] = [];

                    for (const row of rows) {
                        const customer = CallanCustomerService.createCustomer();
                        this.mapDataToCustomer(customer, row);
                        customers.push(customer);
                    }

                    return customers;
                }),
                catchError(this.handleHttpError<CallanCustomer[]>())
            );
    }

    findCustomers(term: string): Observable<CallanCustomer[]> {
        const filter = {include: ['roles', 'Timezone'], where: {email: {like: '___'}}};
        const url = this.getApiUrl('/Customers?filter=' + JSON.stringify(filter).replace('___', encodeURI(term + '%')));

        return this.http.get<CallanCustomer[]>(url)
            .pipe(
                map<any, CallanCustomer[]>(rows => {

                    const  customers: CallanCustomer[] = [];

                    for (const row of rows) {
                        const customer = CallanCustomerService.createCustomer();
                        this.mapDataToCustomer(customer, row);
                        customers.push(customer);
                    }

                    return customers;
                }),
                catchError(this.handleHttpError<CallanCustomer[]>())
            );
    }


    getCustomer(id: number): Observable<CallanCustomer> {
        const url = this.getApiUrl('/Customers/' + id + '?filter=' + JSON.stringify({include: ['roles', 'Timezone']}));

        return this.http.get<CallanCustomer>(url)
            .pipe(
                map<any, CallanCustomer>(row => {
                    const customer = CallanCustomerService.createCustomer();
                    this.mapDataToCustomer(customer, row);
                    return customer;
                }),
                catchError(this.handleHttpError<CallanCustomer>())
            );
    }

    findCustomerByEmail(email: string): Observable<CallanCustomer> {
        const url = this.getApiUrl('/Customers/findOne?filter=' + JSON.stringify({where: {email: email}, include: ['roles', 'Timezone']}));

        return this.http.get<CallanCustomer>(url)
            .pipe(
                map<any, CallanCustomer>(row => {
                    const customer = CallanCustomerService.createCustomer();
                    this.mapDataToCustomer(customer, row);
                    return customer;
                }),
                catchError(err => {
                    if (err.status === 404) {
                        return observableOf(null);
                    } else {
                        console.log('handling');
                        return this.throwFriendlyError(err);
                    }
                })
            );
    }

    getRoles(): Observable<CallanRole[]> {
        const url = this.getApiUrl('/Roles');

        return this.http.get<CallanRole[]>(url)
            .pipe(
                map<any, CallanRole[]>(rows => {

                    const roles: CallanRole[] = [];

                    for (const row of rows) {
                        const role = CallanCustomerService.createRole();
                        this.mapDataToRole(role, row);
                        roles.push(role);
                    }

                    return roles;
                }),
                catchError(this.handleHttpError<CallanRole[]>())
            );
    }

    autoUpdateTimezone(customer: CallanCustomer): Observable<void> {

        console.log('Auto updating customer timezone');
        const url = this.getApiUrl('/Customers/' + customer.id);
        const data = {timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone};
        console.log('Patch to', url, 'with', data);

        return this.http.patch(url, data)
            .pipe(
                map<any, void>(rows => {
                    console.log('The result was', rows);
                    return;
                })
            );
    }

    checkGoogleAuth(customer: CallanCustomer): Observable<boolean> {

        console.log('Checking Google Auth');
        const url = this.getApiUrl('/Customers/checkGoogleAuth');

        return this.http.get(url)
            .pipe(
                map<any, boolean>(response => {
                    if (response.status) {
                        return response.status;
                    } else {
                        return false;
                    }
                }),
                catchError(this.handleHttpError<boolean>())
            );
    }

    getGoogleAuthLink(customer: CallanCustomer): Observable<string|boolean> {
        console.log('Getting auth link from Google');
        const url = this.getApiUrl('/Customers/authGoogle');

        return this.http.get(url)
            .pipe(
                map<any, boolean>(response => {
                    if (response.url) {
                        return response.url;
                    } else {
                        return false;
                    }
                }),
                catchError(this.handleHttpError<boolean>())
            );
    }

    saveCustomer(customer: CallanCustomer): Observable<CallanCustomer> {

        const data = this.mapCustomerToData(customer);
        console.log('We have prepared the following data:', data);

        if (customer.id) {
            console.log('Existing customer case');
            const url = this.getApiUrl('/Customers/' + customer.id);
            console.log('Patch to', url);

            return this.http.patch(url, data)
                .pipe(
                    map<any, CallanCustomer>(responseData => {
                        console.log('The response is follow:', responseData);
                        const newCustomer = CallanCustomerService.createCustomer();
                        this.mapDataToCustomer(newCustomer, responseData);
                        return newCustomer;
                    }),
                    catchError(this.handleHttpError<CallanCustomer>())
                );
        } else {
            const url = this.getApiUrl('/Customers');
            console.log('New customer case');
            return this.http.post(url, data)
                .pipe(
                    map<any, CallanCustomer>(responseData => {
                        console.log('The response is follow:', responseData);
                        const newCustomer = CallanCustomerService.createCustomer();
                        this.mapDataToCustomer(newCustomer, responseData);
                        return newCustomer;
                    }),
                    catchError(this.handleHttpError<CallanCustomer>())
                );
        }

    }

    mapDataToCustomer(customer: CallanCustomer, row: any): void {
        {
            customer.id = row.id;
            customer.firstName = row.firstName;
            customer.lastName = row.lastName;
            customer.email = row.email;
            customer.availableHourInAdvanceMin = row.availableHourInAdvanceMin;
            customer.created = new Date(row.created);
            customer.isActive = (row.isActive === true || row.isActive === 1) || false;
            customer.description = row.description;

            if (row.roles) {

                customer.roles = [];

                for (const roleRow of row.roles) {
                    const role = CallanCustomerService.createRole();
                    this.mapDataToRole(role, roleRow);

                    if (!customer.roles.find(r => r.name === role.name)) {
                        customer.roles.push(role);
                    }
                }
            }

            if (row.Timezone) {
                const timezone = CallanDateService.createTimeZone();
                this.dateService.mapDataToTimezone(timezone, row.Timezone);
                customer.timezone = timezone;
            }
        }
    }

    mapDataToRole(role: CallanRole, row: any): void {
        {
            switch (row.name) {
                case(CallanRoleNameEnum.ADMIN):
                case(CallanRoleNameEnum.STUDENT):
                case(CallanRoleNameEnum.SUPPORT):
                case(CallanRoleNameEnum.TEACHER):
                    role.name = row.name;
                    break;
                default:
                    throw new AppError('Unknown role given');
            }


            role.id = row.id;
        }
    }

    mapCustomerToData(customer: CallanCustomer): object {
        const data: any = {};

        if (customer.id){
            data.id = customer.id;
        }

        data.firstName = customer.firstName;
        data.lastName = customer.lastName;
        data.email = customer.email;
        data.isActive = customer.isActive;
        data.description = customer.description;
        data.availableHourInAdvanceMin = customer.availableHourInAdvanceMin;

        if (customer.password) {
            data.password = customer.password;
        }

        if (customer.roles) {
            data.roles = [];

            for (const role of customer.roles) {
                data.roles.push(this.mapRoleToData(role));
            }
        }

        if (customer.timezone) {
            data.timezoneId = customer.timezone.id;
        }

        return data;
    }

    mapRoleToData(role: CallanRole): object {
        const data: any = {};
        data.id = role.id;
        data.name = role.name;
        return data;
    }
}
