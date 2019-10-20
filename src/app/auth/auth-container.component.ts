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
import {catchError, map, mergeMap, finalize} from 'rxjs/operators';
import {of as observableOf} from 'rxjs';

@Component({
    selector: 'app-callan-auth-container',
    templateUrl: './auth-container.component.html',
    styleUrls: ['./auth-container.component.scss']
})


export class CallanAuthContainerComponent implements OnInit, OnDestroy {

    view: string;

    formErrors$ = new BehaviorSubject<AppFormErrors>(null);

    isLoading = false;

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
        this.isLoading = true;

        this.authService.login(loginCustomer.email, loginCustomer.password)
            .pipe(
                mergeMap(() => {
                    return this.customerService.getAuthCustomer();
                }),
                mergeMap(customer => {
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
                        console.log('redirect to lessons anyway');
                        this.router.navigate(['/lessons/student']);
                    }

                    return observableOf();

                }),
                catchError(err => {

                    // close spinner only in the case of error
                    this.isLoading = false;

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

                    console.log(err, 'occured');
                    return observableOf();

                })
            )
            .subscribe(() => {
                console.log('processing');
            });
    }

    handleLogout() {
        this.authService.logout().subscribe(() => {
            this.customerService.setAuthCustomer(null);
            this.customerService.setCurrentCustomer(null);
            //
        });
    }

    private createFormErrors() {
        return new AppFormErrors();
    }

    private setView(currentUrl) {
        switch (currentUrl) {
            case('login'):
                console.log('Performing logout and showing login');
                this.handleLogout();
                this.view = currentUrl;
                break;
            case('logout'):
                console.log('Performing logout');
                this.handleLogout();
                this.view = currentUrl;
                this.router.navigate(['/']);
                break;
            default:
                break;
        }
    }
}
