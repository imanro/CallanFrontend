import {Component, OnDestroy, OnInit} from '@angular/core';
import {CallanCustomer} from '../shared/models/customer.model';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanAuthService} from '../shared/services/auth.service';
import {AppFormErrors} from '../shared/models/form-errors.model';
import {AppError} from '../shared/models/error.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanRoleNameEnum} from '../shared/enums/role.name.enum';
import {CallanLessonService} from '../shared/services/lesson.service';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {of as observableOf} from 'rxjs';

@Component({
    selector: 'app-callan-auth-container',
    templateUrl: './auth-container.component.html',
    styleUrls: ['./auth-container.component.scss']
})


export class CallanAuthContainerComponent implements OnInit, OnDestroy {

    view: string;
    formErrors$ = new BehaviorSubject<AppFormErrors>(null);
    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private authService: CallanAuthService,
        private customerService: CallanCustomerService,
        private lessonService: CallanLessonService
    ) {}

    ngOnInit() {
        this.setView(this.route.snapshot.url.join(''));

        this.location.subscribe(() => {
            this.setView(this.route.snapshot.url.join(''));
        });
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    handleLogin(loginCustomer: CallanCustomer) {
        console.log('Try to login', loginCustomer);

        this.authService.login(loginCustomer.email, loginCustomer.password)
            .subscribe(() => {
                this.customerService.getAuthCustomer()
                    .pipe(
                        mergeMap(customer => this.customerService.autoUpdateTimezone(customer)
                            .pipe(
                                map<void, CallanCustomer>(() => {
                                    console.log('back to customer', customer);
                                    return customer;
                                }),
                                catchError(err => {
                                    console.log(err, 'occured');
                                    return observableOf(customer);
                                })
                            )
                        )
                    )
                    .subscribe(customer => {

                        this.lessonService.reset();
                        // now, we can redirect to main area
                        // redirection will depend on the customer's roles

                        // admin: customer-manager, teacher, student: lesson-manager, support: claim-manager
                        if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {
                            console.log('will redirect to customers');
                            this.router.navigate(['/customers']);

                        } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.STUDENT)) {
                            console.log('redirect to lessons (student realm)');
                            this.router.navigate(['/lessons/student']);
                        } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.TEACHER)) {
                            console.log('redirect to lessons (teacher realm)');
                            this.router.navigate(['/lessons/teacher']);

                        } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.SUPPORT)) {
                            console.log('redirect to claim-manager');
                            this.router.navigate(['/lessons/student']);

                        } else {
                            console.log('redirect to lessons anyway')
                            this.router.navigate(['/lessons/student']);
                        }

                }, err => {

                        // error on customer details stage
                        const formErrors = this.createFormErrors();
                        const message = err.message;
                        formErrors.common.push(message);
                        formErrors.assignServerFieldErrors(err.formErrors);
                        this.formErrors$.next(formErrors);
                });

        }, err => {

                if (err instanceof AppError) {

                    // error on login stage
                    const formErrors = this.createFormErrors();
                    const message = err.message;
                    formErrors.common.push(message);
                    formErrors.assignServerFieldErrors(err.formErrors);
                    this.formErrors$.next(formErrors);

                } else {
                    throw err;
                }
        });
    }

    handleLogout() {
        this.authService.logout().subscribe(() => {
            this.customerService.setAuthCustomer(null);
            this.customerService.setCurrentCustomer(null);
        });
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private setView(currentUrl) {
        switch (currentUrl) {
            case('login'):
                console.log('Performing logout');
                this.handleLogout();
                this.view = currentUrl;
                break;
            default:
                break;
        }
    }
}
