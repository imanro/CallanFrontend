import {Component, OnDestroy, OnInit} from '@angular/core';
import {CallanCustomer} from '../shared/models/customer.model';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {CallanAuthService} from '../shared/services/auth.service';
import {catchError} from 'rxjs/operators';
import {CallanFormErrors} from '../shared/models/form-errors.model';
import {CallanError} from '../shared/models/error.model';

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
        private authService: CallanAuthService
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
                this.authService.getAuthCustomer()
                    .subscribe(customer => {

                    // now, we can redirect to main area
                    console.log('redirect', customer);
                    this.location.go('/lessons');

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

    private createFormErrors() {
        return new CallanFormErrors();
    }

    private setView(currentUrl) {
        switch (currentUrl) {
            case('login'):
                this.view = currentUrl;
                break;
            default:
                break;
        }
    }
}
