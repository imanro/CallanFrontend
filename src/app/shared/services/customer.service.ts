import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

// import {CallanCustomersModule} from '../callan.module';
import {CallanCustomer} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {environment} from '../../../environments/environment';
import {CallanEnvironmentNameEnum} from '../enums/environment.name.enum';
import {CallanBaseService} from './base.service';
import {CallanRole} from '../models/role.model';

import {mockRoles} from '../data/mock-roles';
import {CallanAuthService} from './auth.service';
import {AppConfig, IAppConfig} from '../../app.config';
import {CallanRoleNameEnum} from '../enums/role.name.enum';

@Injectable()
export abstract class CallanCustomerService extends CallanBaseService {

    protected authCustomer: CallanCustomer;

    private currentCustomer: CallanCustomer;
    private currentCustomer$ = new BehaviorSubject<CallanCustomer>(null);
    // private currentCustomer$ = new BehaviorSubject<CallanCustomer>(null);

    static createCustomer(): CallanCustomer {
        return new CallanCustomer();
    }

    static createRole(): CallanRole {
        return new CallanRole();
    }

    static hasCustomerRole(customer: CallanCustomer, roleName: string) {
        for (const role of customer.roles) {
            if (role.name === roleName) {
                return true;
            }
        }

        return false;
    }

    constructor(
        @Inject(AppConfig) protected appConfig: IAppConfig,
        protected authService: CallanAuthService
    ) {
        super(appConfig);
        console.log('constr', authService);
    }

    abstract getCustomers(): Observable<CallanCustomer[]>;

    abstract getCustomer(id: number): Observable<CallanCustomer>;

    abstract isCustomerExists(email)

    abstract getRoles(): Observable<CallanRole[]>;

    abstract saveCustomer(customer: CallanCustomer): Observable<CallanCustomer>;

    setAuthCustomer(customer: CallanCustomer) {
        this.authCustomer = customer;
    }

    getAuthCustomer(): Observable<CallanCustomer> {
        return new Observable<CallanCustomer>(observer => {
            if (!this.authCustomer) {

                const authData = this.authService.getAuthDataFromStorage();

                if (authData && authData.id) {
                    this.getCustomer(authData.id)
                        .subscribe(customer => {
                            this.setAuthCustomer(customer);
                            observer.next(customer);
                            observer.complete();
                        }, err => {
                            observer.error(err);
                            observer.complete();
                        });
                } else {
                    observer.next(null);
                    observer.complete();
                }

            } else {
                observer.next(this.authCustomer);
                observer.complete();
            }
        });
    }

    /*
    setCurrentCustomerOld(customer: CallanCustomer): BehaviorSubject<CallanCustomer> {
        this.currentCustomer$.next(customer);
        return this.currentCustomer$;
    }
    */

    setCurrentCustomer(customer: CallanCustomer): CallanCustomer {
        console.log('SetCurrentCustomer called');

        if (!customer || !this.currentCustomer || this.currentCustomer.id !== customer.id) {
            // to not double event of new customer
            this.currentCustomer = customer;
            this.currentCustomer$.next(customer);
        }

        return this.currentCustomer;
    }

    /**
     * For all customers, except of admin, current customer is the same as auth.service's authCustomer
     */

    /*
    getCurrentCustomerOld(): BehaviorSubject<CallanCustomer> {
        // first, let's check authCustomer's rights

        this.getAuthCustomer().subscribe(customer => {
            // check auth user rights
            if (!CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {
                console.log('Current customer isnt admin, set himself as current too');

                if (!this.currentCustomer.getValue() || this.currentCustomer.getValue().id !== customer.id) {
                    // console.log(this.currentCustomer.id, customer.id);
                    // to not produce additional events...
                    this.setCurrentCustomer(customer);
                }
            }
        });

        return this.currentCustomer;
    }
    */

    getCurrentCustomer(): Observable<CallanCustomer> {
        // first, let's check authCustomer's rights

        return new Observable<CallanCustomer>(observer => {
            this.getAuthCustomer().subscribe(customer => {
                if (!CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {
                    console.log('current customer set immediately because auth customer is not admin');
                    this.setCurrentCustomer(customer);
                } else {
                    console.log('current customer probably is not set while auth customer admin');
                }

                // return just current value
                observer.next(this.currentCustomer);
                observer.complete();
            });
        });
    }

    // subscription to observe when customer changes
    getCurrentCustomer$(): BehaviorSubject<CallanCustomer> {
        return this.currentCustomer$;
    }

    initCustomer(customer: CallanCustomer) {
        if (environment.name === CallanEnvironmentNameEnum.DEV) {
            this.initCustomerDev(customer);
        }
    }

    abstract mapDataToCustomer(customer: CallanCustomer, row: any): void;

    abstract mapCustomerToData(customer: CallanCustomer): object;

    abstract mapDataToRole(role: CallanRole, row: any): void;

    abstract mapRoleToData(role: CallanRole): object;

    initCustomerDev(customer: CallanCustomer) {
        customer.email = 'simon@bbc.com';
        customer.firstName = 'Simon';
        customer.lastName = 'McCoy';

        const roleStudent = mockRoles[1];

        customer.roles = [roleStudent];
    }
}
