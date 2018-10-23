import {Injectable} from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import {CallanAuthService} from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public auth: CallanAuthService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.auth.getAuthToken() !== null) {
            request = request.clone({
                setHeaders: {
                    Authorization: `${this.auth.getAuthToken()}`
                }
            });
        }
        return next.handle(request);
    }
}
