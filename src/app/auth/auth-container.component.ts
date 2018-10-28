import {Component, OnDestroy, OnInit} from '@angular/core';
import {CallanCustomer} from '../shared/models/customer.model';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanAuthService} from '../shared/services/auth.service';
import {CallanFormErrors} from '../shared/models/form-errors.model';
import {CallanError} from '../shared/models/error.model';
import {CallanCustomerService} from '../shared/services/customer.service';
import {CallanRoleNameEnum} from '../shared/enums/role.name.enum';

@Component({
    selector: 'app-callan-auth-container',
    templateUrl: './auth-container.component.html',
    styleUrls: ['./auth-container.component.scss']
})


export class CallanAuthContainerComponent implements OnInit, OnDestroy {

    view: string;
    formErrors$ = new BehaviorSubject<CallanFormErrors>(null);
    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private authService: CallanAuthService,
        private customerService: CallanCustomerService
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
                    .subscribe(customer => {

                        console.log('received!');
                        // now, we can redirect to main area

                        // redirection will depend on the customer's roles

                        // admin: customer-manager, teacher, student: lesson-manager, support: claim-manager
                        if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.ADMIN)) {
                            console.log('will redirect to customers');
                            this.router.navigate(['/customers']);

                        } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.STUDENT) ||
                            CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.TEACHER)) {
                            console.log('redirect to lessons')
                            this.router.navigate(['/lessons']);

                        } else if (CallanCustomerService.hasCustomerRole(customer, CallanRoleNameEnum.SUPPORT)) {
                            console.log('redirect to claim-manager');
                            this.router.navigate(['/lessons']);

                        } else {
                            console.log('redirect to lessons anyway')
                            this.router.navigate(['/lessons']);
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

                if (err instanceof CallanError) {

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
        return new CallanFormErrors();
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
