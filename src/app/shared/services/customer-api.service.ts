import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

// import { CallanCustomersModule } from '../callan.module';
import {CallanCustomerService} from './customer.service';
import {CallanCustomer} from '../models/customer.model';
import {AppConfig, IAppConfig} from '../../app.config';
import {CallanRole} from '../models/role.model';
import {CallanRoleNameEnum} from '../enums/role.name.enum';
import {AppError} from '../models/error.model';
import {CallanAuthService} from './auth.service';

@Injectable()
export class CallanCustomerApiService extends CallanCustomerService {

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig,
        protected authService: CallanAuthService,
        protected http: HttpClient
    ) {
        super(appConfig, authService);
    }

    getCustomers(): Observable<CallanCustomer[]> {
        const url = this.getApiUrl('/Customers?filter=' + JSON.stringify({include: ['roles']}));

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
        const url = this.getApiUrl('/Customers/' + id + '?filter=' + JSON.stringify({include: 'roles'}));

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

    isCustomerExists(email: string): Observable<boolean> {
        const url = this.getApiUrl('/Customers?filter=' + JSON.stringify({where: {email: email}}));

        return this.http.get<CallanCustomer>(url)
            .pipe(
                map<any, boolean>(rows => {
                    return rows.length > 0;
                }),
                catchError(this.handleHttpError<boolean>())
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

    saveCustomer(customer: CallanCustomer): Observable<CallanCustomer> {

        const data = this.mapCustomerToData(customer);

        const url = this.getApiUrl('/Customers');

        console.log('We have prepared the following data:', data);
        return this.http.post(url, data)
            .pipe(
                map<any, CallanCustomer>(responseData => {
                    console.log('The response is follow:', responseData);
                    const newCustomer = CallanCustomerService.createCustomer();
                    this.mapDataToCustomer(responseData, newCustomer);
                    return newCustomer;
                }),
                catchError(this.handleHttpError<CallanCustomer>())
            );
    }

    mapDataToCustomer(customer: CallanCustomer, row: any): void {
        {
            customer.id = row.id;
            customer.firstName = row.firstName;
            customer.lastName = row.lastName;
            customer.email = row.email;

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
        }
    }

    mapDataToRole(role: CallanRole, row: any): void {
        {
            switch (row['name']) {
                case(CallanRoleNameEnum.ADMIN):
                case(CallanRoleNameEnum.STUDENT):
                case(CallanRoleNameEnum.SUPPORT):
                case(CallanRoleNameEnum.TEACHER):
                    role.name = row['name'];
                    break;
                default:
                    throw new AppError('Unknown role given');
            }


            role.id = row['id'];
        }
    }

    mapCustomerToData(customer: CallanCustomer): object {
        const data = {};

        if (customer.id){
            data['id'] = customer.id;
        }

        data['firstName'] = customer.firstName;
        data['lastName'] = customer.lastName;
        data['email'] = customer.email;
        data['password'] = customer.password;

        if (customer.roles) {
            data['roles'] = [];

            for (const role of customer.roles) {
                data['roles'].push(this.mapRoleToData(role));
            }
        }

        return data;
    }

    mapRoleToData(role: CallanRole): object {
        const data = {};
        data['id'] = role.id;
        data['name'] = role.name;
        return data;
    }
}
