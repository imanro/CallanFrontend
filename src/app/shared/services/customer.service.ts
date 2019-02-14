import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

// import {CallanCustomersModule} from '../callan.module';
import {CallanCustomer} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {environment} from '../../../environments/environment';
import {AppEnvironmentNameEnum} from '../enums/environment.name.enum';
import {CallanBaseService} from './base.service';
import {CallanRole} from '../models/role.model';

import {mockRoles} from '../data/mock-roles';
import {CallanAuthService} from './auth.service';
import {AppConfig} from '../../app.config';
import {CallanRoleNameEnum} from '../enums/role.name.enum';
import {CallanLessonService} from './lesson.service';
import {CallanGeneralEvent} from '../models/general-event.model';
import {CalendarEvent } from 'angular-calendar';

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

    static createGeneralEvent(): CallanGeneralEvent {
        return new CallanGeneralEvent();
    }

    static hasCustomerRole(customer: CallanCustomer, roleName: string) {
        for (const role of customer.roles) {
            if (role.name === roleName) {
                return true;
            }
        }

        return false;
    }

    static getCustomerAvatarInitials(customer: CallanCustomer): string {
        return customer.firstName.charAt(0).toUpperCase() + customer.lastName.charAt(0).toUpperCase();
    }

    static convertGeneralEventToCalendarEvent(generalEvent: CallanGeneralEvent): CalendarEvent {

        return {
            start: generalEvent.startTime,
            end: generalEvent.endTime,
            title: generalEvent.title,
            color: {
                primary: '#5744ff',
                secondary:
                    '#dcecfc'
            }
        };
    }

    constructor(
        protected appConfig: AppConfig,
        protected authService: CallanAuthService
    ) {
        super(appConfig);
        console.log('constr', authService);
    }

    abstract getCustomers(): Observable<CallanCustomer[]>;

    abstract findCustomers(term: string): Observable<CallanCustomer[]>;

    abstract getCustomer(id: number): Observable<CallanCustomer>;

    abstract findCustomerByEmail(email): Observable<CallanCustomer>;

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
                if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {
                    // only if it is not set yet
                    if (!this.currentCustomer) {
                        this.setCurrentCustomer(customer);
                    }
                } else {
                    this.setCurrentCustomer(customer);
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

    initNewCustomer(customer: CallanCustomer): Observable<void> {

        return new Observable<void>(observer => {
            customer.isActive = true;
            customer.roles = [];

            this.getRoles().subscribe(roles => {

                for (const role of roles){
                    if (role.name === CallanRoleNameEnum.STUDENT) {
                        customer.roles.push(role);
                    }
                }

                console.log('Customer initialized');

                if (environment.name === AppEnvironmentNameEnum.DEV) {
                    this.initNewCustomerDev(customer).subscribe(() => {
                        console.log('Customer initialized for dev');
                        observer.next();
                        observer.complete();
                    });
                } else {
                    observer.next();
                    observer.complete();
                }
            });

        });
    }

    abstract mapDataToCustomer(customer: CallanCustomer, row: any): void;

    abstract mapCustomerToData(customer: CallanCustomer): object;

    abstract mapDataToRole(role: CallanRole, row: any): void;

    abstract mapRoleToData(role: CallanRole): object;

    abstract autoUpdateTimezone(customer: CallanCustomer): Observable<void>;

    abstract checkGoogleAuth(customer: CallanCustomer): Observable<boolean>;

    abstract getGoogleCalendarEvents(customer: CallanCustomer, startDate: Date, endDate: Date): Observable<CallanGeneralEvent[]>;

    abstract getGoogleAuthLink(customer: CallanCustomer): Observable<string|boolean>;

    abstract mapDataToGeneralEvent(generalEvent: CallanGeneralEvent, row: any): void;

    initNewCustomerDev(customer: CallanCustomer): Observable<void> {

        return new Observable<void>(observer => {
            customer.email = 'simon@bbc.com';
            customer.firstName = 'Simon';
            customer.lastName = 'McCoy';

            observer.next();
            observer.complete();
        });
    }
}
