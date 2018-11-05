import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {AppError} from './shared/models/error.model';
import {CallanAuthService} from './shared/services/auth.service';
import {CallanCustomerService} from './shared/services/customer.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) {

    }

    handleError(error) {
        console.log('handling error');

        let status = 0;

        if ( error instanceof HttpErrorResponse ) {
            status = error.status;

        } else if ( error instanceof AppError ) {
            status = error.httpStatus;
        }

        if (status === 401 || status === 403) {
            // logout user
            this.logoutAndRedirect();
            throw error;

        } else {

            if (error.message && error.message.indexOf('token') !== -1) {
                console.log('Seems like token-related error, logging out');
                this.logoutAndRedirect();
            } else {
                console.log('This is another kind of error', error, typeof(error), error.message);
                throw error;
            }
        }
    }

    private logoutAndRedirect()
    {
        const router = this.injector.get(Router);

        // this is not logout page
        if (router.routerState.snapshot.url.indexOf('/auth/logout') === -1) {

            const authService = this.injector.get(CallanAuthService);
            const customerService = this.injector.get(CallanCustomerService);

            authService.logout().subscribe(() => {
                customerService.setAuthCustomer(null);
                customerService.setCurrentCustomer(null);

                console.log('navigating');

                router.navigate(['/auth/login'], {relativeTo: null, replaceUrl: true}).then(() => {
                    console.log('nav succ');
                    // CHECK ME
                    // window.location.reload();

                }, () => {
                    console.log('nav err');
                });
            });
        }


    }
}
